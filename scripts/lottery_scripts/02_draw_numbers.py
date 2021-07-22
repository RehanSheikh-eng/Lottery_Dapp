from brownie import Lottery, VRFConsumer, config, network
from scripts.helpful_scripts import (
    get_account,
    get_verify_status,
    get_contract,
)

def draw_numbers():
    lottery = Lottery[-1]
    account = get_account()

    lottery.initialize(VRFConsumer[-1].address, {"from": account})
    tx = lottery.drawNumbers({"from": account})
    tx.wait(1)
    lotteryId = lottery.getLotteryId({"from": account})
    lotteryinfo = lottery.getLotteryInfo(lotteryId, {"from": account})
    print(f"Lottery ID: {lotteryinfo[0]} \n Winning Numbers: {lotteryinfo[1]}")

def claim_prizes():
    lottery = Lottery[-1]
    account = get_account()
    lotteryId = lottery.getLotteryId({"from": account})
    for i in range(10):
        numbers = lottery.getTicketNumber(0, {"from": get_account(i)})
        print(f"Account: {i} \n Numbers:{numbers}")
        lottery.claimPrize(lotteryId)


        

def main():
    draw_numbers()
    claim_prizes()