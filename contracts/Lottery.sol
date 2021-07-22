// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "../interfaces/IVRFConsumer.sol";


contract Lottery {

    IVRFConsumer randomGenerator; // ref to random number generator

    uint public lottoId; // Current lottery ID
    uint public fee; // Fee to enter lottery or Cost to buy "ticket"
    uint public sizeOfLottery; // Size of Lottery e.g 6 => Ticket = [0, 15, 20, 21, 40, 49]
    uint public maxValidNumber; // Maximum possible number in lottery e.g 50
    bytes32 internal requestId; // Request ID for Chainlink VRF used to keep track of randomness requests




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
        fee = 0.1 ether;

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

        require(allLotteries[lottoId].lotteryState == States.OPEN, "Lottery must be open");
        requestId = randomGenerator.getRandomNumber();
        requestToLotteryId[requestId] = lottoId;
        allLotteries[lottoId].lotteryState = States.CALCULATING;

    }

    function fulfillRandom(uint256 _randomness) external {

        require(allLotteries[lottoId].lotteryState == States.CALCULATING);
        allLotteries[lottoId].winningNumbers = expand(_randomness);
        allLotteries[lottoId].lotteryState = States.CLOSED;

    }

    function claimPrize(uint _lotteryId) public {

        require(allLotteries[_lotteryId].lotteryState == States.CLOSED);

        for(uint i = 0; i < playerTickets[msg.sender].length; i++){
            if (playerTickets[msg.sender][i].lottoId == _lotteryId && playerTickets[msg.sender][i].claimed == false){

                uint8 matchingNumbers = getMatchingNumbers(playerTickets[msg.sender][i].numbers,
                                                        allLotteries[_lotteryId].winningNumbers);

                uint prize = prizeForMatching(matchingNumbers, _lotteryId);
                
                payable(address(msg.sender)).transfer(prize);

                playerTickets[msg.sender][i].claimed = true;

                

            }

        }

    }

    //-------------------------------------------------------------------------
    // VIEW FUNCTIONS
    //-------------------------------------------------------------------------

    function getTicketNumber(uint _index) public view returns(uint[] memory){

        return playerTickets[msg.sender][_index].numbers;
    }

    function getLotteryInfo(uint _lotteryId) public view returns (LotteryInfo memory){

        return (allLotteries[_lotteryId]);
    }

    function getLotteryId() public view returns(uint){
        
        return lottoId; 
    }

    function getSizeOfLottery() public view returns(uint){

        return sizeOfLottery;
    }

    function getMaxValidNumber() public view returns(uint){

        return maxValidNumber;
    }

    function getFee() public view returns(uint){

        return fee;
    }

    //-------------------------------------------------------------------------
    // INTERNAL FUNCTIONS
    //-------------------------------------------------------------------------

    function expand(
        uint256 randomValue
        )

        internal 
        view 
        returns (uint256[] memory expandedValues) {


        expandedValues = new uint256[](sizeOfLottery);
        for (uint256 i = 0; i < sizeOfLottery; i++) {
            expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i))) % maxValidNumber;
        }
        return expandedValues;
    }

    function getMatchingNumbers(
        uint[] memory _playerNumbers,
        uint[] memory _winningNumbers
    )
        internal 
        pure 
        returns(uint8 matching){

        for(uint i = 0; i < _winningNumbers.length; i++){
            for(uint j = 0; j < _playerNumbers.length; j++){
                if(_winningNumbers[i] == _playerNumbers[j]){
                    matching += 1; 
                }
            }
        }
    }


    function prizeForMatching(
        uint8 _noOfMatching,
        uint256 _lotteryId
        )

        internal
        view
        returns(uint256) {

        uint256 prize = 0;
        // If user has no matching numbers their prize is 0
        if(_noOfMatching == 0) {
            return 0;
        } 
        // Getting the percentage of the pool the user has won
        uint256 perOfPool = allLotteries[_lotteryId].prizeDistribution[_noOfMatching-1];
        // Timesing the percentage one by the pool
        prize = address(this).balance * perOfPool; 
        // Returning the prize divided by 100 (as the prize distribution is scaled)
        return prize / 100;
        }
}