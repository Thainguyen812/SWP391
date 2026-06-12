import React from 'react';

export const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <header className="flex justify-between items-end w-full pb-4 border-b border-[#e9e7e9] dark:border-slate-700 transition-colors mb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#041627] dark:text-slate-100 transition-colors">{title}</h1>
        <p className="text-sm text-[#64748b] dark:text-slate-400 transition-colors">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </header>
  );
};
