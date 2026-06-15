import { useState } from 'react';
import Sidebar from './Sidebar';
import { TopAppBarSection } from './TopAppBar';
import { AddBranchForm } from '../forms/AddBranchForm';

const MainLayout = ({ children }) => {
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-900 overflow-hidden font-sans">
      <Sidebar onOpenAddBranch={() => setIsAddBranchOpen(true)} />
      <div className="flex flex-col flex-1 overflow-hidden relative w-full">
        <TopAppBarSection />
        <main className="flex-1 overflow-auto bg-[#f8fafc] dark:bg-slate-900 p-0">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <AddBranchForm 
        isOpen={isAddBranchOpen} 
        onClose={() => setIsAddBranchOpen(false)} 
      />
    </div>
  );
};

export default MainLayout;
