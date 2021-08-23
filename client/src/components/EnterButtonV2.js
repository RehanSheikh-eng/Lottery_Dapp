import React from "react";
import { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import loadContract from "../utils/loadContract";
import { ethers } from 'ethers'
import {
    getCurrentWalletConnected,
  } from "../utils/interact";
import "./EnterButtonV2.css";
import ball from "../tennis-ball.svg";
import { makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

const useStyles = makeStyles({
    root: {
        alignItems: "center",
        border: 0,
        borderRadius: "16px",
        boxShadow: "rgb(14 14 44 / 40%) 0px -1px 0px 0px inset",
        display: "inline-flex",
        fontSize: "16px",
        fontWeight: 600,
        justifyContent: "center",
        letterSpacing: "0.03em",
        lineHeight: 1,
        opacity: 1,
        outline: "0px",
        height: "48px",
        padding: "0px 24px",
        backgroundColor: "rgb(31, 199, 212)",
        color: "white",
        maxWidthidth: "280px",

        '&:hover': {
            backgroundColor: "rgba(31, 199, 212, 0.6)",
        }
    },
    disabled: {
        backgroundColor: "rgba(31, 199, 212, 0.4)",
    },
    
  });


export default function EnterButtonV2() {

    const [state, setState] = useState({});

    const classes = useStyles();

    const [disabled, setDisabled] = useState();
    const [lottery, setLottery] = useState();
    const [provider, setProvider] = useState();
    const [lotterySize, setLotterySize] = useState();
    const [maxValidNumber, setMaxValidNumber] = useState();
    const [lotteryId, setLotteryId] = useState();
    const [lotteryInfo, setLotteryInfo] = useState();
    const [numberOptions, setNumberOptions] = useState([]);
    const [rotation, setRotation] = useState([]);
    const [hueRotate, setHueRotate] = useState([]);
    const [successSnackOpen, setSuccessSnackOpen] = useState(false);
    const [loading, setLoading] = useState(false);



    useEffect(async () => {

        const lottery = await loadContract("dev", "Lottery");
        setLottery(lottery);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const lotterySize = await lottery.sizeOfLottery();
        setLotterySize(lotterySize.toNumber());

        const stateobj = {};
        for (let i = 0; i < lotterySize.toNumber(); i++) {
            const nameId = `num${i+1}`;
            stateobj[nameId] = "0";
        };
        setState(stateobj);

        const maxValidNumber = await lottery.maxValidNumber();
        setMaxValidNumber(maxValidNumber.toNumber());
        
        const lotteryId = await lottery.lottoId();
        setLotteryId(lotteryId);
        console.log(`Lottery ID: ${lotteryId}`);

        const lotteryInfo = await lottery.getLotteryInfo(lotteryId);
        console.log(lotteryInfo);
        setLotteryInfo(lotteryInfo);

        if (lotteryInfo[2] === 1){
            console.log("setting disabled false");
            setDisabled(false);
        } else {
            console.log("setting disabled true");
            setDisabled(true);
        }

        const numberOptions = [];
        for (let i = 0; i < maxValidNumber.toNumber() + 1; i++) {
            const obj = { value: `${i}`, label: i, };
            numberOptions.push(obj);
        }
        setNumberOptions(numberOptions);

        const rotation = [];
        for (let i = 0; i < lotterySize.toNumber(); i++) {
            let rot = Math.floor(Math.random()*15 + 7);
            rot *= Math.round(Math.random()) ? 1 : -1;
            rotation.push(rot);
        };
        setRotation(rotation);

        const hueRotate = []
        for (let i = 0; i < lotterySize.toNumber(); i++) {
            let numrots = 360/lotterySize.toNumber(); 
            let rot = numrots * i;
            hueRotate.push(rot);
        };
        setHueRotate(hueRotate);

        addLotteryContractListner();

    }, []);

    const handleChange = e => {
        const value = e.target.value;
        console.log(value);
        console.log(typeof value);
        console.log(e.target.name);
        console.log(typeof e.target.name);
        setState({
        ...state,
        [e.target.name]: value,
        });
    };

    const handleBuyTicket = async () => {
        const { address, status } = await getCurrentWalletConnected();
        console.log(address);
        const signer = provider.getSigner();
        const lottery_rw = lottery.connect(signer);

        const numbers = Object.values(state);
        setLoading(true);
        const tx = await lottery_rw.enter(numbers.map(x=>+x), {value: ethers.utils.parseEther("0.1")});
        setLoading(false);

        const stateobj = {};
        for (let i = 0; i < lotterySize; i++) {
            const nameId = `num${i+1}`;
            stateobj[nameId] = "0";
        };

        setState(stateobj);
        Array.from(document.querySelectorAll("select")).forEach(
            select => (select.value = "0")
          );
        
        setSuccessSnackOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSuccessSnackOpen(false);
    };

    async function addLotteryContractListner(){
        const lottery = await loadContract("dev", "Lottery");
        lottery.on("LotteryOpen", async (lotteryId, event) => {
            console.log(event);
            setDisabled(false);
            setLotteryId(lotteryId);
        })
        lottery.on("LotteryClose", async (lotteryId, event) => {
            console.log(event);
            setDisabled(true);
        })
    }

    return(
        <div>
            <div>
                <div style={{
                        textAlign: "center",
                        marginBottom: "10px",
                        fontSize: "20px"}}>
                    <h2> 
                        Your Ticket : 
                    </h2>
                </div>
            </div>
            <div className="number-select-container">
                {
                    Object.keys(state).map((key, i) => (
                        <div className="circle">
                            <img 
                                src={ball}
                                width="80px"
                                height="80px" 
                                style={{
                                    position: "absolute",
                                    zIndex: 2,
                                    filter: `hue-rotate(${hueRotate[i]}deg)`,
                                }}
                                className="lottery-img"
                            />
                            <select 
                                onChange={handleChange}
                                name={key}
                                id={key}
                                style={{
                                    transform: `rotate(${rotation[i]}deg)`,
                                }}
                                value={state.key}
                            >
                                {
                                    numberOptions.map((item, key) =>
                                        <option key={key} value={item.value}>{item.label}</option> 
                                    )
                                }
                            </select>
                        </div>
                    ))
                }
            </div>
            <div className="buy-button-container">
                <Button 
                    onClick={handleBuyTicket}
                    disabled={disabled}
                    classes={{
                        root: classes.root,
                        disabled: classes.disabled,
                    }}
                >
                    BUY TICKET
                </Button>
                <div style={{marginLeft: 10}}>
                    {
                        loading ? <CircularProgress /> : null
                    }
                </div>
            </div>
            <div>
                <Snackbar open={successSnackOpen} autoHideDuration={3000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="success">
                        Success! View your tickets below
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
} 