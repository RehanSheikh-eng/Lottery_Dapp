
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

SIZE_OF_LOTTERY = 5
MAX_VALID_NUMBER = 10
FEE = 1_000_000_000_000_000


def deploy_lottery():
    account = get_account()
    print(f"On network {network.show_active()}")
    timer_address = ZERO_ADDRESS
    lottery = Lottery.deploy(
        SIZE_OF_LOTTERY,
        MAX_VALID_NUMBER,
        FEE,
        timer_address,
        {"from": account})

    keyhash = config["networks"][network.show_active()]["keyhash"]
    fee = config["networks"][network.show_active()]["fee"]
    vrf_coordinator = get_contract("vrf_coordinator")
    link_token = get_contract("link_token")

    print(f"Lottery Contract Deployed at:{lottery.address}")

    vrf_contract = VRFConsumer.deploy(
        keyhash,
        vrf_coordinator,
        link_token,
        lottery.address,
        fee,
        {"from": account},
        publish_source=get_verify_status(),
    )

    print(f"VRFConsumer Contract Deployed at:{vrf_contract.address}")

    tx = fund_with_link(
        vrf_contract,
        amount=config["networks"][network.show_active()]["fee"]
    )
    tx.wait(1)

    lottery.initialize(
        vrf_contract.address,
        {"from": get_account()}
    )


def main():
    deploy_lottery()
