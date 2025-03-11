import Welcome from "@/components/Welcome";
import ProposalRegistration from "@/components/ProposalRegistration";
import WhiteList from "@/components/WhiteList";
import WorkflowManager2 from "@/components/WorkflowManager2";
import Menus from "@/components/layouts/Menus";

export default function Home() {
  return (
    <div>
      <div className="p-4">
        <Welcome />
      </div>
      <div className="p-4 flex flex-col gap-4 justify-center items-center">
       <Menus />
      </div>
    </div>
  );
}
