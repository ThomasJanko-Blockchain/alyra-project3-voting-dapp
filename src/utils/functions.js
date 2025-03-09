import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constants";

export const connectToContract = async () => {
    try {
        if (!window.ethereum) {
            throw new Error("MetaMask non détecté !");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
        console.log("✅ Contrat connecté :", contractInstance);

        return {contractInstance, provider};
    } catch(error) {
        console.error("❌ Erreur de connexion au contrat :", error);
        return null;
    }
}

export const formatedAccount = (account) => {
    return account.slice(0, 6) + "..." + account.slice(-4);
}

