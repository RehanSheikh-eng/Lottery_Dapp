import pytest
from brownie import (
    accounts,
    config,
    network,
    Lottery,
    VRFConsumer,
    Timer
)
from scripts.helpful_scripts import (
    get_account,
    get_contract,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
)

SIZE_OF_LOTTERY = 6
MAX_VALID_NUMBER = 30
FEE = 100_000_000_000_000_000
ORIGIN_TIME = 5
VALID_PRIZE_DISTRIBUTION = [0, 0, 0, 0, 0, 100]


@pytest.fixture
def deploy_all_contracts(get_keyhash, chainlink_fee):

    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        timer = Timer.deploy({"from": get_account()})
        assert timer is not None
        timer_address = timer.address

    else:
        timer_address = 0x0

    lottery = Lottery.deploy(
        SIZE_OF_LOTTERY,
        MAX_VALID_NUMBER,
        FEE,
        timer_address,
        {"from": get_account()})

    vrf_consumer = VRFConsumer.deploy(
        get_keyhash,
        get_contract("vrf_coordinator").address,
        get_contract("link_token").address,
        lottery.address,
        chainlink_fee,
        {"from": get_account()})


        
    # Provide VRFConsumer with funds
    tx1 = get_contract("link_token").transfer(
        vrf_consumer.address,
        chainlink_fee * 3,
        {"from": get_account()})

    tx2 = lottery.initialize(
        vrf_consumer.address,
        {"from": get_account()})

    # Assert
    assert vrf_consumer is not None
    assert lottery is not None
    assert isinstance(tx1.txid, str)
    assert isinstance(tx2.txid, str)

    # Return
    return vrf_consumer, timer, lottery


@pytest.fixture
def start_lottery_open(deploy_all_contracts):
    vrf_consumer, timer, lottery = deploy_all_contracts
    account = get_account()
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})

    tx1 = lottery.startLottery(
        ORIGIN_TIME,
        ORIGIN_TIME+100,
        VALID_PRIZE_DISTRIBUTION,
        {"from": account})

    assert isinstance(tx1.txid, str)
    return vrf_consumer, timer, lottery, account


@pytest.fixture
def start_lottery_notstarted(deploy_all_contracts):
    vrf_consumer, timer, lottery = deploy_all_contracts
    account = get_account()
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})

    tx1 = lottery.startLottery(
        ORIGIN_TIME+5,
        ORIGIN_TIME+100,
        VALID_PRIZE_DISTRIBUTION,
        {"from": account})

    assert isinstance(tx1.txid, str)
    return vrf_consumer, timer, lottery, account


@pytest.fixture
def get_keyhash():
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        return 0
    if network.show_active() in config["networks"]:
        return config["networks"][network.show_active()]["keyhash"]
    else:
        pytest.skip("Invalid network/link token specified ")


@pytest.fixture
def get_job_id():
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        return 0
    if network.show_active() in config["networks"]:
        return config["networks"][network.show_active()]["jobId"]
    else:
        pytest.skip("Invalid network/link token specified")


@pytest.fixture
def get_data():
    return 100


@pytest.fixture
def dev_account():
    return accounts[0]


@pytest.fixture
def node_account():
    return accounts[1]


@pytest.fixture
def chainlink_fee():
    return 1000000000000000000


@pytest.fixture
def expiry_time():
    return 300
