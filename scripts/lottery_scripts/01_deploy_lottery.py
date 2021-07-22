from brownie import Lottery, config, network
import numpy as np
from scripts.helpful_scripts import (
    get_account,
    get_verify_status,
    get_contract,
)




def deploy_lottery():
    account = get_account()
    print(f"On network {network.show_active()}")
    return Lottery.deploy({"from": account})

def start_and_enter_lottery():
    lottery = Lottery[-1]
    lottery.startLottery(10, [40, 30, 10, 5, 5, 10])

    for i in range(10):
        randnums= np.random.randint(1,50,6)
        lottery.enter(randnums.tolist(), {"from": get_account(i), "value": 100000000000000000})

def main():
    deploy_lottery()
    start_and_enter_lottery()