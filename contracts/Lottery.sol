// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "../interfaces/IVRFConsumer.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import ".Testable.sol";


contract Lottery is Ownable, Testable {

    IVRFConsumer internal randomGenerator; // ref to random number generator

    uint public lottoId; // Current lottery ID
    uint public fee; // Fee to enter lottery or Cost to buy "ticket"
    uint public sizeOfLottery; // Size of Lottery e.g 6 => Ticket = [0, 15, 20, 21, 40, 49]
    uint public maxValidNumber; // Maximum possible number in lottery e.g 50
    bytes32 internal requestId; // Request ID for Chainlink VRF used to keep track of randomness requests



/** States:
*
*   NOTSTARTED - Lottery has not started yet 
*   OPEN - Lottery is open and you can buy tickets
*   CLOSED - Lottery is closed and tickets are no longer for sale
*   COMPLETED - Lottery Winning Numbers have been drawn and rewards can be claimed
*/
    enum States {
        NOTSTARTED,
        CLOSED,
        OPEN,
        COMPLETED
    }


    // Holds the tickets entered by a specific address
    mapping (address => Ticket[]) playerTickets;

    // Holds the chainlink VRF request ID to Lottery ID
    mapping (bytes32 => uint) requestToLotteryId;
    
    // Holds the Lottery ID to Info 
    mapping (uint => LotteryInfo) allLotteries;

    struct Ticket {
        uint lottoId;       // Lottery ID this ticket was issued for
        uint[] numbers;     // Numbers issued with a ticket
        bool claimed;       // bool to determine whether reward has been claimed with this ticket
    }

    struct LotteryInfo {
        uint lotteryId;             // Lottery ID
        uint[] winningNumbers;      // array of the winning numbers 
        States lotteryState;        // Stores the state this specific lottery is in
        uint[] prizeDistribution;   // Determines the % reward held in each pool
        uint startingTimestamp;     // Block timestamp for start of lottery
        uint closingTimestamp;      // Block timestamp for end of entries
    }

    constructor(
        uint _sizeOfLottery,
        uint _maxValidNumber,
        uint _fee,
        address _timerAddress) 

        Testable(_timerAddress)
        public{
        
        require(_sizeOfLottery != 0 || _maxValidNumber != 0 || _fee != 0); // dev: Lottery params cannot be 0 

        lottoId = 0;
        sizeOfLottery = _sizeOfLottery;
        maxValidNumber = _maxValidNumber;
        fee = _fee;

    }

    function initialize(address _VRFConsumer) public onlyOwner(){

        require(_VRFConsumer != address(0x0)); // dev: VRFConsumer address must be defined
        randomGenerator = IVRFConsumer(_VRFConsumer);

    }

    function startLottery(
        uint _startingTimestamp,
        uint _closingTimestamp,
        uint[] memory _prizeDistribution)

        public
        onlyOwner() {

        require(
            allLotteries[lottoId].lotteryState == States.COMPLETED ||
            lottoId == 0
        ); // dev: Previous lottery is not complete

        require(
            _startingTimestamp != 0 ||
            _startingTimestamp < _closingTimestamp
        ); // dev: Timestamps for lottery invalid

        require(
            _prizeDistribution.length == sizeOfLottery
        ); // dev: Prize array length does not equal sizeOfLottery


        // Ensuring Prize Distribution Array totals 100
        uint256 prizeDistributionTotal = 0;

        // Iterate thorugh array
        for (uint256 j = 0; j < _prizeDistribution.length; j++) {

            // Add jth element to running total
            prizeDistributionTotal += _prizeDistribution[j];
        }

        require(prizeDistributionTotal == 100); // dev: Prize array does not total 100%

        // Increment lottery ID counter
        lottoId = lottoId + 1;

        // Initialize winning numbers array filled with zeros
        uint[] memory winningNumbers = new uint[](sizeOfLottery);

        // Initialize lottery state variable
        States lotteryState;

        // Lottery state is open if current time is less than or equal to the starting time specified
        if(_startingTimestamp >= getCurrentTime()) {
            lotteryState = States.OPEN;
        }

        // Otherwise the lottery has not started
        else {
            lotteryState = States.NOTSTARTED;
        }

        // Save data in struct and add to mapping with key as current lottery ID
        LotteryInfo memory newLottery = LotteryInfo(
            lottoId,
            winningNumbers,
            lotteryState,
            _prizeDistribution,
            _startingTimestamp,
            _closingTimestamp);

        allLotteries[lottoId] = newLottery;

    }

    function enter(uint[] memory _lottoNumbers) public payable {

        require(
            _lottoNumbers.length == sizeOfLottery
        ); // dev: Numbers do not match lottery length

        require(
            msg.value >= fee
        ); // dev: More funds requried to buy ticket

        require(
            getCurrentTime() >= allLotteries[lottoId].startingTimestamp &&
            getCurrentTime() < allLotteries[lottoId].closingTimestamp
        ); // dev: Invalid time to buy tickets for this lottery

        // Ensuring lottery is in valid state and valid time
        if(
            allLotteries[lottoId].lotteryState == States.NOTSTARTED &&
            allLotteries[lottoId].startingTimestamp >= getCurrentTime())
        {
                allLotteries[lottoId].lotteryState == States.OPEN;
        }

        require(
            allLoteries[lottoId].lotteryState == States.OPEN
        ); // dev: Lottery is not Open therfore cannot enter 

        // Adds Ticket struct to mapping with players address as key
        playerTickets[msg.sender].push(Ticket(lottoId, _lottoNumbers, false));

    }

    function drawNumbers() public onlyOwner() {

        require(
            allLotteries[lottoId].closingTimestamp <= getCurrentTime()
        ); // dev: Invalid time to draw winning numbers

        require(
            allLotteries[lottoId].lotteryState == States.OPEN
        ); // dev: Lottery must be open

        // Requesting random number from VRFConsumer contract
        requestId = randomGenerator.getRandomNumber();

        // Storing request ID in mapping to ensure multiple requests not sent
        requestToLotteryId[requestId] = lottoId;

        // Changing state of lottery so no more entries allowed
        allLotteries[lottoId].lotteryState = States.CLOSED;

    }

    function fulfillRandom(uint256 _randomness) external {


        require(allLotteries[lottoId].lotteryState == States.COMPLETED);
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