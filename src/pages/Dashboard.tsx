import { useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { toast } = useToast();

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

  const reloadForm = useCallback((formId: string) => {
    // Get the form iframe
    const iframe = document.querySelector(`iframe[data-tf-live="${formId}"]`);
    if (iframe) {
      // Get the parent element that contains the Typeform embed
      const container = iframe.parentElement;
      if (container) {
        // Remove the existing iframe
        container.innerHTML = '';
        // Recreate the div with the data-tf-live attribute
        const newDiv = document.createElement('div');
        newDiv.setAttribute('data-tf-live', formId);
        container.appendChild(newDiv);
        // Reinitialize Typeform
        // @ts-ignore - window.tf is added by Typeform's script
        if (window.tf) window.tf.createWidget();
        
        toast({
          description: "Formulario actualizado",
          duration: 2000,
        });
      }
    }
  }, [toast]);

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alerta Radio</CardTitle>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => reloadForm("01JEWES3GA7PPQN2SPRNHSVHPG")}
                title="Actualizar formulario"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div data-tf-live="01JEWES3GA7PPQN2SPRNHSVHPG"></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alerta TV</CardTitle>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => reloadForm("01JEWEP95CN5YH8JCET8GEXRSK")}
                title="Actualizar formulario"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
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