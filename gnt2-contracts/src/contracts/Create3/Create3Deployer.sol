// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.28;

/**
 * @dev Elliptic Curve Digital Signature Algorithm (ECDSA) operations.
 *
 * These functions can be used to verify that a message was signed by the holder
 * of the private keys of a given address.
 */
library ECDSA {
    enum RecoverError {
        NoError,
        InvalidSignature,
        InvalidSignatureLength,
        InvalidSignatureS
    }

    /**
     * @dev The signature derives the `address(0)`.
     */
    error ECDSAInvalidSignature();

    /**
     * @dev The signature has an invalid length.
     */
    error ECDSAInvalidSignatureLength(uint256 length);

    /**
     * @dev The signature has an S value that is in the upper half order.
     */
    error ECDSAInvalidSignatureS(bytes32 s);

    /**
     * @dev Returns the address that signed a hashed message (`hash`) with `signature` or an error. This will not
     * return address(0) without also returning an error description. Errors are documented using an enum (error type)
     * and a bytes32 providing additional information about the error.
     *
     * If no error is returned, then the address can be used for verification purposes.
     *
     * The `ecrecover` EVM precompile allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {MessageHashUtils-toEthSignedMessageHash} on it.
     *
     * Documentation for signature generation:
     * - with https://web3js.readthedocs.io/en/v1.3.4/web3-eth-accounts.html#sign[Web3.js]
     * - with https://docs.ethers.io/v5/api/signer/#Signer-signMessage[ethers]
     */
    function tryRecover(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address recovered, RecoverError err, bytes32 errArg) {
        if (signature.length == 65) {
            bytes32 r;
            bytes32 s;
            uint8 v;
            // ecrecover takes the signature parameters, and the only way to get them
            // currently is to use assembly.
            assembly ("memory-safe") {
                r := mload(add(signature, 0x20))
                s := mload(add(signature, 0x40))
                v := byte(0, mload(add(signature, 0x60)))
            }
            return tryRecover(hash, v, r, s);
        } else {
            return (address(0), RecoverError.InvalidSignatureLength, bytes32(signature.length));
        }
    }

    /**
     * @dev Returns the address that signed a hashed message (`hash`) with
     * `signature`. This address can then be used for verification purposes.
     *
     * The `ecrecover` EVM precompile allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {MessageHashUtils-toEthSignedMessageHash} on it.
     */
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        (address recovered, RecoverError error, bytes32 errorArg) = tryRecover(hash, signature);
        _throwError(error, errorArg);
        return recovered;
    }

    /**
     * @dev Overload of {ECDSA-tryRecover} that receives the `r` and `vs` short-signature fields separately.
     *
     * See https://eips.ethereum.org/EIPS/eip-2098[ERC-2098 short signatures]
     */
    function tryRecover(
        bytes32 hash,
        bytes32 r,
        bytes32 vs
    ) internal pure returns (address recovered, RecoverError err, bytes32 errArg) {
        unchecked {
            bytes32 s = vs & bytes32(0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        // We do not check for an overflow here since the shift operation results in 0 or 1.
            uint8 v = uint8((uint256(vs) >> 255) + 27);
            return tryRecover(hash, v, r, s);
        }
    }

    /**
     * @dev Overload of {ECDSA-recover} that receives the `r and `vs` short-signature fields separately.
     */
    function recover(bytes32 hash, bytes32 r, bytes32 vs) internal pure returns (address) {
        (address recovered, RecoverError error, bytes32 errorArg) = tryRecover(hash, r, vs);
        _throwError(error, errorArg);
        return recovered;
    }

    /**
     * @dev Overload of {ECDSA-tryRecover} that receives the `v`,
     * `r` and `s` signature fields separately.
     */
    function tryRecover(
        bytes32 hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address recovered, RecoverError err, bytes32 errArg) {
        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (301): 0 < s < secp256k1n ÷ 2 + 1, and for v in (302): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            return (address(0), RecoverError.InvalidSignatureS, s);
        }

        // If the signature is valid (and not malleable), return the signer address
        address signer = ecrecover(hash, v, r, s);
        if (signer == address(0)) {
            return (address(0), RecoverError.InvalidSignature, bytes32(0));
        }

        return (signer, RecoverError.NoError, bytes32(0));
    }

    /**
     * @dev Overload of {ECDSA-recover} that receives the `v`,
     * `r` and `s` signature fields separately.
     */
    function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address) {
        (address recovered, RecoverError error, bytes32 errorArg) = tryRecover(hash, v, r, s);
        _throwError(error, errorArg);
        return recovered;
    }

    /**
     * @dev Optionally reverts with the corresponding custom error according to the `error` argument provided.
     */
    function _throwError(RecoverError error, bytes32 errorArg) private pure {
        if (error == RecoverError.NoError) {
            return; // no error: do nothing
        } else if (error == RecoverError.InvalidSignature) {
            revert ECDSAInvalidSignature();
        } else if (error == RecoverError.InvalidSignatureLength) {
            revert ECDSAInvalidSignatureLength(uint256(errorArg));
        } else if (error == RecoverError.InvalidSignatureS) {
            revert ECDSAInvalidSignatureS(errorArg);
        }
    }
}

/**
 * @title CreateX Factory Smart Contract
 * @author pcaversaccio (https://web.archive.org/web/20230921103111/https://pcaversaccio.com/)
 * @custom:coauthor Matt Solomon (https://web.archive.org/web/20230921103335/https://mattsolomon.dev/)
 * @notice Factory smart contract to make easier and safer usage of the
 * `CREATE` (https://web.archive.org/web/20230921103540/https://www.evm.codes/#f0?fork=shanghai) and `CREATE2`
 * (https://web.archive.org/web/20230921103540/https://www.evm.codes/#f5?fork=shanghai) EVM opcodes as well as of
 * `CREATE3`-based (https://web.archive.org/web/20230921103920/https://github.com/ethereum/EIPs/pull/3171) contract creations.
 * @dev To simplify testing of non-public variables and functions, we use the `internal`
 * function visibility specifier `internal` for all variables and functions, even though
 * they could technically be `private` since we do not expect anyone to inherit from
 * the `CreateX` contract.
 * @custom:security-contact See https://web.archive.org/web/20230921105029/https://raw.githubusercontent.com/pcaversaccio/createx/main/SECURITY.md.
 */

// Additional changes are done to ease nice addresses mining
contract Create3Deployer {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "Only the owner can change the owner");

        owner = newOwner;
    }

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                         IMMUTABLES                         */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
    /**
     * @dev Caches the contract address at construction, to be used for the custom errors.
     */
    address internal immutable _SELF = address(this);

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                            TYPES                           */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    /**
     * @dev Struct for the `payable` amounts in a deploy-and-initialise call.
     */
    struct Values {
        uint256 constructorAmount;
        uint256 initCallAmount;
    }

    /**
     * @dev Enum for the selection of a permissioned deploy protection.
     */
    enum SenderBytes {
        MsgSender,
        ZeroAddress,
        Random
    }

    /**
     * @dev Enum for the selection of a cross-chain redeploy protection.
     */
    enum RedeployProtectionFlag {
        True,
        False,
        Unspecified
    }

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                           EVENTS                           */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    /**
     * @dev Event that is emitted when a contract is successfully created.
     * @param newContract The address of the new contract.
     * @param salt The 32-byte random value used to create the contract address.
     */
    event ContractCreation(address indexed newContract, bytes32 indexed salt);

    /**
     * @dev Event that is emitted when a contract is successfully created.
     * @param newContract The address of the new contract.
     */
    event ContractCreation(address indexed newContract);

    /**
     * @dev Event that is emitted when a `CREATE3` proxy contract is successfully created.
     * @param newContract The address of the new proxy contract.
     * @param salt The 32-byte random value used to create the proxy address.
     */
    event Create3ProxyContractCreation(address indexed newContract, bytes32 indexed salt);

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                        CUSTOM ERRORS                       */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    /**
     * @dev Error that occurs when the contract creation failed.
     * @param emitter The contract that emits the error.
     */
    error FailedContractCreation(address emitter);

    /**
     * @dev Error that occurs when the contract initialisation call failed.
     * @param emitter The contract that emits the error.
     * @param revertData The data returned by the failed initialisation call.
     */
    error FailedContractInitialisation(address emitter, bytes revertData);

    /**
     * @dev Error that occurs when the salt value is invalid.
     * @param emitter The contract that emits the error.
     */
    error InvalidSalt(address emitter);

    /**
     * @dev Error that occurs when the nonce value is invalid.
     * @param emitter The contract that emits the error.
     */
    error InvalidNonceValue(address emitter);

    /**
     * @dev Error that occurs when transferring ether has failed.
     * @param emitter The contract that emits the error.
     * @param revertData The data returned by the failed ether transfer.
     */
    error FailedEtherTransfer(address emitter, bytes revertData);

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                           CREATE3                          */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    /**
     * @dev Deploys a new contract via employing the `CREATE3` pattern (i.e. without an initcode
     * factor) and using the salt value `salt`, the creation bytecode `initCode`, and `msg.value`
     * as inputs. In order to save deployment costs, we do not sanity check the `initCode` length.
     * Note that if `msg.value` is non-zero, `initCode` must have a `payable` constructor. This
     * implementation is based on Solmate:
     * https://web.archive.org/web/20230921113832/https://raw.githubusercontent.com/transmissions11/solmate/e8f96f25d48fe702117ce76c79228ca4f20206cb/src/utils/CREATE3.sol.
     * @param salt The 32-byte random value used to create the proxy contract address.
     * @param initCode The creation bytecode.
     * @return newContract The 20-byte address where the contract was deployed.
     * @custom:security We strongly recommend implementing a permissioned deploy protection by setting
     * the first 20 bytes equal to `msg.sender` in the `salt` to prevent maliciously intended frontrun
     * proxy deployments on other chains.
     */
    function _deployCreate3(bytes32 salt, bytes memory initCode) private returns (address newContract) {
        require(owner == msg.sender, "Only the owner can deploy contracts");
        bytes32 guardedSalt = _guard({salt: salt});
        bytes memory proxyChildBytecode = hex"67_36_3d_3d_37_36_3d_34_f0_3d_52_60_08_60_18_f3";
        address proxy;
        assembly ("memory-safe") {
            proxy := create2(0, add(proxyChildBytecode, 32), mload(proxyChildBytecode), guardedSalt)
        }
        if (proxy == address(0)) {
            revert FailedContractCreation({emitter: _SELF});
        }
        emit Create3ProxyContractCreation({newContract: proxy, salt: guardedSalt});

        newContract = computeCreate3Address({salt: guardedSalt});
        (bool success,) = proxy.call{value: msg.value}(initCode);
        _requireSuccessfulContractCreation({success: success, newContract: newContract});
        emit ContractCreation({newContract: newContract});
    }
    function deployCreate3(bytes32 salt, bytes memory initCode) public returns (address newContract) {
        require(owner == msg.sender, "Only the owner can deploy contracts");
        return _deployCreate3(salt, initCode);
    }
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }
    function deploySignedCreate3(bytes32 salt, bytes memory initCode, address signer, bytes memory signature) public returns (address newContract) {
        require(owner == signer, "Only the owner can sign transactions");

        bytes32 messageHash = keccak256(abi.encodePacked(signer, msg.sender, salt, initCode));
        bytes32 digest = getEthSignedMessageHash(messageHash); // EIP-191

        require(ECDSA.recover(digest, signature) == signer, "Invalid signature");

        return _deployCreate3(salt, initCode);
    }

    function deployCreate2(bytes32 salt, bytes memory initCode) public payable returns (address newContract) {
        require(owner == msg.sender, "Only the owner can deploy contracts");

        bytes32 guardedSalt = _guard({salt: salt});
        assembly ("memory-safe") {
            newContract := create2(callvalue(), add(initCode, 0x20), mload(initCode), guardedSalt)
        }
        _requireSuccessfulContractCreation({newContract: newContract});
        emit ContractCreation({newContract: newContract, salt: guardedSalt});
    }

    function computeCreate2Address(
        bytes32 salt,
        bytes32 initCodeHash,
        address deployer
    ) public pure returns (address computedAddress) {
        assembly ("memory-safe") {
        // |                      | ↓ ptr ...  ↓ ptr + 0x0B (start) ...  ↓ ptr + 0x20 ...  ↓ ptr + 0x40 ...   |
        // |----------------------|---------------------------------------------------------------------------|
        // | initCodeHash         |                                                        CCCCCCCCCCCCC...CC |
        // | salt                 |                                      BBBBBBBBBBBBB...BB                   |
        // | deployer             | 000000...0000AAAAAAAAAAAAAAAAAAA...AA                                     |
        // | 0xFF                 |            FF                                                             |
        // |----------------------|---------------------------------------------------------------------------|
        // | memory               | 000000...00FFAAAAAAAAAAAAAAAAAAA...AABBBBBBBBBBBBB...BBCCCCCCCCCCCCC...CC |
        // | keccak256(start, 85) |            ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ |
            let ptr := mload(0x40)
            mstore(add(ptr, 0x40), initCodeHash)
            mstore(add(ptr, 0x20), salt)
            mstore(ptr, deployer)
            let start := add(ptr, 0x0b)
            mstore8(start, 0xff)
            computedAddress := keccak256(start, 85)
        }
    }

    /**
     * @dev Deploys a new contract via employing the `CREATE3` pattern (i.e. without an initcode
     * factor) and using the salt value `salt`, the creation bytecode `initCode`, and `msg.value`
     * as inputs. The salt value is calculated pseudo-randomly using a diverse selection of block
     * and transaction properties. This approach does not guarantee true randomness! In order to save
     * deployment costs, we do not sanity check the `initCode` length. Note that if `msg.value` is
     * non-zero, `initCode` must have a `payable` constructor. This implementation is based on Solmate:
     * https://web.archive.org/web/20230921113832/https://raw.githubusercontent.com/transmissions11/solmate/e8f96f25d48fe702117ce76c79228ca4f20206cb/src/utils/CREATE3.sol.
     * @param initCode The creation bytecode.
     * @return newContract The 20-byte address where the contract was deployed.
     */
    function deployCreate3(bytes memory initCode) public payable returns (address newContract) {
        require(owner == msg.sender, "Only the owner can deploy contracts");
        // Note that the safeguarding function `_guard` is called as part of the overloaded function
        // `deployCreate3`.
        newContract = deployCreate3({salt: _generateSalt(), initCode: initCode});
    }


    /**
     * @dev Deploys and initialises a new contract via employing the `CREATE3` pattern (i.e. without
     * an initcode factor) and using the salt value `salt`, the creation bytecode `initCode`, the
     * initialisation code `data`, the struct for the `payable` amounts `values`, the refund address
     * `refundAddress`, and `msg.value` as inputs. In order to save deployment costs, we do not sanity
     * check the `initCode` length. Note that if `values.constructorAmount` is non-zero, `initCode` must
     * have a `payable` constructor. This implementation is based on Solmate:
     * https://web.archive.org/web/20230921113832/https://raw.githubusercontent.com/transmissions11/solmate/e8f96f25d48fe702117ce76c79228ca4f20206cb/src/utils/CREATE3.sol.
     * @param salt The 32-byte random value used to create the proxy contract address.
     * @param initCode The creation bytecode.
     * @param data The initialisation code that is passed to the deployed contract.
     * @param values The specific `payable` amounts for the deployment and initialisation call.
     * @param refundAddress The 20-byte address where any excess ether is returned to.
     * @return newContract The 20-byte address where the contract was deployed.
     * @custom:security This function allows for reentrancy, however we refrain from adding
     * a mutex lock to keep it as use-case agnostic as possible. Please ensure at the protocol
     * level that potentially malicious reentrant calls do not affect your smart contract system.
     * Furthermore, we strongly recommend implementing a permissioned deploy protection by setting
     * the first 20 bytes equal to `msg.sender` in the `salt` to prevent maliciously intended frontrun
     * proxy deployments on other chains.
     */
    function deployCreate3AndInit(
        bytes32 salt,
        bytes memory initCode,
        bytes memory data,
        Values memory values,
        address refundAddress
    ) public payable returns (address newContract) {
        require(owner == msg.sender, "Only the owner can deploy contracts");
        bytes32 guardedSalt = _guard({salt: salt});
        bytes memory proxyChildBytecode = hex"67_36_3d_3d_37_36_3d_34_f0_3d_52_60_08_60_18_f3";
        address proxy;
        assembly ("memory-safe") {
            proxy := create2(0, add(proxyChildBytecode, 32), mload(proxyChildBytecode), guardedSalt)
        }
        if (proxy == address(0)) {
            revert FailedContractCreation({emitter: _SELF});
        }
        emit Create3ProxyContractCreation({newContract: proxy, salt: guardedSalt});

        newContract = computeCreate3Address({salt: guardedSalt});
        (bool success,) = proxy.call{value: values.constructorAmount}(initCode);
        _requireSuccessfulContractCreation({success: success, newContract: newContract});
        emit ContractCreation({newContract: newContract});

        bytes memory returnData;
        (success, returnData) = newContract.call{value: values.initCallAmount}(data);
        if (!success) {
            revert FailedContractInitialisation({emitter: _SELF, revertData: returnData});
        }

        if (_SELF.balance != 0) {
            // Any wei amount previously forced into this contract (e.g. by using the `SELFDESTRUCT`
            // opcode) will be part of the refund transaction.
            (success, returnData) = refundAddress.call{value: _SELF.balance}("");
            if (!success) {
                revert FailedEtherTransfer({emitter: _SELF, revertData: returnData});
            }
        }
    }

    /**
     * @dev Deploys and initialises a new contract via employing the `CREATE3` pattern (i.e. without
     * an initcode factor) and using the salt value `salt`, the creation bytecode `initCode`, the
     * initialisation code `data`, the struct for the `payable` amounts `values`, and `msg.value` as
     * inputs. In order to save deployment costs, we do not sanity check the `initCode` length. Note
     * that if `values.constructorAmount` is non-zero, `initCode` must have a `payable` constructor,
     * and any excess ether is returned to `msg.sender`. This implementation is based on Solmate:
     * https://web.archive.org/web/20230921113832/https://raw.githubusercontent.com/transmissions11/solmate/e8f96f25d48fe702117ce76c79228ca4f20206cb/src/utils/CREATE3.sol.
     * @param salt The 32-byte random value used to create the proxy contract address.
     * @param initCode The creation bytecode.
     * @param data The initialisation code that is passed to the deployed contract.
     * @param values The specific `payable` amounts for the deployment and initialisation call.
     * @return newContract The 20-byte address where the contract was deployed.
     * @custom:security This function allows for reentrancy, however we refrain from adding
     * a mutex lock to keep it as use-case agnostic as possible. Please ensure at the protocol
     * level that potentially malicious reentrant calls do not affect your smart contract system.
     * Furthermore, we strongly recommend implementing a permissioned deploy protection by setting
     * the first 20 bytes equal to `msg.sender` in the `salt` to prevent maliciously intended frontrun
     * proxy deployments on other chains.
     */
    function deployCreate3AndInit(
        bytes32 salt,
        bytes memory initCode,
        bytes memory data,
        Values memory values
    ) public payable returns (address newContract) {
        require(owner == msg.sender, "Only the owner can deploy contracts");
        // Note that the safeguarding function `_guard` is called as part of the overloaded function
        // `deployCreate3AndInit`.
        newContract = deployCreate3AndInit({
            salt: salt,
            initCode: initCode,
            data: data,
            values: values,
            refundAddress: msg.sender
        });
    }

    /**
     * @dev Deploys and initialises a new contract via employing the `CREATE3` pattern (i.e. without
     * an initcode factor) and using the creation bytecode `initCode`, the initialisation code `data`,
     * the struct for the `payable` amounts `values`, the refund address `refundAddress`, and `msg.value`
     * as inputs. The salt value is calculated pseudo-randomly using a diverse selection of block and
     * transaction properties. This approach does not guarantee true randomness! In order to save deployment
     * costs, we do not sanity check the `initCode` length. Note that if `values.constructorAmount` is non-zero,
     * `initCode` must have a `payable` constructor. This implementation is based on Solmate:
     * https://web.archive.org/web/20230921113832/https://raw.githubusercontent.com/transmissions11/solmate/e8f96f25d48fe702117ce76c79228ca4f20206cb/src/utils/CREATE3.sol.
     * @param initCode The creation bytecode.
     * @param data The initialisation code that is passed to the deployed contract.
     * @param values The specific `payable` amounts for the deployment and initialisation call.
     * @param refundAddress The 20-byte address where any excess ether is returned to.
     * @return newContract The 20-byte address where the contract was deployed.
     * @custom:security This function allows for reentrancy, however we refrain from adding
     * a mutex lock to keep it as use-case agnostic as possible. Please ensure at the protocol
     * level that potentially malicious reentrant calls do not affect your smart contract system.
     */
    function deployCreate3AndInit(
        bytes memory initCode,
        bytes memory data,
        Values memory values,
        address refundAddress
    ) public payable returns (address newContract) {
        require(owner == msg.sender, "Only the owner can deploy contracts");
        // Note that the safeguarding function `_guard` is called as part of the overloaded function
        // `deployCreate3AndInit`.
        newContract = deployCreate3AndInit({
            salt: _generateSalt(),
            initCode: initCode,
            data: data,
            values: values,
            refundAddress: refundAddress
        });
    }

    /**
     * @dev Deploys and initialises a new contract via employing the `CREATE3` pattern (i.e. without
     * an initcode factor) and using the creation bytecode `initCode`, the initialisation code `data`,
     * the struct for the `payable` amounts `values`, `msg.value` as inputs. The salt value is calculated
     * pseudo-randomly using a diverse selection of block and transaction properties. This approach does
     * not guarantee true randomness! In order to save deployment costs, we do not sanity check the `initCode`
     * length. Note that if `values.constructorAmount` is non-zero, `initCode` must have a `payable` constructor,
     * and any excess ether is returned to `msg.sender`. This implementation is based on Solmate:
     * https://web.archive.org/web/20230921113832/https://raw.githubusercontent.com/transmissions11/solmate/e8f96f25d48fe702117ce76c79228ca4f20206cb/src/utils/CREATE3.sol.
     * @param initCode The creation bytecode.
     * @param data The initialisation code that is passed to the deployed contract.
     * @param values The specific `payable` amounts for the deployment and initialisation call.
     * @return newContract The 20-byte address where the contract was deployed.
     * @custom:security This function allows for reentrancy, however we refrain from adding
     * a mutex lock to keep it as use-case agnostic as possible. Please ensure at the protocol
     * level that potentially malicious reentrant calls do not affect your smart contract system.
     */
    function deployCreate3AndInit(
        bytes memory initCode,
        bytes memory data,
        Values memory values
    ) public payable returns (address newContract) {
        require(owner == msg.sender, "Only the owner can deploy contracts");
        // Note that the safeguarding function `_guard` is called as part of the overloaded function
        // `deployCreate3AndInit`.
        newContract = deployCreate3AndInit({
            salt: _generateSalt(),
            initCode: initCode,
            data: data,
            values: values,
            refundAddress: msg.sender
        });
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via `deployer` using
     * the `CREATE3` pattern (i.e. without an initcode factor). Any change in the `salt` value will
     * result in a new destination address. This implementation is based on Solady:
     * https://web.archive.org/web/20230921114120/https://raw.githubusercontent.com/Vectorized/solady/1c1ac4ad9c8558001e92d8d1a7722ef67bec75df/src/utils/CREATE3.sol.
     * @param salt The 32-byte random value used to create the proxy contract address.
     * @param deployer The 20-byte deployer address.
     * @return computedAddress The 20-byte address where a contract will be stored.
     */
    function computeCreate3Address(bytes32 salt, address deployer) public pure returns (address computedAddress) {
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            mstore(0x00, deployer)
            mstore8(0x0b, 0xff)
            mstore(0x20, salt)
            mstore(
                0x40,
                hex"21_c3_5d_be_1b_34_4a_24_88_cf_33_21_d6_ce_54_2f_8e_9f_30_55_44_ff_09_e4_99_3a_62_31_9a_49_7c_1f"
            )
            mstore(0x14, keccak256(0x0b, 0x55))
            mstore(0x40, ptr)
            mstore(0x00, 0xd694)
            mstore8(0x34, 0x01)
            computedAddress := keccak256(0x1e, 0x17)
        }
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via this contract using
     * the `CREATE3` pattern (i.e. without an initcode factor). Any change in the `salt` value will
     * result in a new destination address. This implementation is based on Solady:
     * https://web.archive.org/web/20230921114120/https://raw.githubusercontent.com/Vectorized/solady/1c1ac4ad9c8558001e92d8d1a7722ef67bec75df/src/utils/CREATE3.sol.
     * @param salt The 32-byte random value used to create the proxy contract address.
     * @return computedAddress The 20-byte address where a contract will be stored.
     */
    function computeCreate3Address(bytes32 salt) public view returns (address computedAddress) {
        computedAddress = computeCreate3Address({salt: salt, deployer: _SELF});
    }

    // for easier interaction with the contract
    function guard(bytes32 salt) public pure returns (bytes32) {
        return _guard(salt);
    }

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                      HELPER FUNCTIONS                      */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    //no guard
    function _guard(bytes32 salt) internal pure returns (bytes32 guardedSalt) {
        return salt;
    }

    /**
     * @dev Returns the enum for the selection of a permissioned deploy protection as well as a
     * cross-chain redeploy protection.
     * @param salt The 32-byte random value used to create the contract address.
     * @return senderBytes The 8-byte enum for the selection of a permissioned deploy protection.
     * @return redeployProtectionFlag The 8-byte enum for the selection of a cross-chain redeploy
     * protection.
     */
    function _parseSalt(
        bytes32 salt
    ) internal view returns (SenderBytes senderBytes, RedeployProtectionFlag redeployProtectionFlag) {
        if (address(bytes20(salt)) == msg.sender && bytes1(salt[20]) == hex"01") {
            (senderBytes, redeployProtectionFlag) = (SenderBytes.MsgSender, RedeployProtectionFlag.True);
        } else if (address(bytes20(salt)) == msg.sender && bytes1(salt[20]) == hex"00") {
            (senderBytes, redeployProtectionFlag) = (SenderBytes.MsgSender, RedeployProtectionFlag.False);
        } else if (address(bytes20(salt)) == msg.sender) {
            (senderBytes, redeployProtectionFlag) = (SenderBytes.MsgSender, RedeployProtectionFlag.Unspecified);
        } else if (address(bytes20(salt)) == address(0) && bytes1(salt[20]) == hex"01") {
            (senderBytes, redeployProtectionFlag) = (SenderBytes.ZeroAddress, RedeployProtectionFlag.True);
        } else if (address(bytes20(salt)) == address(0) && bytes1(salt[20]) == hex"00") {
            (senderBytes, redeployProtectionFlag) = (SenderBytes.ZeroAddress, RedeployProtectionFlag.False);
        } else if (address(bytes20(salt)) == address(0)) {
            (senderBytes, redeployProtectionFlag) = (SenderBytes.ZeroAddress, RedeployProtectionFlag.Unspecified);
        } else if (bytes1(salt[20]) == hex"01") {
            (senderBytes, redeployProtectionFlag) = (SenderBytes.Random, RedeployProtectionFlag.True);
        } else if (bytes1(salt[20]) == hex"00") {
            (senderBytes, redeployProtectionFlag) = (SenderBytes.Random, RedeployProtectionFlag.False);
        } else {
            (senderBytes, redeployProtectionFlag) = (SenderBytes.Random, RedeployProtectionFlag.Unspecified);
        }
    }

    /**
     * @dev Returns the `keccak256` hash of `a` and `b` after concatenation.
     * @param a The first 32-byte value to be concatenated and hashed.
     * @param b The second 32-byte value to be concatenated and hashed.
     * @return hash The 32-byte `keccak256` hash of `a` and `b`.
     */
    function _efficientHash(bytes32 a, bytes32 b) internal pure returns (bytes32 hash) {
        assembly ("memory-safe") {
            mstore(0x00, a)
            mstore(0x20, b)
            hash := keccak256(0x00, 0x40)
        }
    }

    /**
     * @dev Generates pseudo-randomly a salt value using a diverse selection of block and
     * transaction properties.
     * @return salt The 32-byte pseudo-random salt value.
     */
    function _generateSalt() internal view returns (bytes32 salt) {
        unchecked {
            salt = keccak256(
                abi.encode(
                // We don't use `block.number - 256` (the maximum value on the EVM) to accommodate
                // any chains that may try to reduce the amount of available historical block hashes.
                // We also don't subtract 1 to mitigate any risks arising from consecutive block
                // producers on a PoS chain. Therefore, we use `block.number - 32` as a reasonable
                // compromise, one we expect should work on most chains, which is 1 epoch on Ethereum
                // mainnet. Please note that if you use this function between the genesis block and block
                // number 31, the block property `blockhash` will return zero, but the returned salt value
                // `salt` will still have a non-zero value due to the hashing characteristic and the other
                // remaining properties.
                    blockhash(block.number - 32),
                    block.coinbase,
                    block.number,
                    block.timestamp,
                    block.prevrandao,
                    block.chainid,
                    msg.sender
                )
            );
        }
    }

    /**
     * @dev Ensures that `newContract` is a non-zero byte contract.
     * @param success The Boolean success condition.
     * @param newContract The 20-byte address where the contract was deployed.
     */
    function _requireSuccessfulContractCreation(bool success, address newContract) internal view {
        // Note that reverting if `newContract == address(0)` isn't strictly necessary here, as if
        // the deployment fails, `success == false` should already hold. However, since the `CreateX`
        // contract should be usable and safe on a wide range of chains, this check is cheap enough
        // that there is no harm in including it (security > gas optimisations). It can potentially
        // protect against unexpected chain behaviour or a hypothetical compiler bug that doesn't surface
        // the call success status properly.
        if (!success || newContract == address(0) || newContract.code.length == 0) {
            revert FailedContractCreation({emitter: _SELF});
        }
    }

    /**
     * @dev Ensures that `newContract` is a non-zero byte contract.
     * @param newContract The 20-byte address where the contract was deployed.
     */
    function _requireSuccessfulContractCreation(address newContract) internal view {
        if (newContract == address(0) || newContract.code.length == 0) {
            revert FailedContractCreation({emitter: _SELF});
        }
    }


}