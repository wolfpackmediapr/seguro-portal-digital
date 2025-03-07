
import React, { useState } from 'react';
import { LogsDisplay } from '@/components/common/LogsDisplay';

export const AdminLogs = () => {
  const [activeTab, setActiveTab] = useState('activity');
  
  const tabOptions = [
    { value: 'activity', label: 'Activity' },
    { value: 'sessions', label: 'Sessions' }
  ];
  
  return (
    <LogsDisplay 
      title="Authentication Logs"
      tabOptions={tabOptions}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      comingSoon={true}
    />
  );
};
