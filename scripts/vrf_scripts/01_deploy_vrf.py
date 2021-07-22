#!/usr/bin/python3
from brownie import VRFConsumer, Lottery, config, network
from scripts.helpful_scripts import (
    fund_with_link,
    get_account,
    get_verify_status,
    get_contract,
)


def depoly_vrf():
    account = get_account()
    print(f"On network {network.show_active()}")
    keyhash = config["networks"][network.show_active()]["keyhash"]
    fee = config["networks"][network.show_active()]["fee"]
    vrf_coordinator = get_contract("vrf_coordinator")
    link_token = get_contract("link_token")
    lottery = Lottery[-1]
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
    return vrf_contract


def main():
    vrf_contract = depoly_vrf()
    fund_with_link(vrf_contract, amount=config["networks"][network.show_active()]["fee"])
