import time
import pytest
from brownie import VRFConsumer, convert, network
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

def test_can_request_random_number(deploy_all_contracts):
    # Arrange
    vrf_consumer, _ , _ = deploy_all_contracts

    # Act
    requestId = vrf_consumer.getRandomNumber.call({"from": get_account()})
    assert isinstance(requestId, convert.datatypes.HexString)


def test_returns_random_number_local(deploy_all_contracts):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    vrf_consumer, _ , _ = deploy_all_contracts

    # Act
    transaction_receipt = vrf_consumer.getRandomNumber({"from": get_account()})
    requestId = vrf_consumer.getRandomNumber.call({"from": get_account()})
    assert isinstance(transaction_receipt.txid, str)

    get_contract("vrf_coordinator").callBackWithRandomness(
        requestId,
        777,
        vrf_consumer.address,
        {"from": get_account()})

    # Assert
    assert vrf_consumer.randomResult() == 0
    assert isinstance(vrf_consumer.randomResult(), int)


def test_returns_random_number_testnet(deploy_all_contracts):
    # Arrange
    if network.show_active() not in ["kovan", "rinkeby", "ropsten"]:
        pytest.skip("Only for testnet testing")

    vrf_consumer, _ , _ = deploy_all_contracts

    # Act
    transaction_receipt = vrf_consumer.getRandomNumber({"from": get_account()})
    assert isinstance(transaction_receipt.txid, str)
    transaction_receipt.wait(1)
    time.sleep(35)

    # Assert
    assert vrf_consumer.randomResult() > 0
    assert isinstance(vrf_consumer.randomResult(), int)
