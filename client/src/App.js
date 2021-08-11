import React, {useEffect, useState} from "react"
import './App.css'
import Web3 from "web3";
import {getWeb3} from "./utils/getWeb3"
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./utils/getEthereum"
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { connectWallet, getCurrentWalletConnected } from "./utils/interact.js";
  

export default function App() {

    useEffect(async () => {
        await loadWeb3();
        await loadBlockchainData();
        addWalletListener()
    }, [])

    const classes = useStyles();

    const [loader, setLoader] = useState(true);
    const [lottery, setLottery] = useState(null);
    const [networkId, setNetworkId] = useState(NaN);
    const [status, setStatus] = useState("");
    const [walletAddress, setWallet] = useState("");

    const loadWeb3 = async() => {
        if(window.ethereum)
        {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        }
        else if(window.web3)
        {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else
        {
            window.alert("Metamask not detected");
        }
    }
  
    const loadBlockchainData = async () => {

        setLoader(true);
        const web3 = window.web3;
    
        const accounts=await web3.eth.getAccounts();
        setWallet(accounts[0]);
        console.log("accounts:"+accounts);

        const networkId = await web3.eth.net.getId();
        setNetworkId(networkId);
        console.log("networkId:"+networkId);

        if (networkId <= 42) {
            // Wrong Network!
            return
        }

        const Lottery = await loadContract("dev", "Lottery")
        setLottery(Lottery);
        console.log("Contract Deployed at:"+Lottery.options.address)

        if (!Lottery) {
            window.alert("Smart contract is not deployed");
        }
        setLoader(false);
    }

    const loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const web3 = window.web3;

        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][0]
        } catch (e) {
            console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`)
            return undefined
        }

        // Load the artifact with the specified address
        let contractArtifact
        try {
            contractArtifact = await import(`./artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }

        return new web3.eth.Contract(contractArtifact.abi, address)
    }

    function addWalletListener() {
        if (window.ethereum) {
          window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
              setWallet(accounts[0]);
              setStatus("👆🏽 Write a message in the text-field above.");
            } else {
              setWallet("");
              setStatus("🦊 Connect to Metamask using the top right button.");
            }
          });
        } else {
          setStatus(
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          );
        }
    }
    
    const connectWalletPressed = async () => {
        const walletResponse = await connectWallet();
        setStatus(walletResponse.status);
        setWallet(walletResponse.address);
    }; 

    if(loader){
      return <div >Loading</div>
    }

    if (isNaN(networkId) || networkId <= 42) {
        return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
    }

    if (!lottery) {
        return <div>Could not find a deployed contract. Check console for details.</div>
    }
  
    return (
        <div className="App">
            <nav>
                <AppBar position="static">
                    <Toolbar>

                        <IconButton 
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="menu"
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" className={classes.title}>
                            Lottery
                        </Typography>

                        <Button 
                        color="inherit"
                        variant="contained"
                        onClick={connectWalletPressed}
                        >
                            {
                            walletAddress.length > 0 ? 
                            ("Connected: " +
                            String(walletAddress).substring(0, 6) +
                            "..." +
                            String(walletAddress).substring(38)) :
                            (<span>Connect Wallet</span>)
                            }

                        </Button>
                    </Toolbar>
                </AppBar>
            </nav>
            <div>
                <Container maxWidth="lg">
                    <Button variant="contained"> BUY TICKETS </Button>
                </Container>
            </div>
        </div>
    );
  }
  
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));