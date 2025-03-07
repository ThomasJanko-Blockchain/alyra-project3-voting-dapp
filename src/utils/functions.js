import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constants";

export const connectToContract = () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    return contract;
}

