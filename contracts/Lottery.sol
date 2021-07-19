// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "../interfaces/IVRFConsumer.sol";


contract Lottery {

    IVRFConsumer randomGenerator;

    uint public lottoId;
    uint public fee;
    uint public numberOfNumbers;
    uint public sizeOfLottery;

    enum lotteryState {OPEN, CLOSED, CALCULATING}

    lotteryState public lottoState;

    mapping (address => Ticket[]) playerTickets;
    mapping (bytes32 => uint) requestToLotteryId;

    struct Ticket {
        uint lottoId;
        uint[](sizeOfLottery) numbers;
    }

    constructor(address _VRFConsumer){

        lotteryId = 1;
        lottoState = lotteryState.OPEN;
        sizeOfLottery = 6;
        randomGenerator = IVRFConsumer(_VRFConsumer);

    }

    function startLottery(uint _duration) {

        require(lottoState == lotteryState.CLOSED);
        lottoState = lotteryState.OPEN;
        lottoId = lottoId + 1

    }

    function enter(uint[](sizeOfLottery) _lottoNumbers) public payable {

        require(msg.value >= fee);
        require(lottoState == lotteryState.OPEN);
        playerTickets[msg.sender].push(Ticket(lottoId, _lottoNumbers));


    }

    function drawNumbers(){

        require(lottoState == lotteryState.OPEN);
        requestId = randomGenerator.getRandomNumber();
        requestToLotteryId[requestId] = lottoId;

    }

    function fulfillRandom(uint _randomness) {


    }

    function expand(uint256 randomValue, uint256 n) public pure returns (uint256[] memory expandedValues) {
        expandedValues = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i)));
        }
        return expandedValues;
    }
}