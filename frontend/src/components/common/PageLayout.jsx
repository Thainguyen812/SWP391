import React from 'react';
import { PageHeader } from './PageHeader';

export const PageLayout = ({ title, subtitle, actions, children }) => {
  return (
    <section className="flex flex-col w-full h-full p-6 pb-8 bg-[#f8fafc] dark:bg-slate-900 overflow-y-auto transition-colors">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      <div className="flex flex-col gap-6 w-full">
        {children}
      </div>
    </section>
  );
};
