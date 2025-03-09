'use client'
import React, { useState } from 'react';
import { connectToContract } from '@/utils/functions';

const WhiteList = () => {
  const [voterAddress, setVoterAddress] = useState('');
  const [status, setStatus] = useState('');

  const handleInputChange = (e) => {
    setVoterAddress(e.target.value);
  };

  const registerVoter = async () => {
    if (!window.ethereum) {
      setStatus('MetaMask is not installed.');
      return;
    }

    const {contractInstance, provider} = await connectToContract();
    const signer = provider.getSigner();

    try {
      const ownerAddress = await contractInstance.owner();
      const userAddress = (await signer).getAddress();

      if (ownerAddress.toLowerCase() !== userAddress.toLowerCase()) {
        setStatus('Only the contract owner can register voters.');
        return;
      }

      const tx = await contractInstance.addVoter(voterAddress);
      setStatus('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      setStatus(`Voter ${voterAddress} registered successfully.`);
      setVoterAddress('');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
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
      {status && <p className="mt-4 text-red-500">{status}</p>}
    </div>
  );
};

export default WhiteList;
