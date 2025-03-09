import WalletConnect from "@/components/shared/WalletConnect";
import WhiteList from "@/components/WhiteList";
import WorkflowManager from "@/components/WorkflowManager";

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg-welcome">
      <div className="p-4">
        <WalletConnect />
      </div>
      <div className="p-4 flex flex-col gap-4 justify-center items-center">
        <WorkflowManager />
        <WhiteList />
      </div>
    </div>
  );
}
