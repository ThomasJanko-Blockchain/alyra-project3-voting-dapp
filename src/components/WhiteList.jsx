'use client'
import React, { useState } from 'react';
import {  connectWithSigner } from '@/utils/functions';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

const WhiteList = () => {
  const [voterAddress, setVoterAddress] = useState('');

  const handleInputChange = (e) => {
    setVoterAddress(e.target.value);
  };

  const registerVoter = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed.');
      return;
    }

    //check valid address
    if (!isValidAddress(voterAddress)) {
      toast.error('Invalid Ethereum address.');
      return;
    }

    const { contractInstance, signer } = await connectWithSigner();

    try {
      const ownerAddress = await contractInstance.owner();
      const userAddress = await signer.getAddress();

      if (ownerAddress.toLowerCase() !== userAddress.toLowerCase()) {
        toast.error('Only the contract owner can register voters.');
        return;
      }

      const tx = await contractInstance.addVoter(voterAddress);
      toast.success('Transaction submitted. Waiting for confirmation...');
      await tx.wait(1);
      setVoterAddress('');
      toast.success(`Voter ${voterAddress} registered successfully.`);
    } catch (error) {
      console.log('error', error.message);
      toast.error(error.message);
    }
  };

  const isValidAddress = (address) => {
    return ethers.isAddress(address);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Register Voter</h1>
      <input
        type="text"
        value={voterAddress}
        onChange={handleInputChange}
        placeholder="Enter voter's Ethereum address"
        className="w-full p-2 border rounded mb-4 text-black"
      />
      <button
        onClick={registerVoter}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
      >
        Register Voter
      </button>
    </div>
  );
};

export default WhiteList;
