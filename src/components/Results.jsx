'use client'
import { connectWithSigner } from '@/utils/functions';
import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import toast from 'react-hot-toast';
import { contractABI, contractAddress } from '@/utils/constants';
import { publicClient } from '@/utils/client';
import { readContract } from 'viem/actions';

export default function Results() {

    // const [winningProposalID, setWinningProposalID] = useState(null);
    const [proposal, setProposal] = useState(null);
    const { address } = useAccount()

    const { data: winningProposalID, isPending, error, refetch } = useReadContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'winningProposalID',
        account: address,
      })

    const fetchProposal = async () => {
       try {
        const proposal = await readContract(publicClient, {
            abi: contractABI,
            address: contractAddress,
            functionName: 'getOneProposal',
            args: [winningProposalID],
            account: address
        })
        console.log(proposal)
        setProposal(proposal)
       } catch (error) {
        toast.error('Error fetching proposal');
       }
    }

    useEffect(() => {
        if(winningProposalID) {
            fetchProposal();
        }
    }, [winningProposalID]);
    
  return (
    <div className=''>
        <h1 className='text-2xl font-bold text-center'>Results</h1>
        <div>
            <h2 className='text-lg font-bold'>
                Winning Proposal: <span className='text-purple-500 font-bold text-xl'>{proposal?.description}</span> <br />
                Number of Votes: <span className='text-purple-500 font-bold text-xl'>{proposal?.voteCount.toString()}</span>
            </h2>
        </div>
    </div>
  )
}
