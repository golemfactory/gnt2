pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

interface MigrationAgent {
    function migrateFrom(address _from, uint256 _value) external;
}

contract GNTMigrationAgent is MigrationAgent, Ownable {

    ERC20Mintable private target;

    constructor() public{
    }

    function migrateFrom(address _from, uint256 _value) public {
        target.mint(_from, _value);
    }

    function setTarget(ERC20Mintable _target) public onlyOwner {
        target = _target;
    }

}
