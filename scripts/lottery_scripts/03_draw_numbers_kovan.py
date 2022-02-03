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

def draw_numbers():
    lottery = Lottery[-1]
    vrf_contract = VRFConsumer[-1]
    account = get_account()
    tx = fund_with_link(
        vrf_contract,
        amount=config["networks"][network.show_active()]["fee"]
    )
    tx.wait(1)
    tx1 = lottery.drawNumbers({"from": account})
    tx1.wait(1)

def main():
    draw_numbers()
