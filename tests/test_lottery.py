import time
import pytest
from brownie import Lottery, VRFConsumer, Timer, convert, network
from scripts.helpful_scripts import (
    get_account,
    get_contract,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
)

SIZE_OF_LOTTERY = 6
MAX_VALID_NUMBER = 30
FEE = 100_000_000_000_000_000

@pytest.fixture
def deploy_timer_contract():

    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        timer = Timer.deploy()
        assert timer is not None
        return timer
    else:
        return


@pytest.fixture
def deploy_lottery_contract(deploy_timer_contract):

    # Arrange / Act
    timer = deploy_timer_contract

    lottery = Lottery.deploy(
        SIZE_OF_LOTTERY,
        MAX_VALID_NUMBER,
        FEE,
        timer.address,
        {"from": get_account()})

    # Assert
    assert lottery is not None
    return lottery

def  test_can_start_lottery(deploy_lottery_contract):

    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for Local Testing")

    lottery = deploy_lottery_contract

    account = get_account()

    transaction_receipt = lottery.startLottery()
