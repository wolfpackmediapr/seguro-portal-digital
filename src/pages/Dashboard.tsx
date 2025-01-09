import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import TypeformEmbed from "@/components/dashboard/TypeformEmbed";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav />

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r p-4">
          <nav className="space-y-2">
            <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">
              Inicio
            </a>
          </nav>
        </aside>

        <main className="flex-1 p-6 space-y-6">
          <TypeformEmbed 
            title="Alerta Radio"
            formId="01JEWES3GA7PPQN2SPRNHSVHPG"
          />
          
          <TypeformEmbed 
            title="Alerta TV"
            formId="01JEWEP95CN5YH8JCET8GEXRSK"
          />
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;