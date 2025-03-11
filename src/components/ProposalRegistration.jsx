'use client'
import React, { useState, useEffect } from 'react';
import { connectWithSigner } from '@/utils/functions';
import toast from 'react-hot-toast';

export default function ProposalRegistration() {
    const [proposal, setProposal] = useState('');
    const [proposals, setProposals] = useState([]); // Store registered proposals

    // Fetch proposals from the blockchain when the component loads
    useEffect(() => {
        async function fetchProposals() {
            try {
                const { contractInstance } = await connectWithSigner();
                const filter = contractInstance.filters.ProposalRegistered();
                const events = await contractInstance.queryFilter(filter);

                // Retrieve all proposals from emitted events
                const registeredProposals = await Promise.all(
                    events.map(async (event) => {
                        const proposalId = event.args.proposalId.toString(); // Get proposal ID
                        const proposalData = await contractInstance.getOneProposal(proposalId);
                        return proposalData.description;
                    })
                );

                setProposals(registeredProposals);
            } catch (error) {
                console.error("Error fetching proposals:", error);
                toast.error("Failed to fetch proposals.");
            }
        }

        async function listenForProposalEvents() {
            const { contractInstance } = await connectWithSigner();
            if (!contractInstance) {
                console.error("Contract instance is undefined");
                return;
            }

            contractInstance.on("ProposalRegistered", async (proposalId) => {
                console.log("New Proposal Registered:", proposalId);
                const proposalData = await contractInstance.getOneProposal(proposalId.toString());
                setProposals((prevProposals) => [...prevProposals, proposalData.description]);
                toast.success(`Proposal registered successfully.`);
            });
        }

        fetchProposals();
        listenForProposalEvents();

        return () => {
            async function removeListener() {
                const { contractInstance } = await connectWithSigner();
                if (contractInstance) {
                    contractInstance.removeAllListeners("ProposalRegistered");
                }
            }
            removeListener();
        };
    }, []);

    const handleSubmit = async () => {
        if (!proposal) {
            toast.error('Proposal is required.');
            return;
        }
        try {
            const { contractInstance, signer } = await connectWithSigner();
            const tx = await contractInstance.addProposal(proposal);
            toast.success('Proposal submitted. Waiting for confirmation...');
            await tx.wait(1);
            setProposal('');
        } catch (error) {
            toast.error(error.message);
        }
    };

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
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
                Register Proposal
            </button>

            {/* Display the list of proposals */}
            <h2 className="text-xl font-bold mt-6">Registered Proposals</h2>
            <ul className="list-disc pl-5">
                {proposals.length > 0 ? (
                    proposals.map((proposal, index) => (
                        <li key={index} className="">
                            {proposal}
                        </li>
                    ))
                ) : (
                    <p>No proposals registered yet.</p>
                )}
            </ul>
        </div>
    );
}
