'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { connectToContract } from "@/utils/functions";

const statuses = [
  { label: "Enregistrement des électeurs", action: "startProposalsRegistering" },
  { label: "Enregistrement des propositions", action: "endProposalsRegistering" },
  { label: "Propositions terminées", action: "startVotingSession" },
  { label: "Session de vote", action: "endVotingSession" },
  { label: "Vote terminé", action: "tallyVotes" },
  { label: "Votes comptabilisés", action: null }
];

export default function WorkflowManager() {
  const [contract, setContract] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function initContract() {
      if (window.ethereum) {
        try {
          const _contract = await connectToContract()
          const status = Number(await _contract.workflowStatus());
          
          setContract(_contract);
          setWorkflowStatus(status);
        } catch (err) {
          console.error("Erreur d'initialisation:", err);
        }
      }
    }
    
    initContract();
  }, []);

  // Fonction pour avancer dans le workflow
  const advanceWorkflow = async () => {
    console.log("Avancer dans le workflow", contract, statuses[workflowStatus].action);
    if (!contract) return;
    const action = statuses[workflowStatus].action;
    if (!action) return;
    
    try {
      setIsLoading(true);
      const tx = await contract[action]();
      await tx.wait();
      
      // Mettre à jour manuellement le statut après la transaction
      const newStatus = Number(await contract.workflowStatus());
      setWorkflowStatus(newStatus);
      setIsLoading(false);
    } catch (err) {
      console.error("Erreur:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">État du Workflow</h2>
      <p className="text-lg font-medium text-blue-600">
        {statuses[workflowStatus]?.label || "État inconnu"}
      </p>
      
      {workflowStatus < statuses.length - 1 && (
        <Button 
          onClick={advanceWorkflow} 
          className="mt-4"
          disabled={isLoading}
        >
          {isLoading ? "En cours..." : `Passer à: ${statuses[workflowStatus + 1].label}`}
        </Button>
      )}
    </div>
  );
}