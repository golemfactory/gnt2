// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

struct BlockDetails {
    uint256 number;
    uint256 timestamp;
    uint256 difficulty;
    uint256 gaslimit;
    address coinbase;
    bytes32 blockhash;
    uint256 basefee;
}

struct CallWithDetailsResult {
    BlockDetails details;
    bytes result;
}

struct MultiCallWithDetailsResult {
    BlockDetails details;
    bytes[] results;
}

contract WrapperCall {
    constructor() {
    }

    function detailsOnly() external view returns (BlockDetails memory) {
        BlockDetails memory details = BlockDetails({
            number: block.number,
            timestamp: block.timestamp,
            difficulty: block.difficulty,
            gaslimit: block.gaslimit,
            coinbase: block.coinbase,
            blockhash: blockhash(block.number),
            basefee: block.basefee
        });

        return details;
    }

    function callWithDetails(address externalContractAddress, bytes calldata callData) external returns (CallWithDetailsResult memory) {
        (bool success, bytes memory data) = externalContractAddress.call(
            callData
        );

        BlockDetails memory details = BlockDetails({
            number: block.number,
            timestamp: block.timestamp,
            difficulty: block.difficulty,
            gaslimit: block.gaslimit,
            coinbase: block.coinbase,
            blockhash: blockhash(block.number),
            basefee: block.basefee
        });

        // Check if the call was successful
        require(success, "External call failed");

        return CallWithDetailsResult(details, data);
    }

    function multiCallWithDetails(address[] calldata externalContractAddresses, bytes[] calldata callDatas) external returns (MultiCallWithDetailsResult memory) {
        require(externalContractAddresses.length == callDatas.length, "Arrays must be of equal length");
        require(externalContractAddresses.length > 0, "Arrays must not be empty");

        bytes[] memory results = new bytes[](externalContractAddresses.length);
        for (uint256 i = 0; i < externalContractAddresses.length; i++) {
            (bool success, bytes memory data) = externalContractAddresses[i].call(
                callDatas[i]
            );
            // Check if the call was successful
            require(success, "External call failed");
            results[i] = data;
        }

        BlockDetails memory details = BlockDetails({
            number: block.number,
            timestamp: block.timestamp,
            difficulty: block.difficulty,
            gaslimit: block.gaslimit,
            coinbase: block.coinbase,
            blockhash: blockhash(block.number),
            basefee: block.basefee
        });

        return MultiCallWithDetailsResult(details, results);
    }
}