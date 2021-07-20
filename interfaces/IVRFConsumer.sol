// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

interface IVRFConsumer{

    function getRandomNumber() public returns (bytes32 requestId);

}