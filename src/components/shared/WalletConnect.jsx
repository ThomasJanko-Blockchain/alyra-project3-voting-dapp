'use client'
import React, { useState, useEffect } from 'react';

export default function WalletConnect() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
      setAccount(null);
    } else {
      setAccount(accounts[0]);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this dApp.');
    }
  };

  return (
    <div>
      {account ? (
        <div>
          <p>{account}</p>
        </div>
      ) : (
        <button className='bg-blue-500 hover:bg-blue-700 text-white transition-all px-4 py-2 rounded-md' onClick={connectWallet}>Connect wallet</button>
      )}
    </div>
  );
}