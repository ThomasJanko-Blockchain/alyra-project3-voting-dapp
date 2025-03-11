'use client'
import React, { useState, useEffect } from 'react';
import { connectWithSigner } from '@/utils/functions';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

const WhiteList = () => {
  const [voterAddress, setVoterAddress] = useState('');
  const [voters, setVoters] = useState([]); // Store registered voters

  useEffect(() => {
    async function fetchVoters() {
      try {
        const { contractInstance } = await connectWithSigner();
        const filter = contractInstance.filters.VoterRegistered();
        const events = await contractInstance.queryFilter(filter);
        
        const registeredVoters = events.map(event => event.args.voterAddress);
        setVoters(registeredVoters);
      } catch (error) {
        console.error("Error fetching voters:", error);
        toast.error("Failed to fetch registered voters.");
      }
    }

    async function listenForEvents() {
      const { contractInstance } = await connectWithSigner();

      if (!contractInstance) {
        console.error('Contract instance is undefined');
        return;
      }

      contractInstance.on("VoterRegistered", (voterAddress) => {
        console.log("New Voter Registered:", voterAddress);
        setVoters((prevVoters) => [...prevVoters, voterAddress]);
        toast.success(`Voter ${voterAddress} registered successfully.`);
      });
    }

    fetchVoters();
    listenForEvents();

    return () => {
      async function removeListener() {
        const { contractInstance } = await connectWithSigner();
        if (contractInstance) {
          contractInstance.removeAllListeners("VoterRegistered");
        }
      }
      removeListener();
    };
  }, []);

  const handleInputChange = (e) => {
    setVoterAddress(e.target.value);
  };

  const registerVoter = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed.');
      return;
    }

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

      {/* Display registered voters */}
      <h2 className="text-xl font-bold mt-6">Registered Voters</h2>
      <ul className="list-disc pl-5">
        {voters.length > 0 ? (
          voters.map((voter, index) => (
            <li key={index} className="">
              {voter}
            </li>
          ))
        ) : (
          <p>No voters registered yet.</p>
        )}
      </ul>
    </div>
  );
};

export default WhiteList;
