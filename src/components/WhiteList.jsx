'use client'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { contractABI, contractAddress } from '@/utils/constants';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WhiteList = ({ votersEvents }) => {
  const [voterAddress, setVoterAddress] = useState('');
  const [voters, setVoters] = useState([]); // Store registered voters
  const { address } = useAccount()

  const { data: hash, error, isPending, writeContract } = useWriteContract()


  const handleInputChange = (e) => {
    setVoterAddress(e.target.value);
  };

  const registerVoter = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed.');
      return;
    }
    
    try {
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'addVoter',
        args: [voterAddress],
        account: address
      })
    } catch (error) {
      console.log('error', error.message);
    }
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({hash})

  useEffect(() => {
    if (isConfirmed) {
        toast.success(`Transaction successful. 
          Hash: ${hash}`)
        setVoterAddress('')
    }
    if (error) {
      toast.error(error.shortMessage || error.message)
    }
}, [isConfirmed, error])

  useEffect(() => {
    console.log('votersEvents', votersEvents)
    if (votersEvents) {
      setVoters(votersEvents.map((event) => event.args.voterAddress))
    }
  }, [votersEvents])

  
  return (
    <div className="mx-auto mt-10 p-5 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Register Voter</h1>
      <div className='flex flex-col gap-y-2 my-2'>
        {isConfirming && <div>Waiting for confirmation...</div>}
      </div>
      <input
        type="text"
        value={voterAddress}
        onChange={handleInputChange}
        placeholder="Enter voter's Ethereum address"
        className="w-full p-2 border rounded mb-4 text-black"
      />
      <button
        disabled={isPending}
        onClick={registerVoter}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
      >
        {isPending ? 'Registering...' : 'Register Voter'}
      </button>

      {/* Display registered voters */}
      <h2 className="text-xl font-bold mt-10">Registered Voters</h2>
      <ul className="list-disc pl-5 mt-2 flex flex-col gap-y-2 max-h-[200px] overflow-y-auto overflow-x-hidden">
        {voters.length > 0 ? (
          voters.map((voter) => (
            <li key={voter} className="rounded-full border-white border-2 w-fit px-2 py-1">
              {(voter)}
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
