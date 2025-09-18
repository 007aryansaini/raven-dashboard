// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DemoRelayTarget {
    event Ping(address indexed caller, string message);

    function ping(string calldata message) external {
        emit Ping(msg.sender, message);
    }
}


