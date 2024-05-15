// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * Out of the IERC20 interface, only the transfer and transferFrom functions are used.
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
  * Actors:
  * - Spender - the address that spends the funds
  * - Funder - the address that deposits the funds
  */

interface ILockPayment {
    struct DepositView {
        uint256 id;     //unique id
        uint64 nonce;  //nonce unique for each funder
        address funder; //address that can spend the funds provided by customer
        address spender; //address that can spend the funds provided by customer
        uint128 amount; //remaining funds locked
        uint64 validTo; //after this timestamp funds can be returned to customer
    }

    function closeDeposit(uint256 id) external;

    function terminateDeposit(uint64 nonce) external;

    function depositSingleTransfer(uint256 id, address addr, uint128 amount) external;

    function depositTransfer(uint256 id, bytes32[] calldata payments) external;

    function depositSingleTransferAndClose(uint256 id, address addr, uint128 amount) external;

    function depositTransferAndClose(uint256 id, bytes32[] calldata payments) external;

    function getMyDeposit(uint64 nonce) external view returns (DepositView memory);

    function getDeposit(uint256 id) external view returns (DepositView memory);

    function getDepositByNonce(uint64 nonce, address funder) external view returns (DepositView memory);

    function getValidateDepositSignature() external pure returns (string memory);
}

/**
 * @dev This contract is part of GLM payment system. Visit https://golem.network for details.
 * Be careful when interacting with this contract, because it has no exit mechanism. Any assets sent directly to this contract will be lost.
 */
contract LockPayment is ILockPayment {
    IERC20 public GLM;

    struct Deposit {
        address spender; //address that can spend the funds provided by customer
        uint128 amount; //remaining funds locked
        uint128 feeAmount; //fee amount locked for spender
        uint64 validTo; //after this timestamp funds can be returned to customer
    }

    uint64 immutable public CONTRACT_VERSION = 0x2;
    uint64 immutable public CONTRACT_ID = 0x167583000; //6028800000
    // CONTRACT_ID_AND_VERSION = CONTRACT_ID ^ CONTRACT_VERSION
    // CONTRACT_ID_AND_VERSION = CONTRACT_ID | CONTRACT_VERSION
    // CONTRACT_ID_AND_VERSION = CONTRACT_ID + CONTRACT_VERSION
    uint64 immutable public CONTRACT_ID_AND_VERSION = 0x167583002; //6028800002

    event DepositCreated(uint256 id, address spender);
    event DepositExtended(uint256 id, address spender);
    event DepositClosed(uint256 id, address spender);
    event DepositTerminated(uint256 id, address spender);

    // deposit is stored using arbitrary id
    // maybe should be private? But no point to hide it
    mapping(uint256 => Deposit) public deposits;

    constructor(IERC20 _GLM) {
        //check if consts are correct during deployment
        require(CONTRACT_ID_AND_VERSION == CONTRACT_ID | CONTRACT_VERSION);
        //id has special property that CONTRACT_ID | CONTRACT_VERSION == CONTRACT_ID + CONTRACT_VERSION
        require(CONTRACT_ID | CONTRACT_VERSION == CONTRACT_ID + CONTRACT_VERSION);
        GLM = _GLM;
    }

    function idFromNonce(uint64 nonce) public view returns (uint256) {

        return idFromNonceAndFunder(nonce, msg.sender);
    }

    function idFromNonceAndFunder(uint64 nonce, address funder) public pure returns (uint256) {
        return (uint256(uint160(funder)) << 96) ^ uint256(nonce);
    }

    function nonceFromId(uint256 id) public pure returns (uint64) {
        return uint64(id);
    }

    function funderFromId(uint256 id) public pure returns (address) {
        return address(uint160(id >> 96));
    }

    function getMyDeposit(uint64 nonce) public view returns (DepositView memory) {
        Deposit memory deposit = deposits[idFromNonce(nonce)];

        return DepositView(idFromNonce(nonce), nonce, funderFromId(idFromNonce(nonce)), deposit.spender, deposit.amount, deposit.validTo);
    }

    function getDeposit(uint256 id) public view returns (DepositView memory) {
        Deposit memory deposit = deposits[id];
        return DepositView(id, nonceFromId(id), funderFromId(id), deposit.spender, deposit.amount, deposit.validTo);
    }

    function getDepositByNonce(uint64 nonce, address funder) public view returns (DepositView memory) {
        uint256 id = idFromNonceAndFunder(nonce, funder);
        Deposit memory deposit = deposits[id];
        return DepositView(id, nonceFromId(id), funderFromId(id), deposit.spender, deposit.amount, deposit.validTo);
    }

    // createDeposit - Customer locks funds for usage by spender
    //
    // id - unique id (build from Funder address and nonce)
    // spender - the address that is allowed to spend the funds regardless of time
    // amount - amount of GLM tokens to lock
    // flatFeeAmount - amount of GLM tokens given to spender (non-refundable). Fee is claimed by spender when called payoutSingle or payoutMultiple first time.
    // percentFee - percent fee as percent of amount (given in parts/per million), so 1000 gives 0.1 %.
    //              if given negative it is deducted from flatFeeAmount
    //              IT IS NOT IMPLEMENTED IN THIS IMPLEMENTATION
    // blockNo - block number until which funds are guaranteed to be locked for spender.
    //           Spender still can use the funds after this block,
    //           but customer can request the funds to be returned clearing deposit after (or equal to) this block number.
    function createDeposit(uint64 nonce, address spender, uint128 amount, uint128 flatFeeAmount, int64 percentFee, uint64 validToTimestamp) public returns (uint256) {
        //check if id is not used
        uint256 id = idFromNonce(nonce);
        require(deposits[id].amount == 0, "deposits[id].amount == 0");
        require(amount > 0, "amount > 0");
        require(percentFee == 0, "percentFee == 0 for this contract");
        require(spender != address(0), "spender cannot be null address");
        require(msg.sender != spender, "spender cannot be funder");
        require(GLM.transferFrom(msg.sender, address(this), amount + flatFeeAmount), "transferFrom failed");
        deposits[id] = Deposit(spender, amount, flatFeeAmount, validToTimestamp);
        emit DepositCreated(id, spender);
        return id;
    }

    function extendDeposit(uint64 nonce, uint128 additionalAmount, uint128 additionalFlatFee, uint64 validToTimestamp) public {
        uint256 id = idFromNonce(nonce);
        Deposit memory deposit = deposits[id];
        require(GLM.transferFrom(msg.sender, address(this), additionalAmount + additionalFlatFee), "transferFrom failed");
        require(deposit.validTo <= validToTimestamp, "deposit.validTo <= validTo");
        deposit.amount += additionalAmount;
        deposit.feeAmount += additionalFlatFee;
        deposit.validTo = validToTimestamp;
        deposits[id] = deposit;
        emit DepositExtended(id, deposit.spender);
    }

    // Spender can close deposit anytime claiming fee and returning rest of funds to Funder
    function closeDeposit(uint256 id) public {
        Deposit memory deposit = deposits[id];
        // customer cannot return funds before block_no
        // sender can return funds at any time
        require(msg.sender == deposit.spender);
        require(GLM.transfer(funderFromId(id), deposit.amount + deposit.feeAmount), "return transfer failed");
        if (deposit.feeAmount > 0) {
            require(GLM.transfer(deposit.spender, deposit.feeAmount), "fee transfer failed");
            deposit.feeAmount = 0;
        }
        deposits[id].amount = 0;
        deposits[id].feeAmount = 0;
        emit DepositClosed(id, deposit.spender);
    }

    // Funder can terminate deposit after validTo date elapses
    function terminateDeposit(uint64 nonce) public {
        uint256 id = idFromNonce(nonce);
        Deposit memory deposit = deposits[id];
        //The following check is not needed (Funder is in id), but added for clarity
        require(funderFromId(id) == msg.sender, "funderFromId(id) == msg.sender");
        // Check for time condition
        require(deposit.validTo < block.timestamp, "deposit.validTo < block.timestamp");
        require(GLM.transfer(msg.sender, deposit.amount + deposit.feeAmount), "transfer failed");
        deposits[id].amount = 0;
        deposits[id].feeAmount = 0;
        emit DepositTerminated(id, deposit.spender);
    }

    function depositSingleTransfer(uint256 id, address addr, uint128 amount) public {
        Deposit memory deposit = deposits[id];
        require(msg.sender == deposit.spender, "msg.sender == deposit.spender");
        require(addr != deposit.spender, "cannot transfer to spender");
        require(GLM.transfer(addr, amount), "transferFrom failed");
        require(deposit.amount >= amount, "deposit.amount >= amount");
        deposit.amount -= amount;
        deposits[id].amount = deposit.amount;
    }

    function depositTransfer(uint256 id, bytes32[] calldata payments) public {
        Deposit memory deposit = deposits[id];
        require(msg.sender == deposit.spender, "msg.sender == deposit.spender");

        for (uint32 i = 0; i < payments.length; ++i) {
            // A payment contains compressed data:
            // first 160 bits (20 bytes) is an address.
            // following 96 bits (12 bytes) is a value,
            bytes32 payment = payments[i];
            address addr = address(bytes20(payment));
            uint128 amount = uint128(uint256(payment) % 2 ** 96);
            require(addr != deposit.spender, "cannot transfer to spender");
            require(GLM.transfer(addr, amount), "transferFrom failed");
            require(deposit.amount >= amount, "deposit.amount >= amount");
            deposit.amount -= amount;
        }

        deposits[id].amount = deposit.amount;
    }

    function depositSingleTransferAndClose(uint256 id, address addr, uint128 amount) public {
        depositSingleTransfer(id, addr, amount);
        closeDeposit(id);
    }

    function depositTransferAndClose(uint256 id, bytes32[] calldata payments) public {
        depositTransfer(id, payments);
        closeDeposit(id);
    }

    //validateDeposit - validate extra fields not covered by common validation
    function validateDeposit(uint256 id, uint128 flatFeeAmount, int64 percentFee) public view {
        Deposit memory deposit = deposits[id];
        require(flatFeeAmount == deposit.feeAmount, "flatFeeAmount == deposit.feeAmount");
        require(percentFee == 0, "percentFee == 0 for this contract");
    }

    function getValidateDepositSignature() public pure returns (string memory) {
        // example implementation
        return '[{"type": "uint256", "name": "id"}, {"type": "uint128", "name": "flatFeeAmount"}, {"type": "int64", "name": "percentFee"}]';
    }
}
