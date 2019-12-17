pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface MigrationAgent {
    function migrateFrom(address _from, uint256 _value) external;
}

contract NewGolemNetworkToken is ERC20, MigrationAgent {
    string public name = "New Golem Network Token";
    string public symbol = "NGNT";
    uint8 public decimals = 18;

    function migrateFrom(address _from, uint256 _value) public {
        _mint(_from, _value);
    }
}
