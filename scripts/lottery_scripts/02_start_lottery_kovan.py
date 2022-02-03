from brownie import Lottery, Timer, VRFConsumer, config, network, ZERO_ADDRESS
from brownie.network import account
import time
import numpy as np
from scripts.helpful_scripts import (
    get_account,
    get_verify_status,
    get_contract,
    fund_with_link,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS
)

VALID_PRIZE_DISTRIBUTION = [0, 0, 0, 0, 100]
DURATION = 2.628e+6


def start_lottery(duration=DURATION):
    account = get_account()
    lottery = Lottery[-1]
    UTX_start_time = lottery.getCurrentTime()
    UTX_end_time = UTX_start_time + duration

    print(f"Start Time: {UTX_start_time}\nEnd Time: {UTX_end_time}")

    tx = lottery.startLottery(
        UTX_start_time,
        UTX_end_time,
        VALID_PRIZE_DISTRIBUTION,
        {"from": account})

def main():
    start_lottery()