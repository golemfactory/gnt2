// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract WrapperCall {
    struct CallWithDetailsResult {
        uint256 chainId;
        uint256 blockNumber;
        uint256 blockTimestamp;
        uint256 callerBalance;
        bytes callResult;
    }

    // Call an external contract with the provided call data and return the result along with useful details
    function callWithDetails(address externalContractAddress, bytes calldata callData) external returns (CallWithDetailsResult memory) {
        bytes memory result;
        if (externalContractAddress != address(0)) {
            (bool success, bytes memory res) = externalContractAddress.call(callData);
            // Check if the call was successful
            require(success, "External call failed");
            result = res;
        } else {
            result = "";
        }

        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        return CallWithDetailsResult(
            chainId,
            block.number,
            block.timestamp,
            msg.sender.balance,
            result
        );
    }

    struct MultiCallWithDetailsResult {
        uint256 chainId;
        uint256 blockNumber;
        uint256 blockTimestamp;
        uint256 callerBalance;
        bytes[] callResults;
    }

    // Call multiple external contracts with the provided calls data and return the result along with useful details
    function multiCallWithDetails(address[] calldata externalContractAddresses, bytes[] calldata callDataArray) external returns (MultiCallWithDetailsResult memory) {
        require(externalContractAddresses.length == callDataArray.length, "Arrays must be of equal length");
        require(externalContractAddresses.length > 0, "Arrays must not be empty");

        bytes[] memory results = new bytes[](externalContractAddresses.length);
        for (uint256 i = 0; i < externalContractAddresses.length; i++) {
            (bool success, bytes memory data) = externalContractAddresses[i].call(callDataArray[i]);
            // Check if the call was successful
            require(success, "External call failed");
            results[i] = data;
        }

        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        return MultiCallWithDetailsResult(
            chainId,
            block.number,
            block.timestamp,
            msg.sender.balance,
            results
        );
    }

    // Standard multicall for chaining transactions
    function multiCall(address[] calldata externalContractAddresses, bytes[] calldata callDataArray) external {
        require(externalContractAddresses.length == callDataArray.length, "Arrays must be of equal length");
        require(externalContractAddresses.length > 0, "Arrays must not be empty");

        for (uint256 i = 0; i < externalContractAddresses.length; i++) {
            (bool success,) = externalContractAddresses[i].call(callDataArray[i]);
            // Check if the call was successful
            require(success, "External call failed");
        }
    }
}
