import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constants";

export const connectToContract = () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    return contract;
}

export const formatedAccount = (account) => {
    return account.slice(0, 6) + "..." + account.slice(-4);
}

