import React from 'react';
import { ParkingMonitorView } from '../../admin/ParkingMonitorView';

export const MonitoringPage = () => {
  const triggerToast = (message, type = 'info') => {
    const level = type === 'error' ? 'error' : type === 'success' ? 'log' : 'info';
    console[level](message);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto w-full">
      <ParkingMonitorView triggerToast={triggerToast} />
    </div>
  );
};
