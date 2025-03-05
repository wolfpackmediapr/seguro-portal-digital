
import { useEffect, useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type DashboardLayoutProps = {
  children: React.ReactNode;
  isAdmin: boolean;
  userRole: string | null;
  activeTab: string;
  handleTabChange: (value: string) => void;
};

const DashboardLayout = ({ 
  children, 
  isAdmin, 
  userRole, 
  activeTab, 
  handleTabChange 
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav />

      <div className="flex flex-1">
        <DashboardSidebar 
          isAdmin={isAdmin} 
          activeTab={activeTab} 
          handleTabChange={handleTabChange} 
        />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default DashboardLayout;
