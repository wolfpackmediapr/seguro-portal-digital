
import { useState } from "react";
import SimpleLogsDisplay from "@/components/common/SimpleLogsDisplay";

const LogsTab = () => {
  const [activeTab, setActiveTab] = useState('activity');
  
  const tabOptions = [
    { value: 'activity', label: 'Activity Logs' },
    { value: 'sessions', label: 'User Sessions' }
  ];

  return (
    <SimpleLogsDisplay
      title="System Logs"
      tabOptions={tabOptions}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};

export default LogsTab;
