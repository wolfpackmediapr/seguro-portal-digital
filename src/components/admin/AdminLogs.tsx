
import React, { useState } from 'react';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminLogs = () => {
  const [activeTab, setActiveTab] = useState('activity');
  
  return (
    <Card className="border shadow-sm rounded-lg">
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Authentication Logs</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <CardContent className="pt-4">
        <div className="flex flex-col space-y-2 mb-6 px-2">
          <div className="text-sm text-muted-foreground">
            Log functionality will be available in the next update. This interface shows a preview of the upcoming feature.
          </div>
        </div>
        
        {/* Filters placeholder */}
        <div className="border rounded-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* Table placeholder */}
        <div className="border rounded-md p-4">
          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-4 gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            {/* Data rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-2 border-b">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination placeholder */}
          <div className="flex justify-between items-center mt-4 pt-2">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
