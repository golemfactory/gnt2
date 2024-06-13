pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "forge-std/Test.sol";
import "forge-std/mocks/MockERC20.sol";
import {ILockPayment, LockPayment, IERC20 as L_IERC20} from "../LockPayment.sol";

contract LockPaymentTest is Test {
  MockERC20 internal token;
  LockPayment internal testee;

  function setUp() public {
    token = new MockERC20();
    token.initialize("Test Golem Network Token", "tGLM", 18);
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

  function helper_funds(address addr, uint256 amount, bool approve_testee) internal {
    token.mint(addr, amount);
    assertEq(token.balanceOf(addr), amount);

    if(approve_testee) {
      vm.prank(msg.sender);
      token.approve(address(testee), amount);
    }
  }
}
