import { Button } from "@material-ui/core";
import React from "react";
import { useEffect, useState } from "react";
import loadContract from "../utils/loadContract";
import { ethers } from 'ethers'
import { toUtf8CodePoints } from "ethers/lib/utils";

export default function LotteryHub(){

    const [state, setState] = useState({
        allLotteriesWinningNumbers: [],
    });

    const [listitems, setListItems] = useState([]);
    const [provider, setProvider] = useState();
    const [loading, setLoading] = useState();
    const [lottery, setLottery] = useState();
    const [numTickets, setNumTickets] = useState();

    useEffect( async () => {

        const lottery = await loadContract("dev", "Lottery");
        setLottery(lottery);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const numTickets = await lottery.getNumberOfTickets();
        setNumTickets(numTickets.toNumber());

        const filter = lottery.filters.LotteryClose(null, null);

        const events = await lottery.queryFilter(filter);

        for (const item of events){

            const lotteryobj = {
                lotteryId: item.args["0"].toNumber(),
                winningNumbers: item.args["1"].map(e => {
                    return e.toNumber()
                }),
            };
            state.allLotteriesWinningNumbers.push(lotteryobj);
        }

        const listitems = state.allLotteriesWinningNumbers.map((item) =>
            <div>
                <div>
                    <li key={item.lotteryId}>
                        <div>
                            {
                                item.winningNumbers.map((e) =>
                                    e.toString()+", ")
                            }
                        </div>
                        <div>
                                {numTickets.toNumber()}
                        </div>
                    </li>
                </div>
                <div>
                    <Button onClick={() => handleClaimPrize(item.lotteryId)}> Claim Prize </Button>
                </div>
            </div>
        );
        setListItems(listitems);

        addLotteryContractListner();


        

    }, []);

    const handleClaimPrize = async (lotteryId) => {
        const lottery = await loadContract("dev", "Lottery");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const lottery_rw = lottery.connect(signer);
        const tx = await lottery_rw.claimPrize(lotteryId);
        console.log(tx);
    };

    async function addLotteryContractListner(){
        const lottery = await loadContract("dev", "Lottery");
        lottery.on("LotteryClose", async (lotteryId, winningNumbers, event) => {
            console.log(event);
            const lotteryobj = {
                lotteryId: lotteryId.toNumber(),
                winningNumbers: winningNumbers.map(e =>{
                    return e.toNumber()
                }),
            };

            const lotteryIdArray = state.allLotteriesWinningNumbers.map(e =>{
                return e.lotteryId
            });

            if (!lotteryIdArray.includes(lotteryobj.lotteryId)){
                    state.allLotteriesWinningNumbers.push(lotteryobj);
                };

            const listitems = state.allLotteriesWinningNumbers.map((item) =>
                <div>
                    <div>
                        <li key={item.lotteryId}>
                            <div>
                                {
                                item.winningNumbers.map((e) =>
                                    e.toString()+", ")
                                }
                            </div>
                            <div>
                                {numTickets.toNumber()}
                            </div>
                        </li>
                    </div>
                    <div>
                        <Button onClick={handleClaimPrize(item.lotteryId)}> Claim Prize </Button>
                    </div>
                </div>
            );
            setListItems(listitems);
        })
        lottery.on("BuyTicket", async (buyer, value ,event) => {
            const numTickets = await lottery.getNumberOfTickets();
            setNumTickets(numTickets.toNumber());

        })
    }

    return(
        <div>
            <div>
                <ol>
                    <div>
                        <div>
                            {listitems}
                        </div>
                    </div>

                </ol>

            </div>
            <div>

            </div>
        </div>
    );

}