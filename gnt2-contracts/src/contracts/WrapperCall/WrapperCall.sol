// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract WrapperCall {
    struct CallWithDetailsResult {
        uint256 callerBalance;
        uint256 blockNumber;
        uint256 blockTimestamp;
        bytes callResult;
    }

    // Call an external contract with the provided call data and return the result along with useful details
    function callWithDetails(address externalContractAddress, bytes calldata callData) external returns (CallWithDetailsResult memory) {
        (bool success, bytes memory result) = externalContractAddress.call(
            callData
        );
        // Check if the call was successful
        require(success, "External call failed");

        return CallWithDetailsResult(
            address(this).balance,
            block.number,
            block.timestamp,
            result);
    }

    struct MultiCallWithDetailsResult {
        uint256 callerBalance;
        uint256 blockNumber;
        uint256 blockTimestamp;
        bytes[] callResults;
    }

    // Call an external contracts with the provided calls data and return the result along with useful details
    function multiCallWithDetails(address[] calldata externalContractAddresses, bytes[] calldata callDataArray) external returns (MultiCallWithDetailsResult memory) {
        require(externalContractAddresses.length == callDataArray.length, "Arrays must be of equal length");
        require(externalContractAddresses.length > 0, "Arrays must not be empty");

        bytes[] memory results = new bytes[](externalContractAddresses.length);
        for (uint256 i = 0; i < externalContractAddresses.length; i++) {
            (bool success, bytes memory data) = externalContractAddresses[i].call(
                callDataArray[i]
            );
            // Check if the call was successful
            require(success, "External call failed");
            results[i] = data;
        }

        return MultiCallWithDetailsResult(
            address(this).balance,
            block.number,
            block.timestamp,
            results);
    }
}