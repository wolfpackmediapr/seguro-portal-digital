
import { Home, List, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  isAdmin: boolean;
  activeTab: string;
  handleTabChange: (value: string) => void;
};

const DashboardSidebar = ({ isAdmin, activeTab, handleTabChange }: DashboardSidebarProps) => {
  return (
    <aside className="w-64 bg-white border-r">
      <nav className="py-4">
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handleTabChange("inicio");
          }}
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
          onClick={(e) => {
            e.preventDefault();
            handleTabChange("profile");
          }}
          className={cn(
            "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
            activeTab === "profile" ? "bg-gray-100 text-gray-900" : "text-gray-600"
          )}
        >
          <User className="w-4 h-4 mr-3" />
          Mi Perfil
        </a>
        
        {/* Show logs tab to admins and super admins */}
        {isAdmin && (
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleTabChange("logs");
            }}
            className={cn(
              "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
              activeTab === "logs" ? "bg-gray-100 text-gray-900" : "text-gray-600"
            )}
          >
            <List className="w-4 h-4 mr-3" />
            Logs
          </a>
        )}
        
        {/* Show settings tab to admins and super admins */}
        {isAdmin && (
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleTabChange("settings");
            }}
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

export default DashboardSidebar;
