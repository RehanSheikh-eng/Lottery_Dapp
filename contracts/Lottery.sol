// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

contract Lottery {

    uint public lottoId;
    uint public fee;
    uint public numberOfNumbers;
    uint public sizeOfLottery;

    enum lotteryState {OPEN, CLOSED, CALCULATING}

    lotteryState public lottoState;

    mapping (address => Ticket) playerTickets;

    struct Ticket {
        uint lottoId;
        uint[](sizeOfLottery) numbers;
    }

    constructor(){

        lotteryId = 1;
        lottoState = lotteryState.OPEN;
        sizeOfLottery = 6;
        
    }

    function startLottery(uint _duration) {
        require(lottoState == lotteryState.CLOSED);
        lottoState = lotteryState.OPEN;
        lottoId = lottoId + 1

    }

    function enter(uint[](sizeOfLottery) _lottoNumbers) public payable {
        require(msg.value >= fee);
        playerTickets[msg.sender] = Ticket(lottoId, _lottoNumbers);


    }

}