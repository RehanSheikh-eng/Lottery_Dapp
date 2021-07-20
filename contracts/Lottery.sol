// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "../interfaces/IVRFConsumer.sol";


contract Lottery {

    IVRFConsumer randomGenerator;

    uint public lottoId;
    uint public fee;
    uint public numberOfNumbers;
    uint public sizeOfLottery;
    uint public maxValidNumber;

    enum States {
        CLOSED, 
        OPEN,
        CALCULATING
    }



    mapping (address => Ticket[]) playerTickets;
    mapping (bytes32 => uint) requestToLotteryId;
    mapping (uint => Lottery) allLotteries;

    struct Ticket {
        uint lottoId;
        uint[(sizeOfLottery)] numbers;
    }

    struct Lottery {
        uint lotteryId;
        uint[(sizeOfLottery)] winningNumbers;
        States lotteryState;
        uint[] prizeDistribution;
    }

    constructor(address _VRFConsumer){

        lotteryId = 0;
        sizeOfLottery = 6;
        randomGenerator = IVRFConsumer(_VRFConsumer);
        maxValidNumber = 50;

    }

    function startLottery(uint _duration) public {

        require(allLotteries[lottoId].lotteryState == States.CLOSED || lottoId == 0);
        lottoId = lottoId + 1;
        allLotteries[lottoId].lotteryState = States.OPEN;

    }

    function enter(uint[(sizeOfLottery)] _lottoNumbers) public payable {

        require(msg.value >= fee);
        require(allLotteries[lottoId].lotteryState == States.OPEN);
        playerTickets[msg.sender].push(Ticket(lottoId, _lottoNumbers));

    }

    function drawNumbers(){

        require(allLotteries[lottoId].lotteryState == States.OPEN);
        requestId = randomGenerator.getRandomNumber();
        requestToLotteryId[requestId] = lottoId;
        allLotteries[lottoId].lotteryState = States.CALCULATING;

    }

    function fulfillRandom(uint256 _randomness) {

        require(allLotteries[lottoId].lotteryState == States.CALCULATING);
        allLotteries[lottoId].winningNumbers = expand(_randomness);

    }

    function expand(uint256 randomValue) public pure returns (uint256[] memory expandedValues) {
        expandedValues = new uint256[](sizeOfLottery);
        for (uint256 i = 0; i < sizeOfLottery; i++) {
            expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i))) % maxValidNumber;
        }
        return expandedValues;
    }

    function getMatchingNumbers(uint[] _playerNumbers, uint[] _winningNumbers) internal pure returns(uint matching){

        for(uint i = 0; i < _winningNumbers.length; i++){
            for(uint j = 0; j < _playerNumbers.length; j++){

                if(_winningNumbers[i] == _playerNumbers[j]){

                    matching += 1; 

                }

            }

        }


    }
}