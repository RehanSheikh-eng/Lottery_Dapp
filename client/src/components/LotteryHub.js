import { Button } from "@material-ui/core";
import React from "react";
import { useEffect, useState } from "react";
import loadContract from "../utils/loadContract";

export default function LotteryHub(){

    const [state, setState] = useState({
        allLotteriesWinningNumbers: [],
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
            <div>
                <div>
                    <li key={item.lotteryId}>
                        {
                        item.winningNumbers.map((e) =>
                            e.toString()+", ")
                        }
                    </li>
                </div>
                <div>
                    <Button> Claim Prize </Button>
                </div>
            </div>
        );
        setListItems(listitems);
        
        addLotteryContractListner();
    }, []);

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
            console.log(lotteryIdArray);
            if (!lotteryIdArray.includes(lotteryobj.lotteryId)){
                    state.allLotteriesWinningNumbers.push(lotteryobj);
                };
            
            const listitems = state.allLotteriesWinningNumbers.map((item) =>
                <div>
                    <div>
                        <li key={item.lotteryId}>
                            {
                            item.winningNumbers.map((e) =>
                                e.toString()+", ")
                            }
                        </li>
                    </div>
                    <div>
                        <Button> Claim Prize </Button>
                    </div>
                </div>
            );

            setListItems(listitems);
        })
    }

    return(
        <div>
            <div>
                <ol>
                    <div>
                        {listitems}
                    </div>
                </ol>
            </div>
            <div>

            </div>
        </div>
    );

}