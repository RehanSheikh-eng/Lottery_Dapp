import time
import pytest
from brownie import Lottery, VRFConsumer, Timer, convert, network
from scripts.helpful_scripts import (
    get_account,
    get_contract,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
)

from conftest import (
    SIZE_OF_LOTTERY,
    MAX_VALID_NUMBER, 
    FEE
)

VALID_PRIZE_DISTRIBUTION = [50, 20, 10, 10, 5, 5]
TIME = 300

def test_valid_start_lottery(deploy_all_contracts):

    # Arrange
    _, _, lottery = deploy_all_contracts
    account = get_account()
    starting_time = lottery.getCurrentTime({"from": account}) + TIME
    closing_time = starting_time + 2 * TIME

    # Act
    tx = lottery.startLottery(
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
    assert lotto_info[2] == 0 
    assert lotto_info[3] == VALID_PRIZE_DISTRIBUTION 
    assert lotto_info[4] == starting_time 
    assert lotto_info[5] == closing_time
    assert isinstance(tx.txid, str)

    
