import React from "react";
import { useEffect, useState } from "react";
import loadContract from "../utils/loadContract";
import { ethers } from 'ethers'
import { Container } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { lineHeight } from "@material-ui/system";
import "./Balance.css"
import EnterButtonV2 from "./EnterButtonV2";


const useStyles = makeStyles({
    root: {
      flexGrow: 1,
    },

    balanceContainer: {
        background: "linear-gradient(rgb(118, 69, 217) 0%, rgb(69, 42, 122) 100%)",
    },

    balanceText:{
        color: "rgb(253, 171, 50)",
        lineHeight: 1.5,
        fontWeight: 600,
    }  
  });

export default function Balance(){

    const [loader, setLoader] = useState(false);
    const [ethbalance, setEthBalance] = useState(0);
    const [usdbalance, setUsdBalance] = useState(0);
    const [lottery, setLottery] = useState();
    const [drawTime, setDrawTime] = useState();
    const [lotteryId, setLotteryId] = useState(0);
    const [lotteryInfo, setLotteryInfo] = useState();

    const classes = useStyles();
    const MINUTE_MS = 30000;
    const URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum"

    useEffect(async () => {

        const lottery = await loadContract("42", "Lottery");
        setLottery(lottery);

        const ethbalance = await fetchCurrentBalance();
        setEthBalance(ethers.utils.formatEther(ethbalance));

        const lotteryId = await lottery.lottoId();
        setLotteryId(lotteryId.toNumber());

        const lotteryInfo = await lottery.getLotteryInfo(lotteryId);
        setLotteryInfo(lotteryInfo);

        const unixTime = lotteryInfo[5];
        const unixTimeDateObj = new Date(unixTime.toNumber() * 1000);
        const unixTimeString = unixTimeDateObj.toUTCString(); 
        setDrawTime(unixTimeString);

        addLotteryContractListner();

        function fetchPrice(){
            fetch(URL)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(typeof ethbalance);
                console.log(data[0].current_price);
                const usdbalance = ethers.utils.formatEther(ethbalance) * (data[0].current_price);
                setUsdBalance(usdbalance);
            })
        }
        fetchPrice();
        const interval = setInterval(fetchPrice, MINUTE_MS);

        return () => clearInterval(interval);

      }, []);
    useEffect(() => {
        function fetchPrice(){
            fetch(URL)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(typeof ethbalance);
                console.log(data[0].current_price);
                const usdbalance = ethbalance * (data[0].current_price);
                setUsdBalance(usdbalance);
            })
        }
        fetchPrice();
    }, [ethbalance]);

    async function addLotteryContractListner(){
        const lottery = await loadContract("42", "Lottery");
        lottery.on("BuyTicket", async (author, value, event) => {
            console.log(event);
            const ethbalance = await fetchCurrentBalance();
            setEthBalance(ethers.utils.formatEther(ethbalance));
        })

        lottery.on("LotteryOpen", async (lotteryId, event) => {

            setLotteryId(lotteryId.toNumber());

            const lotteryInfo = await lottery.getLotteryInfo(lotteryId);
            setLotteryInfo(lotteryInfo);

            const unixTime = lotteryInfo[5];
            const unixTimeDateObj = new Date(unixTime.toNumber() * 1000);
            const unixTimeString = unixTimeDateObj.toUTCString(); 
            setDrawTime(unixTimeString);
        })
    }

    async function fetchCurrentBalance() {

        const lottery = await loadContract("42", "Lottery");
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
        <div className="buy_box_container">
            <div className="buy_box">
                <div className="buy_box_top_bar">
                    <div className="buy_box_top_bar_content">
                        <h2 className="buy_box_top_bar_content_left">
                            Next Draw :
                        </h2>
                        <div className="buy_box_top_bar_content_right">
                            #{lotteryId} | Draw: {drawTime}
                        </div>
                    </div>
                </div>
                <div className="buy_box_main_box">
                    <div className="buy_box_main_box_content">
                        <div className="Prize-Pot">
                            <div className="Prize-Pot-text-container">
                                <h2 className="Prize-Pot-text">
                                    Prize Pot :
                                </h2>
                            </div>

                            <div className="Prize-Pot-balance">
                                <div className="Prize-Pot-balance-usd">
                                    <span>{"$"+Math.round(usdbalance)}</span>
                                </div>
                                <div className="Prize-Pot-balance-ether">
                                    <span>{ethbalance + " ETH"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="Buy-Button-Box">
                            <EnterButtonV2></EnterButtonV2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}