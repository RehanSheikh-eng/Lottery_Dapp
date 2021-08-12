import map from "../artifacts/deployments/map.json"
import { ethers } from 'ethers'

const loadContract = async (chain, contractName) => {
    if (typeof window.ethereum !== 'undefined'){

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
            contractArtifact = await import(`../artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "../artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }
        const contractAbi = contractArtifact.abi
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const iface = new ethers.utils.Interface(contractAbi);
        console.log(iface.format(ethers.utils.FormatTypes.full));
        return new ethers.Contract(address, iface, provider)
    }
}
export default loadContract