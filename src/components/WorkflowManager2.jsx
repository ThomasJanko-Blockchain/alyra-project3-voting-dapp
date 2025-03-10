'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { connectWithProdider, connectWithSigner } from "@/utils/functions";

const statuses = [
  { label: "Enregistrement des électeurs", action: "startProposalsRegistering" },
  { label: "Enregistrement des propositions", action: "endProposalsRegistering" },
  { label: "Propositions terminées", action: "startVotingSession" },
  { label: "Session de vote", action: "endVotingSession" },
  { label: "Vote terminé", action: "tallyVotes" },
  { label: "Votes comptabilisés", action: null }
];

export default function WorkflowManager2() {
  const [workflowStatus, setWorkflowStatus] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour récupérer l'état du workflow
  const refreshWorkflowStatus = async () => {
    if (window.ethereum) {
      const { contractInstance } = await connectWithProdider();
      const status = Number(await contractInstance.workflowStatus());
      setWorkflowStatus(status);
    }
  };

  // Initialisation et configuration de l'écouteur d'événements
  useEffect(() => {
    async function setupContract() {
      if (window.ethereum) {
        try {
          const { contractInstance } = await connectWithProdider();
          
          // Lecture initiale de l'état
          refreshWorkflowStatus();
          
          // Écouteur d'événements pour les changements d'état
          contractInstance.on("WorkflowStatusChange", (_, newStatus) => {
            setWorkflowStatus(Number(newStatus));
          });
          
          return () => {
            contractInstance.removeAllListeners("WorkflowStatusChange");
          };
        } catch (err) {
          console.error("Erreur d'initialisation:", err);
        }
      }
    }
    
    setupContract();
    
    // Rafraîchissement périodique
    const interval = setInterval(refreshWorkflowStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fonction pour avancer dans le workflow
  const advanceWorkflow = async () => {
    try {
      const { contractInstance } = await connectWithSigner();
      const action = statuses[workflowStatus].action;
      if (!action) return;
      
      setIsLoading(true);
      const tx = await contractInstance[action]();
      await tx.wait();
      
      // L'état sera mis à jour automatiquement par l'écouteur d'événements
      setIsLoading(false);
    } catch (err) {
      console.error("Erreur:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">État du Workflow</h1>
      
      <p className="text-lg font-medium text-blue-600 mb-4">
        {statuses[workflowStatus]?.label || "État inconnu"}
      </p>
      
      {workflowStatus < statuses.length - 1 && (
        <Button 
          onClick={advanceWorkflow} 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "En cours..." : `Passer à: ${statuses[workflowStatus + 1].label}`}
        </Button>
      )}
    </div>
  );
}