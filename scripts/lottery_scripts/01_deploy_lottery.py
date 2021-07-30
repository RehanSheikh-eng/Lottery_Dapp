from brownie import Lottery, Timer, config, network
import numpy as np
from scripts.helpful_scripts import (
    get_account,
    get_verify_status,
    get_contract,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS
)

SIZE_OF_LOTTERY = 6
MAX_VALID_NUMBER = 30
FEE = 100_000_000_000_000_000
ORIGIN_TIME = 5
VALID_PRIZE_DISTRIBUTION = [50, 20, 10, 10, 5, 5]


def deploy_lottery():

    account = get_account()
    print(f"On network {network.show_active()}")

    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        timer = Timer.deploy({"from": account})
        assert timer is not None
        timer_address = timer.address

    else:
        timer_address = 0

    lottery = Lottery.deploy(
        SIZE_OF_LOTTERY,
        MAX_VALID_NUMBER,
        FEE,
        timer_address,
        {"from": account})

def start_and_enter_lottery():

    account = get_account()
    lottery = Lottery[-1]
    lottery.setCurrentTime(ORIGIN_TIME, {"from": account})
    tx = lottery.startLottery(
            ORIGIN_TIME,
            ORIGIN_TIME+100,
            VALID_PRIZE_DISTRIBUTION,
            {"from": account})

    for i in range(10):
        randnums= np.random.randint(0, MAX_VALID_NUMBER, SIZE_OF_LOTTERY)
        lottery.enter(randnums.tolist(), {"from": get_account(i), "value": FEE})

def main():
    deploy_lottery()
    start_and_enter_lottery()