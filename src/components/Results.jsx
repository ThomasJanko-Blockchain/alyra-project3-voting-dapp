'use client'
import { connectWithSigner } from '@/utils/functions';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Results() {

    const [winningProposalID, setWinningProposalID] = useState(null);
    const [proposal, setProposal] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            const { contractInstance } = await connectWithSigner();
            const results = await contractInstance.winningProposalID();
            setWinningProposalID(results);
        }
        fetchResults();
    }, []);

    const fetchProposal = async () => {
       try {
        const { contractInstance } = await connectWithSigner();
        const proposal = await contractInstance.getOneProposal(winningProposalID);
        setProposal(proposal);
       } catch (error) {
        toast.error('Error fetching proposal');
       }
    }

    useEffect(() => {
        fetchProposal();
    }, [winningProposalID]);
    
  return (
    <div className=''>
        <h1 className='text-2xl font-bold text-center'>Results</h1>
        <div>
            <h2 className='text-lg font-bold'>
                Winning Proposal: <span className='text-purple-500 font-bold text-xl'>{proposal}</span>
            </h2>
        </div>
    </div>
  )
}
