import WalletConnect from "@/components/shared/WalletConnect";
import WhiteList from "@/components/WhiteList";
import WorkflowManager2 from "@/components/WorkflowManager2";

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg-welcome">
      <div className="p-4">
        <WalletConnect />
      </div>
      <div className="p-4 flex flex-col gap-4 justify-center items-center">
        <WorkflowManager2 />
        <WhiteList />
      </div>
    </div>
  );
}
