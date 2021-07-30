import time
import pytest
from brownie import VRFConsumer, convert, network, reverts
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

def test_revert_request_random_number(deploy_all_contracts):

    # Arrange
    vrf_consumer, _ , _ = deploy_all_contracts

    # Act
    with reverts():
        tx = vrf_consumer.getRandomNumber({"from": get_account()})

