// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "../interfaces/IVRFConsumer.sol";


contract Lottery {

    IVRFConsumer randomGenerator; // ref to random number generator

    uint public lottoId;
    uint public fee;
    uint public numberOfNumbers;
    uint public sizeOfLottery;
    uint public maxValidNumber;
    bytes32 internal requestId;

    enum States {
        CLOSED, 
        OPEN,
        CALCULATING
    }



    mapping (address => Ticket[]) playerTickets;
    mapping (bytes32 => uint) requestToLotteryId;
    mapping (uint => LotteryInfo) allLotteries;

    struct Ticket {
        uint lottoId;
        uint[] numbers;
        bool claimed;
    }

    struct LotteryInfo {
        uint lotteryId;
        uint[] winningNumbers;
        States lotteryState;
        uint[] prizeDistribution;
    }

    constructor() public{

        lottoId = 0;
        sizeOfLottery = 6;
        maxValidNumber = 50;
        fee = 0.1 ether

    }

    function initialize(address _VRFConsumer) public {

        randomGenerator = IVRFConsumer(_VRFConsumer);

    }

    function startLottery(uint _duration, uint[] memory _prizeDistribution) public {

        require(allLotteries[lottoId].lotteryState == States.CLOSED || lottoId == 0);
        lottoId = lottoId + 1;

        uint[] memory winningNumbers = new uint[](sizeOfLottery);
        States lotteryState = States.OPEN;
        LotteryInfo memory newLottery = LotteryInfo(lottoId, winningNumbers, lotteryState, _prizeDistribution);
        allLotteries[lottoId] = newLottery;

    }

    function enter(uint[] memory _lottoNumbers) public payable {
        require(_lottoNumbers.length == sizeOfLottery);
        require(msg.value >= fee);
        require(allLotteries[lottoId].lotteryState == States.OPEN);
        playerTickets[msg.sender].push(Ticket(lottoId, _lottoNumbers, false));

    }

    function drawNumbers() public {

        require(allLotteries[lottoId].lotteryState == States.OPEN);
        requestId = randomGenerator.getRandomNumber();
        requestToLotteryId[requestId] = lottoId;
        allLotteries[lottoId].lotteryState = States.CALCULATING;

    }

    function fulfillRandom(uint256 _randomness) external {

        require(allLotteries[lottoId].lotteryState == States.CALCULATING);
        allLotteries[lottoId].winningNumbers = expand(_randomness);

    }

    function claimPrize() public {
        for(uint i = 0; i < playerTickets[msg.sender].length; i++){
            if (playerTickets[msg.sender][i].lottoId == lottoId && playerTickets[msg.sender][i].claimed == false){

                uint matchingNumbers = getMatchingNumbers(playerTickets[msg.sender][i].numbers,
                                                        allLotteries[lottoId].winningNumbers);
                playerTickets[msg.sender][i].claimed = true;

            }

        }

    }

    function expand(uint256 randomValue) public view returns (uint256[] memory expandedValues) {
        expandedValues = new uint256[](sizeOfLottery);
        for (uint256 i = 0; i < sizeOfLottery; i++) {
            expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i))) % maxValidNumber;
        }
        return expandedValues;
    }

    function getMatchingNumbers(uint[] memory _playerNumbers, uint[] memory _winningNumbers) internal pure returns(uint matching){

        for(uint i = 0; i < _winningNumbers.length; i++){
            for(uint j = 0; j < _playerNumbers.length; j++){
                if(_winningNumbers[i] == _playerNumbers[j]){
                    matching += 1; 
                }
            }
        }
    }

    function getTicketNumber(uint _index) public view returns(uint[] memory){

        return playerTickets[msg.sender][_index].numbers;
    }

    function prizeForMatching(uint8 _noOfMatching, uint256 _lotteryId) internal view returns(uint256) {

        uint256 prize = 0;
        // If user has no matching numbers their prize is 0
        if(_noOfMatching == 0) {
            return 0;
        } 
        // Getting the percentage of the pool the user has won
        uint256 perOfPool = allLotteries_[_lotteryId].prizeDistribution[_noOfMatching-1];
        // Timesing the percentage one by the pool
        prize = address(this).balance * perOfPool; 
        // Returning the prize divided by 100 (as the prize distribution is scaled)
        return prize / 100;
}