import React from "react";
import { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import loadContract from "../utils/loadContract";
import { ethers } from 'ethers'
import {
    getCurrentWalletConnected,
  } from "../utils/interact";

export default function EnterButtonV2() {

    const numberOptions = [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4'},
        { value: 5, label: '5'},
        { value: 6, label: '6'},
        { value: 7, label: '7'},
        { value: 8, label: '8'},
        { value: 9, label: '9'},
        { value: 10, label: '10'},
        { value: 11, label: '11'},
        { value: 12, label: '12'},
        { value: 13, label: '13'},
        { value: 14, label: '14'},
        { value: 15, label: '15'},
        { value: 16, label: '16'},
        { value: 17, label: '17'},
        { value: 18, label: '18'},
        { value: 19, label: '19'},
        { value: 20, label: '20'},
        { value: 21, label: '21'},
        { value: 22, label: '22'},
        { value: 23, label: '23'},
        { value: 24, label: '24'},
        { value: 25, label: '25'},
        { value: 26, label: '26'},
        { value: 27, label: '27'},
        { value: 28, label: '28'},
        { value: 29, label: '29'},
        { value: 30, label: '30'},
      ];

    const [state, setState] = useState({
        num1: 0,
        num2: 0,
        num3: 0,
        num4: 0,
        num5: 0,
        num6: 0,
    });

    const handleChange = e => {
        setState({
        ...state,
        [e.target.name]: e.target.value,
        })
    };

    const handleBuyTicket = async () => {
        const lottery = await loadContract("dev", "Lottery");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { address, status } = await getCurrentWalletConnected();
        console.log(address);
        const signer = provider.getSigner();
        const lottery_rw = lottery.connect(signer);

        const numbers = Object.values(state);

        const tx = await lottery_rw.enter(numbers, {value: ethers.utils.parseEther("0.1")});

    };

    return(
        <div>
            <div>
                <label for="num1">Number 1:</label>
                <select onChange={handleChange} name="num1" id="num1">
                    {
                        numberOptions.map((item) =>
                            <option key={item.value} value={item.value}>{item.label}</option> 
                    )};
                </select>
                <label for="num2">Number 2:</label>
                <select onChange={handleChange} name="num2" id="num2">
                    {
                        numberOptions.map((item) =>
                            <option key={item.value} value={item.value}>{item.label}</option> 
                    )};
                </select>
                <label for="num3">Number 3:</label>
                <select onChange={handleChange} name="num3" id="num3">
                    {
                        numberOptions.map((item) =>
                            <option key={item.value} value={item.value}>{item.label}</option> 
                    )};
                </select>
                <label for="num4">Number 4:</label>
                <select onChange={handleChange} name="num4" id="num4">
                    {
                        numberOptions.map((item) =>
                            <option key={item.value} value={item.value}>{item.label}</option> 
                    )};
                </select>
                <label for="num5">Number 5:</label>
                <select onChange={handleChange} name="num5" id="num5">
                    {
                        numberOptions.map((item) =>
                            <option key={item.value} value={item.value}>{item.label}</option> 
                    )};
                </select>
                <label for="num6">Number 6:</label>
                <select onChange={handleChange} name="num6" id="num6">
                    {
                        numberOptions.map((item) =>
                            <option key={item.value} value={item.value}>{item.label}</option> 
                    )};
                </select>
            </div>
            <div>
                Your Numbers: {state.num1 + ", " + state.num2 + ", " + state.num3 + ", " + state.num4 + ", " + state.num5 + ", " + state.num6}
            </div>
            <div>
                <Button onClick={handleBuyTicket}>BUY TICKET</Button>
            </div>
        </div>
    );
} 