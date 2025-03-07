
import React from 'react';
import { LogsDisplay } from '@/components/common/LogsDisplay';
import { useTabs, TabOption } from '@/hooks/useTabs';

export const AdminLogs = () => {
  const tabOptions: TabOption[] = [
    { value: 'activity', label: 'Activity' },
    { value: 'sessions', label: 'Sessions' }
  ];
  
  const { activeTab, handleTabChange } = useTabs('activity', tabOptions);
  
  return (
    <LogsDisplay 
      title="Authentication Logs"
      tabOptions={tabOptions}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      comingSoon={true}
    />
  );
};
