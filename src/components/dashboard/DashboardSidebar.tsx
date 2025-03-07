
import { Home, List, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabOption } from "@/hooks/useTabs";

type DashboardSidebarProps = {
  isAdmin: boolean;
  activeTab: string;
  handleTabChange: (value: string) => void;
};

const DashboardSidebar = ({ isAdmin, activeTab, handleTabChange }: DashboardSidebarProps) => {
  // Define available sidebar items based on user role
  const getNavItems = (): (TabOption & { icon: React.ReactNode })[] => {
    const items = [
      { value: "inicio", label: "Inicio", icon: <Home className="w-4 h-4 mr-3" /> }
    ];
    
    if (isAdmin) {
      items.push(
        { value: "logs", label: "Logs", icon: <List className="w-4 h-4 mr-3" /> },
        { value: "settings", label: "Configuración", icon: <Settings className="w-4 h-4 mr-3" /> }
      );
    }
    
    return items;
  };
  
  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r">
      <nav className="py-4">
        {navItems.map(item => (
          <a 
            key={item.value}
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleTabChange(item.value);
            }}
            className={cn(
              "flex items-center px-6 py-3 text-sm transition-colors hover:bg-gray-100",
              activeTab === item.value ? "bg-gray-100 text-gray-900" : "text-gray-600"
            )}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
