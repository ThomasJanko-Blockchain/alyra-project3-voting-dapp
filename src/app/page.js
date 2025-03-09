import WalletConnect from "@/components/shared/WalletConnect";
import WorkflowManager from "@/components/shared/WorkflowManager";

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg-welcome">
      <div className="p-4">
        <WalletConnect />
      </div>
      <WorkflowManager />
    </div>
  );
}
