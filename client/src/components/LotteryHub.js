import React from "react";
import { useEffect, useState } from "react";
import loadContract from "../utils/loadContract";

export default function LotteryHub(){

    const [state, setState] = useState({
        allLotteriesWinningNumbers: []
    });

    const [listitems, setListItems] = useState([]);
    const [loading, setLoading] = useState();

    useEffect( async () => {

        const lottery = await loadContract("dev", "Lottery");
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
        <li>
            {
            item.winningNumbers.map((e) =>
                e.toString()+", ")
            }
        </li>
        );
        setListItems(listitems);

        lottery.on(filter, async (lotteryId, winningNumbers, event) => {
            const lotteryobj = {
                lotteryId: lotteryId.toNumber(),
                winningNumbers: winningNumbers.map(e =>{
                    return e.toNumber()
                }),
            };
            console.log(event);
            state.allLotteriesWinningNumbers.push(lotteryobj);
            const listitems = state.allLotteriesWinningNumbers.map((item) =>
                <li>
                {
                item.winningNumbers.map((e) =>
                    e.toString()+", ")
                }
                </li>
            );
            setListItems(listitems);
        });
    }, []);

    async function addLotteryContractListner(){
        const lottery = await loadContract("dev", "Lottery");
        lottery.on("LotteryClose", (lotteryId, winningNumbers, event) => {
            console.log(event);
            const lotteryobj = {
                lotteryId: lotteryId.toNumber(),
                winningNumbers: winningNumbers.map(e =>{
                    return e.toNumber()
                }),
            };
            state.allLotteriesWinningNumbers.push(lotteryobj);

            const listitems = state.allLotteriesWinningNumbers.map((item) =>
                <li>
                    {
                    item.winningNumbers.map((e) =>
                        e.toString()+", ")
                    }
                </li>
            );

            setListItems(listitems);
        })
    }

    return(
        <div>
            <div>
                <ol>
                    {listitems}
                </ol>
            </div>
            <div>

            </div>
        </div>
    );

}