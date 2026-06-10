import { SystemOverviewSection } from "./SystemOverviewSection";
import { TopAppBarSection } from "./TopAppBarSection";

export const ManagerBngIuKhin = (): JSX.Element => {
  return (
    <main className="flex min-h-screen items-start justify-center pl-64 pr-0 py-0 relative bg-[linear-gradient(0deg,rgba(248,250,252,1)_0%,rgba(248,250,252,1)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <div className="flex flex-col min-h-[1290px] items-start relative flex-1 self-stretch grow">
        <TopAppBarSection />
        <SystemOverviewSection />
      </div>
    </main>
  );
};

export default ManagerBngIuKhin;