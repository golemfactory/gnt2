pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface MigrationAgent {
    function migrateFrom(address _from, uint256 _value) external;
}

contract GNTMigrationAgent is MigrationAgent, Ownable {
    using SafeMath for uint;

    ERC20Mintable private target;
    address private oldToken;

    mapping (address => uint256) public migratedForHolder;
    mapping (address => mapping(address => uint256)) public mintedForTarget;

    constructor(address _oldToken) public {
        oldToken = _oldToken;
    }

    function migrateFrom(address _from, uint256 _value) public {
        require(msg.sender == address(oldToken), "Token only method");
        migratedForHolder[_from] = migratedForHolder[_from].add(_value);

        uint256 toMint = migratedForHolder[_from].sub(mintedForTarget[target][_from]);
        mintedForTarget[target][_from] = mintedForTarget[target][_from].add(toMint);
        target.mint(_from, toMint);
    }

    function setTarget(ERC20Mintable _target) public onlyOwner {
        target = _target;
    }

}
