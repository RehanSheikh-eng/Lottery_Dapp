from brownie import Lottery, Timer, VRFConsumer, config, network
import numpy as np
from scripts.helpful_scripts import (
    get_account,
    get_verify_status,
    get_contract,
    fund_with_link,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS
)
from ...tests.conftest import (
    SIZE_OF_LOTTERY,
    MAX_VALID_NUMBER, 
    FEE,
    ORIGIN_TIME,
    VALID_PRIZE_DISTRIBUTION
)

n = 2

def start_draw_n_lotteries(n):
    account = get_account()
    lottery = Lottery[-1]
    vrfconsumer = VRFConsumer[-1]

    for i in range(1, n):
        

        start_time = ORIGIN_TIME + (ORIGIN_TIME + 100) * i
        end_time = start_time + 100
        lottery.setCurrentTime(start_time, {"from": account})
        print(f"Start Time: {start_time}\nEnd Time:{end_time}")

        tx1 = lottery.startLottery(
                start_time,
                end_time,
                VALID_PRIZE_DISTRIBUTION,
                {"from": account})

        for i in range(10):
            randnums= np.random.randint(0, MAX_VALID_NUMBER, SIZE_OF_LOTTERY)
            lottery.enter(randnums.tolist(), {"from": get_account(i), "value": FEE})

        lotto_ID = lottery.lottoId({"from": account})
        lottery.setCurrentTime(end_time + 2, {"from": account})

        fund_with_link(vrfconsumer)

        tx2 = lottery.drawNumbers({"from": account})
        tx2.wait(1)
        request_id = tx2.events["RequestNumbers"]["requestId"]

        
        tx3 = get_contract("vrf_coordinator").callBackWithRandomness(
            request_id,
            777+i,
            vrfconsumer,
            {"from": get_account()})
        
        lotteryinfo = lottery.getLotteryInfo(lotto_ID, {"from": account})
        print(f"Lottery ID: {lotteryinfo[0]} \n Winning Numbers: {lotteryinfo[1]}")

def main():
    start_draw_n_lotteries(n)