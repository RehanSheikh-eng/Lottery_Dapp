from ...tests.conftest import ORIGIN_TIME
from brownie import Lottery, VRFConsumer, config, network
from scripts.helpful_scripts import (
    get_account,
    get_verify_status,
    get_contract,
)

def draw_numbers():
    lottery = Lottery[-1]
    vrfconsumer = VRFConsumer[-1]
    account = get_account()

    lotto_ID = lottery.lottoId({"from": account})
    lottery.setCurrentTime(ORIGIN_TIME+105, {"from": account})

    tx1 = lottery.drawNumbers({"from": account})
    tx1.wait(1)
    request_id = tx1.events["RequestNumbers"]["requestId"]

    
    tx2 = get_contract("vrf_coordinator").callBackWithRandomness(
        request_id,
        777,
        vrfconsumer.address,
        {"from": get_account()})
    
    lotteryinfo = lottery.getLotteryInfo(lotto_ID, {"from": account})
    print(f"Lottery ID: {lotteryinfo[0]} \n Winning Numbers: {lotteryinfo[1]}")
    lottery.setCurrentTime(ORIGIN_TIME+110, {"from": account})

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
    #claim_prizes()