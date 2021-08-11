import React from "react";
import { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import {
  connectWallet,
  getCurrentWalletConnected,
} from "./utils/interact";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  walletButton: {
    padding: "7px 16px",
    backgroundColor: "white",
    float: "right",
    border: "2px solid #254cdd",
    borderRadius: "40px",
    color: "#254cdd",
    marginTop:" 0px",
    '&:hover': {
      background: "rgba(37,76,221,0.1)",
    },
  }

});

const ConnectButton = () => {
  //state variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  // Styling MUI
  const classes = useStyles();

  //called only once
  useEffect(async () => {

    const { address, status } = await getCurrentWalletConnected();
    setWallet(address);
    setStatus(status);
    addWalletListener();

  }, []);


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


  return (
    <Button className={classes.walletButton} onClick={connectWalletPressed}>
      {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
      ) : (
          <span>Connect Wallet</span>
      )}
    </Button>
  );
};

export default ConnectButton;


