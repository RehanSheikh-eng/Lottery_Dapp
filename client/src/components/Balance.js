import React from "react";
import { useEffect, useState } from "react";
import loadContract from "../utils/loadContract";
import { ethers } from 'ethers'


export default function Balance(){

    const [loader, setLoader] = useState(false);
    const [ethbalance, setEthBalance] = useState(0);
    const [usdbalance, setUsdBalance] = useState(0);
    const [lottery, setLottery] = useState();

    useEffect(async () => {
        
        const lottery = await loadContract("dev", "Lottery");
        setLottery(lottery);
        await fetchCurrentBalance();
        console.log(ethbalance);
        await addLotteryContractListner();

      }, []);


    async function addLotteryContractListner(){
        const lottery = await loadContract("dev", "Lottery");
        lottery.on("BuyTicket", async (author, value, event) => {
            console.log(event);
            await fetchCurrentBalance();
        })
    }

    async function fetchCurrentBalance() {

        const lottery = await loadContract("dev", "Lottery");
          try {
            const address = lottery.address;
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const ethbalance = await provider.getBalance(address);
            setEthBalance(ethbalance.toString());
          } catch (err) {
            console.log("Error: ", err)
          }
    }    
    
    

    return(

        <h1>{ethbalance}</h1>

    );
}