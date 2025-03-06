import { UserRound } from "lucide-react";

const DashboardNav = () => {
  return (
    <nav className="bg-white border-b px-4 py-2 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <img 
          src="/lovable-uploads/783b3503-53aa-46a1-a06f-98a881be711f.png" 
          alt="Publimedia Logo" 
          className="h-8"
        />
        <h1 className="text-xl font-semibold">Alertas Radio y TV</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <UserRound className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;