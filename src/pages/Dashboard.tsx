import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  useEffect(() => {
    // Load Typeform embed script
    const script = document.createElement("script");
    script.src = "//embed.typeform.com/next/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Bienvenido</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <span className="sr-only">Perfil</span>
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          </button>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r p-4">
          <nav className="space-y-2">
            <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">
              Inicio
            </a>
          </nav>
        </aside>

        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alerta Radio</CardTitle>
            </CardHeader>
            <CardContent>
              <div data-tf-live="01JEWES3GA7PPQN2SPRNHSVHPG"></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerta TV</CardTitle>
            </CardHeader>
            <CardContent>
              <div data-tf-live="01JEWEP95CN5YH8JCET8GEXRSK"></div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;