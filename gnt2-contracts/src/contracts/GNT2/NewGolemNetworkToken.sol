pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "./GNTMigrationAgent.sol";

contract NewGolemNetworkToken is ERC20Mintable {
    string public name = "New Golem Network Token";
    string public symbol = "NGNT";
    uint8 public decimals = 18;


    constructor(address _migrationAgent) public {
        addMinter(_migrationAgent);
        renounceMinter();
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        _transfer(sender, recipient, amount);
        if (sender != msg.sender && allowance(sender, msg.sender) != uint(-1)) {
            _approve(sender, msg.sender, allowance(sender, msg.sender).sub(amount));
        }
        return true;
    }
}
