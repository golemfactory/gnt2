pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import "forge-std/mocks/MockERC20.sol";
import {ILockPayment, LockPayment, IERC20 as L_IERC20} from "../src/contracts/LockPayment/LockPayment.sol";

contract MockToken is MockERC20 {
  constructor(string memory name, string memory symbol, uint8 decimals) {
    initialize(name, symbol, decimals);
  }

  function mint(address to, uint256 value) public virtual {
    _mint(to, value);
  }

  function burn(address from, uint256 value) public virtual {
    _burn(from, value);
  }
}

contract LockPaymentTest is Test {
  MockToken internal token;
  LockPayment internal testee;

  function setUp() public {
    token = new MockToken("Test Golem Network Token", "tGLM", 18);
    testee = new LockPayment(L_IERC20(address(token)));
  }

  function test_DepositCreate() public {
    helper_funds(msg.sender, 3, true);

    uint256 expectedId = uint256(uint160(msg.sender)) << 96;
    address expectedSpender = address(2);
    vm.expectEmit();
    emit LockPayment.DepositCreated(expectedId, expectedSpender);

    vm.prank(msg.sender);
    uint256 depositId = testee.createDeposit(0, address(2), 2, 1, 0);

    assertEq(depositId, expectedId);
    assertEq(token.balanceOf(msg.sender), 0);
    assertEq(token.balanceOf(address(testee)), 3);

    ILockPayment.DepositView memory deposit = testee.getDeposit(depositId);
    assertEq(deposit.id, depositId);
    assertEq(deposit.funder, msg.sender);
    assertEq(deposit.spender, expectedSpender);
    assertEq(deposit.amount, 2);
    assertEq(deposit.validTo, 0);
  }

  function test_DepositCreate_NonceReused() public {
    helper_funds(msg.sender, 6, true);

    vm.prank(msg.sender);
    testee.createDeposit(12, address(2), 2, 1, 0);

    assertEq(token.balanceOf(msg.sender), 3);
    assertEq(token.balanceOf(address(testee)), 3);

    vm.prank(msg.sender);
    vm.expectRevert("deposits[id].spender == address(0)");
    testee.createDeposit(12, address(2), 2, 1, 0);

    assertEq(token.balanceOf(msg.sender), 3);
    assertEq(token.balanceOf(address(testee)), 3);
  }

  function test_DepositCreate_ZeroAmount() public {
    helper_funds(msg.sender, 3, true);

    vm.prank(msg.sender);
    vm.expectRevert("amount > 0");
    testee.createDeposit(0, address(2), 0, 1, 0);

    assertEq(token.balanceOf(msg.sender), 3);
    assertEq(token.balanceOf(address(testee)), 0);
  }

  function test_DepositCreate_NullSpender() public {
    helper_funds(msg.sender, 3, true);

    vm.prank(msg.sender);
    vm.expectRevert("spender cannot be null address");
    testee.createDeposit(0, address(0), 2, 1, 0);

    assertEq(token.balanceOf(msg.sender), 3);
    assertEq(token.balanceOf(address(testee)), 0);
  }

  function test_DepositCreate_SelfSpender() public {
    helper_funds(msg.sender, 3, true);

    vm.prank(msg.sender);
    vm.expectRevert("spender cannot be funder");
    testee.createDeposit(0, msg.sender, 2, 1, 0);

    assertEq(token.balanceOf(msg.sender), 3);
    assertEq(token.balanceOf(address(testee)), 0);
  }

  function test_CloseDeposit() public {
    address spender = address(21);

    helper_funds(msg.sender, 3, true);

    vm.prank(msg.sender);
    uint256 depositId = testee.createDeposit(12, spender, 2, 1, 0);
    assertEq(token.balanceOf(msg.sender), 0);
    assertEq(token.balanceOf(spender), 0);
    assertEq(token.balanceOf(address(testee)), 3);

    vm.expectEmit();
    emit LockPayment.DepositFeeTransfer(depositId, spender, 1);
    vm.expectEmit();
    emit LockPayment.DepositClosed(depositId, spender);

    vm.prank(spender);
    testee.closeDeposit(depositId);

    assertEq(token.balanceOf(msg.sender), 2);
    assertEq(token.balanceOf(spender), 1);
    assertEq(token.balanceOf(address(testee)), 0);

    ILockPayment.DepositView memory deposit = testee.getDeposit(depositId);
    assertEq(deposit.id, depositId);
    assertEq(deposit.funder, msg.sender);
    assertEq(deposit.spender, address(0xBad));
    assertEq(deposit.amount, 0);
    assertEq(deposit.validTo, 0);
  }

  function test_ExtendDeposit() public {
    address spender = address(21);

    helper_funds(msg.sender, 5, true);

    vm.prank(msg.sender);
    uint256 depositId = testee.createDeposit(12, spender, 2, 1, 100);

    vm.prank(msg.sender);
    testee.extendDeposit(12, 1, 1, 1000);

    vm.prank(msg.sender);
    ILockPayment.DepositView memory deposit = testee.getDeposit(depositId);
    assertEq(deposit.id, depositId);
    assertEq(deposit.funder, msg.sender);
    assertEq(deposit.spender, spender);
    assertEq(deposit.amount, 3);
    assertEq(deposit.validTo, 1000);
  }

  function test_GetDepositByNonce() public {
    address spender = address(21);

    helper_funds(msg.sender, 3, true);

    vm.prank(msg.sender);
    uint256 depositId = testee.createDeposit(12, spender, 2, 1, 0);


    ILockPayment.DepositView memory deposit = testee.getDepositByNonce(12, msg.sender);
    assertEq(deposit.id, depositId);
    assertEq(deposit.funder, msg.sender);
    assertEq(deposit.spender, spender);
    assertEq(deposit.amount, 2);
    assertEq(deposit.validTo, 0);
  }

  function test_TerminateDeposit_premature() public {
    address spender = address(21);

    helper_funds(msg.sender, 3, true);

    vm.prank(msg.sender);
    uint256 depositId = testee.createDeposit(12, spender, 2, 1, 100);

    vm.roll(0);
    vm.prank(msg.sender);
    vm.expectRevert("deposit.validTo < block.timestamp");
    testee.terminateDeposit(12);
  }

  function test_TerminateDeposit_allowed() public {
    // TODO
  }

  function test_DepositSingleTransfer() public {
    address spender = address(21);
    address lucky = address(500);

    helper_funds(msg.sender, 3, true);

    vm.prank(msg.sender);
    uint256 depositId = testee.createDeposit(12, spender, 2, 1, 0);

    vm.expectEmit();
    emit LockPayment.DepositTransfer(depositId, spender, lucky, 1);

    vm.prank(spender);
    testee.depositSingleTransfer(depositId, lucky, 1);

    assertEq(token.balanceOf(msg.sender), 0);
    assertEq(token.balanceOf(address(testee)), 2);
    assertEq(token.balanceOf(spender), 0);
    assertEq(token.balanceOf(lucky), 1);

    ILockPayment.DepositView memory deposit = testee.getDeposit(depositId);
    assertEq(deposit.amount, 1);
  }

  function test_DepositTransfer() public {
    address spender = address(21);

    address lucky1 = address(500);
    uint128 amount1 = 1;
    address lucky2 = address(502);
    uint128 amount2 = 1;

    bytes32 transfer1 = bytes32(uint256(uint160(lucky1))) << 96 | bytes32(uint256(amount1));
    bytes32 transfer2 = bytes32(uint256(uint160(lucky2))) << 96 | bytes32(uint256(amount2));

    bytes32[] memory payments = new bytes32[](2);
    payments[0] = transfer1;
    payments[1] = transfer2;

    helper_funds(msg.sender, 3, true);

    vm.prank(msg.sender);
    uint256 depositId = testee.createDeposit(12, spender, 2, 1, 0);

    vm.expectEmit();
    emit LockPayment.DepositTransfer(depositId, spender, lucky1, amount1);
    vm.expectEmit();
    emit LockPayment.DepositTransfer(depositId, spender, lucky2, amount2);

    vm.prank(spender);
    testee.depositTransfer(depositId, payments);

    assertEq(token.balanceOf(msg.sender), 0);
    assertEq(token.balanceOf(address(testee)), 3 - amount1 - amount2);
    assertEq(token.balanceOf(spender), 0);
    assertEq(token.balanceOf(lucky1), amount1);
    assertEq(token.balanceOf(lucky2), amount2);

    ILockPayment.DepositView memory deposit = testee.getDeposit(depositId);
    assertEq(deposit.amount, 2 - amount1 - amount2);
  }

  function test_ValidateDeposit() public {
    address spender = address(21);
    uint128 feeAmount = 1;

    helper_funds(msg.sender, 5, true);

    vm.prank(msg.sender);
    uint256 depositId = testee.createDeposit(12, spender, 2, feeAmount, 0);

    assertEq(testee.validateDeposit(uint256(0xBaD), 0), "failed due to wrong deposit id");
    assertEq(testee.validateDeposit(depositId, feeAmount + 1), "failed due to flatFeeAmount mismatch");
    assertEq(testee.validateDeposit(depositId, feeAmount), "valid");
  }

  function helper_funds(address addr, uint256 amount, bool approve_testee) internal {
    token.mint(addr, amount);
    assertEq(token.balanceOf(addr), amount);

    if(approve_testee) {
      vm.prank(msg.sender);
      token.approve(address(testee), amount);
    }
  }
}
