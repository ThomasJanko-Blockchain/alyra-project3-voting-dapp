import { createPublicClient , createWalletClient, http } from 'viem';
import { mainnet, hardhat, sepolia } from 'viem/chains';

export const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
});
