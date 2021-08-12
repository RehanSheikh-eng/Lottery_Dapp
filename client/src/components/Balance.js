import React from "react";
import { useEffect, useState } from "react";
import loadContract from "../utils/loadContract";
import { ethers } from 'ethers'


export default function Balance(){

    const [loader, setLoader] = useState(false);
    const [ethbalance, setEthBalance] = useState(0);
    const [usdbalance, setUsdBalance] = useState(0);
    const [lottery, setLottery] = useState();
    const [price, setPrice] = useState("0.00");
    const [lastfetch, setLastFetch] = useState("")

    const MINUTE_MS = 10000;
    const URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum"

    useEffect(async () => {

        const lottery = await loadContract("dev", "Lottery");
        setLottery(lottery);

        const ethbalance = await fetchCurrentBalance();
        setEthBalance(ethbalance);

        addLotteryContractListner();

        const interval = setInterval(function fetchPrice(){
            fetch(URL)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(typeof ethbalance);
                const usdbalance = ethers.utils.formatEther(ethbalance) * (data[0].current_price);
                setUsdBalance(usdbalance);
            })
          }(), MINUTE_MS);



        console.log(ethbalance);
        console.log(typeof ethbalance);

        return () => clearInterval(interval);

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
            return ethbalance;
          } catch (err) {
            console.log("Error: ", err)
          }
    }    

    return(
        <div>
            <h1>{ethers.utils.formatEther(ethbalance)}</h1>
            <h1>{usdbalance.toString()}</h1>
        </div>


    );
}