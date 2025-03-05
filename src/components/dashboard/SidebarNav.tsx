
import { useState } from "react";
import { Home, List, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  isAdmin: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SidebarNav = ({ isAdmin, activeTab, onTabChange }: SidebarNavProps) => {
  return (
    <aside className="w-64 bg-white border-r">
      <nav className="py-4">
        <a 
          href="#" 
          onClick={() => onTabChange("inicio")}
          className={cn(
            "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
            activeTab === "inicio" ? "bg-gray-100 text-gray-900" : "text-gray-600"
          )}
        >
          <Home className="w-4 h-4 mr-3" />
          Inicio
        </a>
        
        <a 
          href="#" 
          onClick={() => onTabChange("profile")}
          className={cn(
            "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
            activeTab === "profile" ? "bg-gray-100 text-gray-900" : "text-gray-600"
          )}
        >
          <User className="w-4 h-4 mr-3" />
          Mi Perfil
        </a>
        
        {isAdmin && (
          <a 
            href="#" 
            onClick={() => onTabChange("logs")}
            className={cn(
              "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
              activeTab === "logs" ? "bg-gray-100 text-gray-900" : "text-gray-600"
            )}
          >
            <List className="w-4 h-4 mr-3" />
            Logs
          </a>
        )}
        
        {isAdmin && (
          <a 
            href="#" 
            onClick={() => onTabChange("settings")}
            className={cn(
              "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
              activeTab === "settings" ? "bg-gray-100 text-gray-900" : "text-gray-600"
            )}
          >
            <Settings className="w-4 h-4 mr-3" />
            Configuración
          </a>
        )}
      </nav>
    </aside>
  );
};

export default SidebarNav;
