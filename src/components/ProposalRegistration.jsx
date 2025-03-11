'use client'
import React, { useState } from 'react'
import { connectWithSigner } from '@/utils/functions'
import toast from 'react-hot-toast'

export default function ProposalRegistration() {
    const [proposal, setProposal] = useState('')

    const handleSubmit = async (e) => {
       if (!proposal) {
        toast.error('Proposal is required.')
        return
       }
       try {
        const { contractInstance, signer } = await connectWithSigner()
        const tx = await contractInstance.addProposal(proposal)
        toast.success('Proposal registered successfully.')
        await tx.wait(1)
        setProposal('')
       } catch (error) {
        toast.error(error.message)
       }
    }
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
    </div>
  )
}
