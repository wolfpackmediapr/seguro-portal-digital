import { useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Declare the type for the Typeform widget
declare global {
  interface Window {
    tf: {
      createWidget: () => void;
    };
  }
}

const Dashboard = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Load Typeform embed script
    const script = document.createElement("script");
    script.src = "//embed.typeform.com/next/embed.js";
    script.async = true;
    
    // Add error handling for script loading
    script.onerror = () => {
      console.error("Error loading Typeform script");
      toast({
        description: "Error al cargar el formulario",
        variant: "destructive",
      });
    };

    script.onload = () => {
      if (window.tf) {
        try {
          window.tf.createWidget();
        } catch (error) {
          console.error("Error initializing Typeform widget:", error);
          toast({
            description: "Error al inicializar el formulario",
            variant: "destructive",
          });
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [toast]);

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
        
        // Wait a brief moment to ensure DOM updates before reinitializing
        setTimeout(() => {
          if (window.tf) {
            try {
              window.tf.createWidget();
              toast({
                description: "Formulario actualizado",
                duration: 2000,
              });
            } catch (error) {
              console.error("Error reinitializing Typeform widget:", error);
              toast({
                description: "Error al actualizar el formulario",
                variant: "destructive",
              });
            }
          }
        }, 100);
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