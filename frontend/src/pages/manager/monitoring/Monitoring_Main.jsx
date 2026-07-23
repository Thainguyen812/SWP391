import React from 'react';
import { ParkingMonitorView } from '../../admin/ParkingMonitorView';
import { PageLayout } from '../../../components/common/PageLayout';

export const MonitoringPage = () => {
  const triggerToast = (message, type = 'info') => {
    const level = type === 'error' ? 'error' : type === 'success' ? 'log' : 'info';
    console[level](message);
  };

  return (
    <PageLayout
      title="Giám sát Bãi đỗ xe"
      subtitle="Quản lý và theo dõi các khu vực đậu xe theo thời gian thực"
    >
      <div className="w-full">
        <ParkingMonitorView triggerToast={triggerToast} />
      </div>
    </PageLayout>
  );
};
