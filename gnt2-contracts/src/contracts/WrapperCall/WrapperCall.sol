// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

struct BlockDetails {
    uint256 number;
    uint256 timestamp;
    bytes32 difficulty;
    uint256 gaslimit;
    address coinbase;
    uint256 blockhash;
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

    function callWithDetails(address externalContractAddress, bytes callData) external view returns (CallWithDetailsResult) {
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

    function multiCallWithDetails(address[] externalContractAddresses, bytes[] callDatas) external view returns (MultiCallWithDetailsResult) {
        require(externalContractAddresses.length == callDatas.length, "Arrays must be of equal length");
        require(externalContractAddresses.length > 0, "Arrays must not be empty");

        bytes[] results = new bytes[](externalContractAddresses.length);
        for (uint256 i = 0; i < externalContractAddresses.length; i++) {
            (bool success, bytes memory data) = externalContractAddresses[i].call(
                callDatas[i]
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
            results[i] = data;
        }

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

        return MultiCallWithDetailsResult(details, results);
    }
}