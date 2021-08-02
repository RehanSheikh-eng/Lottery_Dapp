
import time
import pytest
import numpy as np
from brownie import Lottery, VRFConsumer, Timer, convert, network, reverts, accounts
from scripts.helpful_scripts import(
    get_account,
    get_contract,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
)

from conftest import (
    SIZE_OF_LOTTERY,
    MAX_VALID_NUMBER, 
    FEE,
    ORIGIN_TIME,
    VALID_PRIZE_DISTRIBUTION
)

VALID_INPUT = np.random.randint(0, MAX_VALID_NUMBER, SIZE_OF_LOTTERY).tolist()
WINNING_NUMBERS = [23, 26, 11, 20, 16, 25]


@pytest.mark.parametrize(
    "starting_time,closing_time,STATE",
    [(ORIGIN_TIME, ORIGIN_TIME+100, 1),
     (ORIGIN_TIME+100, ORIGIN_TIME+200, 0)])
def test_valid_start_lottery_local(
    deploy_all_contracts,
    starting_time,
    closing_time,
    STATE):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    _, _, lottery = deploy_all_contracts
    account = get_account()
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})

    # Act
    tx = lottery.startLottery(
        starting_time,
        closing_time,
        VALID_PRIZE_DISTRIBUTION,
        {"from": account})
    
    with reverts():
        lottery.startLottery(
            starting_time,
            closing_time,
            VALID_PRIZE_DISTRIBUTION,
            {"from": account})

    # Assert
    lotto_ID = lottery.lottoId({"from": account})
    lotto_info = lottery.getLotteryInfo(lotto_ID, {"from": account})

    assert lotto_info[0] == lotto_ID 
    assert len(lotto_info[1]) == SIZE_OF_LOTTERY
    assert sum(lotto_info[1]) == 0 
    assert lotto_info[2] == STATE 
    assert lotto_info[3] == VALID_PRIZE_DISTRIBUTION 
    assert lotto_info[4] == starting_time 
    assert lotto_info[5] == closing_time
    assert isinstance(tx.txid, str)

@pytest.mark.parametrize(
    "starting_time,closing_time,prize_distribution",
    [(100, 50, VALID_PRIZE_DISTRIBUTION),
    (0, 100, VALID_PRIZE_DISTRIBUTION),
    (ORIGIN_TIME, ORIGIN_TIME+100, [1]),
    (ORIGIN_TIME, ORIGIN_TIME+100, [5, 5, 5, 5, 5, 5])])
def test_revert_start_lottery_local(
    deploy_all_contracts,
    starting_time,
    closing_time,
    prize_distribution):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    _, _, lottery = deploy_all_contracts
    account = get_account()
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})
    OTHER_ACCOUNT = get_account(1)

    # Act
    with reverts():
        tx = lottery.startLottery(
            starting_time,
            closing_time,
            prize_distribution,
            {"from": account})

    with reverts():
        tx = lottery.startLottery(
            ORIGIN_TIME,
            ORIGIN_TIME+100,
            [5, 5, 5, 5, 5, 5],
            {"from": OTHER_ACCOUNT})
      
def test_valid_draw_numbers_local(start_lottery_open):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    vrf_consumer, _, lottery, account = start_lottery_open
    account = get_account()
    lotto_ID = lottery.lottoId({"from": account})
    lottery.setCurrentTime(ORIGIN_TIME+105, {"from": account})

    # Act
    tx2 = lottery.drawNumbers({"from": account})
    lotto_info = lottery.getLotteryInfo(lotto_ID, {"from": account})
    assert lotto_info[2] == 2
    tx2.wait(1)

    request_id = tx2.events["RequestNumbers"]["requestId"]
    assert isinstance(request_id, convert.datatypes.HexString)

    tx3 = get_contract("vrf_coordinator").callBackWithRandomness(
        request_id,
        777,
        vrf_consumer.address,
        {"from": get_account()})
    assert tx3 is not None
    lotto_info = lottery.getLotteryInfo(lotto_ID, {"from": account})

    # Assert
    assert lotto_info[2] == 3

def test_revert_draw_numbers_local(start_lottery_open, node_account):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    _, _, lottery, account = start_lottery_open

    # Act
    with reverts():
        lottery.drawNumbers({"from": account})

    lottery.setCurrentTime(ORIGIN_TIME+105, {"from": account})

    with reverts():
        lottery.drawNumbers({"from": node_account})
    
    lottery.drawNumbers({"from": account})

    with reverts():
        lottery.drawNumbers({"from": account})

def test_valid_enter_lottery_open_local(start_lottery_open):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    _, _, lottery, _ = start_lottery_open

    # Act
    lottery.setCurrentTime(ORIGIN_TIME+10, {"from": get_account()})
    for i in range(len(accounts)):
        randnums = np.random.randint(0, MAX_VALID_NUMBER, SIZE_OF_LOTTERY)
        tx1 = lottery.enter(randnums.tolist(), {"from": get_account(i), "value": FEE})
        tx2 = lottery.getTicketNumber.transact(0, {"from": get_account(i)})
        nums = tx2.return_value
        print(f"Account: {get_account(i).address}\nNumpy Numbers: {randnums.tolist()}\nNumbers stored in contract:{nums}")

        # Assert
        assert isinstance(tx1.txid, str)
        assert isinstance(tx2.txid, str)
        assert nums == randnums.tolist()

def test_valid_enter_lottery_notstarted_local(start_lottery_notstarted):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    _, _, lottery, _ = start_lottery_notstarted

    # Act
    lottery.setCurrentTime(ORIGIN_TIME+10, {"from": get_account()})
    for i in range(len(accounts)):
        randnums = np.random.randint(0, MAX_VALID_NUMBER, SIZE_OF_LOTTERY)
        tx1 = lottery.enter(randnums.tolist(), {"from": get_account(i), "value": FEE})
        tx2 = lottery.getTicketNumber.transact(0, {"from": get_account(i)})
        nums = tx2.return_value
        print(f"Account: {get_account(i).address}\nNumpy Numbers: {randnums.tolist()}\nNumbers stored in contract:{nums}")

        # Assert
        assert isinstance(tx1.txid, str)
        assert isinstance(tx2.txid, str)
        assert nums == randnums.tolist()

@pytest.mark.parametrize(
    "TIME,numbers,fee",
    [(ORIGIN_TIME+105, VALID_INPUT, FEE),   # Invalid Time
    (ORIGIN_TIME-5, VALID_INPUT, FEE),      # Invalid Time
    (ORIGIN_TIME+50, [1], FEE),             # Invalid Input
    (ORIGIN_TIME+50, VALID_INPUT, FEE-1)])  # Invalid Fee
def test_revert_enter_local(
    deploy_all_contracts,
    TIME,
    numbers,
    fee):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    _, _, lottery = deploy_all_contracts
    account = get_account()
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})

    tx1 = lottery.startLottery(
        ORIGIN_TIME+5,
        ORIGIN_TIME+100,
        VALID_PRIZE_DISTRIBUTION,
        {"from": account})

    lottery.setCurrentTime(TIME, {"from": account})

    # Act
    for i in range(len(accounts)):
        with reverts():
            tx3 = lottery.enter(numbers, {"from": get_account(i), "value": fee})

def test_valid_claim_prize_local(start_lottery_open):

    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")            

    vrf_consumer, _, lottery, account = start_lottery_open

    lottery_id = lottery.lottoId()
    lottery.setCurrentTime(ORIGIN_TIME+10, {"from": get_account()})
    for i in range(len(accounts)-1):
        randnums = np.random.randint(0, MAX_VALID_NUMBER, SIZE_OF_LOTTERY)
        tx1 = lottery.enter(randnums.tolist(), {"from": get_account(i), "value": FEE})

    lottery.enter(WINNING_NUMBERS, {"from": get_account(9), "value": FEE})
    old_balance = get_account(9).balance()
    lottery.setCurrentTime(ORIGIN_TIME+105, {"from": account})

    tx2 = lottery.drawNumbers({"from": account})
    tx2.wait(1)

    request_id = tx2.events["RequestNumbers"]["requestId"]
    tx3 = get_contract("vrf_coordinator").callBackWithRandomness(
        request_id,
        777,
        vrf_consumer.address,
        {"from": get_account()})
    
    # Act
    for i in range(len(accounts)):
        lottery.claimPrize(lottery_id, {"from": get_account(i)})

    new_balance = get_account(9).balance()

    # Assert
    assert lottery.balance() == 0
    assert old_balance < new_balance



