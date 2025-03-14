'use client'
import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { contractABI, contractAddress } from '@/utils/constants';
import { readContract } from 'viem/actions';
import { publicClient } from '@/utils/client';
import toast from 'react-hot-toast';

export default function ProposalRegistration({ proposalsEvents }) {
    const [proposal, setProposal] = useState('');
    const [proposals, setProposals] = useState([]); // Store registered proposals
    const [numberProposals, setNumberProposals] = useState(0);
    const { address } = useAccount()

    const { data: hash, error, isPending, writeContract } = useWriteContract()
    

    const handleSubmit = async () => {
        if (!proposal) {
            toast.error('Proposal is required.');
            return;
        }

        try {
            writeContract({
                address: contractAddress,
                abi: contractABI,
                functionName: 'addProposal',
                args: [proposal],
                account: address
            })
        } catch (error) {
            toast.error(error.message);
        }
    };

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({hash})

    useWatchContractEvent({
        address: contractAddress,
        abi: contractABI,
        eventName: 'ProposalRegistered',
        onLogs(log) {
            console.log('ProposalRegistered event triggered', log[0].args.proposalId.toString())
            setNumberProposals(log[0].args.proposalId.toString())
        },
    })

    useEffect(() => {
        if (isConfirmed) {
            toast.success(`Transaction successful. 
            Hash: ${hash}`)
            setProposal('');
        }
        if (error) {
            toast.error(error.shortMessage || error.message);
        }
    }, [isConfirmed, error])

    const fetchProposals = async () => {

        //get all proposals from numberProposals to 0
       if(numberProposals > 0) {
        let results = []
        for(let i = 1; i <= numberProposals; i++) {
            const proposal = await readContract(publicClient, {
                abi: contractABI,
                address: contractAddress,
                functionName: 'getOneProposal',
                args: [i],
                account: address
            })
            results.push(proposal)
        }
        console.table(results)
        setProposals(results)

       }
    };

    useEffect(() => {
        console.log('fetching proposals', numberProposals)
        if (proposalsEvents.length > 0) {
            setNumberProposals(proposalsEvents.length)
        }
        if (address) {
            fetchProposals();
        }
    }, [numberProposals, proposalsEvents, address]);



    return (
        <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Register Proposal</h1>
            <div className='flex flex-col gap-y-2 my-2'>
                {isConfirming && <div>Waiting for confirmation...</div>}
            </div>
            <input
                type="text"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Enter proposal"
                className="w-full p-2 border rounded mb-4 text-black"
            />
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
                Register Proposal
            </button>

            {/* Display the list of proposals */}
            <h2 className="text-xl font-bold mt-6">Registered Proposals <span className='text-sm text-gray-500'>({numberProposals})</span></h2>
            <ul className="list-disc pl-5 max-h-[300px] overflow-y-auto">
                {proposals.length > 0 ? (
                    proposals.map((proposal) => (
                        <li key={crypto.randomUUID()} className="py-1 text-lg list-decimal cursor-pointer px-2">
                            {proposal.description}
                        </li>
                    ))
                ) : (
                    <p>No proposals registered yet.</p>
                )}
            </ul>
        </div>
    );
}
