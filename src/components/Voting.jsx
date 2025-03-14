'use client'
import { publicClient } from '@/utils/client';
import { contractABI, contractAddress } from '@/utils/constants';
import { useEffect, useState } from 'react'
import { readContract } from 'viem/actions';
import { useAccount, useWaitForTransactionReceipt, useWatchContractEvent, useWriteContract } from 'wagmi';
import toast from 'react-hot-toast';

export default function Voting({ proposalsEvents }) {
    const { address } = useAccount()
    const [proposals, setProposals] = useState([])
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [numberProposals, setNumberProposals] = useState(0);

    const { data: hash, error, isPending, writeContract } = useWriteContract()
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



    const handleClick = async (proposalId) => {
        try {
            writeContract({
                address: contractAddress,
                abi: contractABI,
                functionName: 'setVote',
                args: [proposalId],
                account: address
            })
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (isConfirmed) {
            toast.success(`Transaction successful. 
            Hash: ${hash}`)
        }
        if (error) {
            toast.error(error.shortMessage || error.message);
        }
        

    }, [isConfirmed, error, isConfirming])
    
  return (
    <div>
       <h1 className="text-2xl font-bold mb-4 text-center">Voting</h1>
        <div className='flex flex-col gap-4 outline outline-1 outline-gray-300 rounded-md p-8'>
        <ul className="list-decimal space-y-2 max-h-[400px] overflow-y-auto">
        {proposals.map((proposal, index) => (
          <li
            key={crypto.randomUUID()}
            className="relative p-2 rounded-md transition-colors duration-200 cursor-pointer hover:bg-purple-100 hover:text-purple-500"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {proposal.description}
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

