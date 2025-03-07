
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type SimpleLogsDisplayProps = {
  title: string;
  tabOptions: { value: string; label: string }[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

const SimpleLogsDisplay = ({ 
  title, 
  tabOptions, 
  activeTab, 
  onTabChange 
}: SimpleLogsDisplayProps) => {
  return (
    <Card className="border shadow-sm rounded-lg">
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
        
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
          <TabsList>
            {tabOptions.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      <CardContent className="pt-4">
        <div className="flex flex-col space-y-2 mb-6 px-2">
          <div className="text-sm text-muted-foreground">
            Log functionality will be available in the next update. This interface shows a preview of the upcoming feature.
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleLogsDisplay;
