'use client'
import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractABI, contractAddress } from '@/utils/constants';
import { publicClient } from '@/utils/client';
import { parseAbiItem } from 'viem';

export default function ProposalRegistration() {
    const { address } = useAccount();
    const [proposal, setProposal] = useState('');
    const [proposalsList, setProposalsList] = useState([]);

    const { data: hash, error, isPending: setIsPending, writeContract } = useWriteContract({});
    const { isLoading: isConfirming, isSuccess, error: errorConfirmation } = useWaitForTransactionReceipt({hash})


    useEffect(() => {
       const getAllEvents = async () => {
        if (address !== undefined) {
            await getEvents();
        }
       }
       getAllEvents();
    }, [address])

    const getEvents = async () => {
        const proposalsChangedLog = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
            fromBlock: 0n,
            toBlock: 'latest',
        });
    
        const proposalsEvents = await Promise.all(proposalsChangedLog.map(async (log) => {
            const proposal = await publicClient.readContract({
                address: contractAddress,
                abi: contractABI,
                functionName: 'getOneProposal',
                args: [log.args.proposalId],
                account: address
            });

            return proposal;
        }));
        console.log(proposalsEvents);
        setProposalsList(proposalsEvents);
    };


    const handleSubmit = async () => {
        if (!proposal) {
            toast.error('Proposal is required.');
            return;
        }
        writeContract({
            address: contractAddress,
            abi: contractABI,
            functionName: 'addProposal',
            args: [proposal],
        });
        
    };

    useEffect(() => {
        if (errorConfirmation) {
            toast.error((errorConfirmation.shortMessage || errorConfirmation.message));
        }
        if (isSuccess) {
            toast.success('Proposal registered successfully.');
        }

        if (error) {
            toast.error((error.shortMessage || error.message));
        }
        
    }, [errorConfirmation, isSuccess, error]);



    return (
        <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Register Proposal</h1>
            <input
                type="text"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Enter proposal"
                className="w-full p-2 border rounded mb-4 text-black"
            />
            <button
                onClick={handleSubmit}
                disabled={setIsPending}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
                {setIsPending ? 'Registering...' : 'Register Proposal'}
            </button>


            <h2 className="text-xl font-bold mt-6">Registered Proposals</h2>
            <ul className="list-disc pl-5">
                {proposalsList.length > 0 ? (
                    proposalsList.map((proposal, index) => (
                        <li key={crypto.randomUUID()} className="">
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
