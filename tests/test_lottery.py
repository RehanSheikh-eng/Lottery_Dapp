import time
import pytest
from brownie import Lottery, VRFConsumer, convert, network
from scripts.helpful_scripts import (
    get_account,
    get_contract,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
)

@pytest.fixture
def deploy_lottery_contract():

    # Arrange
    lottery = Lottery.deploy()

    assert lottery is not None
    return lottery

def  test_can_start_lottery(deploy_lottery_contract):

    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for Local Testing")

    lottery = deploy_lottery_contract

    account = get_account()

    transaction_receipt = lottery.startLottery()
