
import { useState } from 'react';

export type TabOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function useTabs(defaultValue: string, options?: TabOption[]) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
    tabOptions: options || []
  };
}
