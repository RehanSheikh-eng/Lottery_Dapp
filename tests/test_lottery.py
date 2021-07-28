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
def deploy_vrfconsumer_contract(get_keyhash, chainlink_fee):

    # Arrange / Act
    vrf_consumer = VRFConsumer.deploy(
        get_keyhash,
        get_contract("vrf_coordinator").address,
        get_contract("link_token").address,
        chainlink_fee,
        {"from": get_account()})
    
    # Provide VRFConsumer with funds
    tx = get_contract("link_token").transfer(
        vrf_consumer.address, chainlink_fee * 3, {"from": get_account()}
    )

    # Assert
    assert vrf_consumer is not None
    assert tx is not None
    return vrf_consumer


@pytest.fixture
def deploy_timer_contract():

    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        timer = Timer.deploy()
        assert timer is not None
        return timer.address
    else:
        return 0


@pytest.fixture
def deploy_lottery_contract(deploy_timer_contract, deploy_vrfconsumer_contract):

    # Arrange / Act
    timer_address = deploy_timer_contract
    vrfconsumer = deploy_vrfconsumer_contract

    lottery = Lottery.deploy(
        SIZE_OF_LOTTERY,
        MAX_VALID_NUMBER,
        FEE,
        timer_address,
        {"from": get_account()})

    tx = lottery.initialize(vrfconsumer.address)

    # Assert
    assert lottery is not None
    assert tx is not None

    # Return
    return lottery

def  test_can_start_lottery(deploy_lottery_contract):

    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for Local Testing")

    lottery = deploy_lottery_contract

    account = get_account()

    transaction_receipt = lottery.startLottery()
