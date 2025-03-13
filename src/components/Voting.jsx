import { connectWithSigner } from '@/utils/functions';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function Voting() {

    const [proposals, setProposals] = useState([])
    const [hoveredIndex, setHoveredIndex] = useState(null);

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

    const handleClick = async (proposalId) => {
        try {
            const { contractInstance } = await connectWithSigner();
            const tx = await contractInstance.setVote(proposalId);
            await tx.wait();
            toast.success("Vote submitted successfully.");
        } catch (error) {
            toast.error(error.message);
        }
    }
    
    
  return (
    <div>
       <h1 className="text-2xl font-bold mb-4 text-center">Voting</h1>
        <div className='flex flex-col gap-4 outline outline-1 outline-gray-300 rounded-md p-8'>
        <ul className="list-decimal space-y-2">
        {proposals.map((proposal, index) => (
          <li
            key={crypto.randomUUID()}
            className="relative p-2 rounded-md transition-colors duration-200 cursor-pointer hover:bg-purple-100 hover:text-purple-500"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {proposal}
            {hoveredIndex === index && (
              <button
                onClick={() => handleClick(index)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-md transition-transform duration-200 hover:scale-105"
              >
                Vote
              </button>
            )}
          </li>
        ))}
      </ul>
        </div>
    </div>
  )
}

