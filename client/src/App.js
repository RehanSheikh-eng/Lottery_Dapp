import React, {Component} from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./getEthereum"

class App extends Component {

    state = {
        web3: null,
        accounts: null,
        chainid: null,
        Lottery: null,
        solidityValue: 0,
        solidityInput: 0,
    }

    componentDidMount = async () => {

        // Get network provider and web3 instance.
        const web3 = await getWeb3()

        // Try and enable accounts (connect metamask)
        try {
            const ethereum = await getEthereum()
            ethereum.enable()
        } catch (e) {
            console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }

        // Use web3 to get the user's accounts
        const accounts = await web3.eth.getAccounts()

        // Get the current chain id
        const chainid = parseInt(await web3.eth.getChainId())

        this.setState({
            web3,
            accounts,
            chainid
        }, await this.loadInitialContracts)

    }

    loadInitialContracts = async () => {
        if (this.state.chainid <= 42) {
            // Wrong Network!
            return
        }

        const Lottery = await this.loadContract("dev", "Lottery")

        if (!Lottery) {
            return
        }

        this.setState({
            Lottery,
        })
    }

    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const {web3} = this.state

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

    changeSolidity = async (e) => {
        const {accounts, solidityStorage, solidityInput} = this.state
        e.preventDefault()
        const value = parseInt(solidityInput)
        if (isNaN(value)) {
            alert("invalid value")
            return
        }
        await solidityStorage.methods.set(value).send({from: accounts[0]})
            .on('receipt', async () => {
                this.setState({
                    solidityValue: await solidityStorage.methods.get().call()
                })
            })
    }

    render() {
        const {
            web3, accounts, chainid,
            Lottery, solidityValue, solidityInput
        } = this.state

        if (!web3) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }

        if (isNaN(chainid) || chainid <= 42) {
            return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        if (!Lottery) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false

        return (
        <div className="App">
            <h1>Your Brownie Mix is installed and ready.</h1>
            <p>
                Your accounts: {accounts[0]}
            </p>
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page to
                        be able to edit the storage fields.</strong>
                    </p>
                    : null
            }
        </div>)
    }
}

export default App
