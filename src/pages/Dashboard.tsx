import { useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const loadTypeformScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="typeform"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }

      const script = document.createElement("script");
      script.src = "//embed.typeform.com/next/embed.js";
      script.async = true;

      script.onload = () => {
        if (window.tf) {
          try {
            window.tf.createWidget();
            resolve();
          } catch (error) {
            console.error("Error initializing Typeform widget:", error);
            reject(error);
          }
        }
      };

      script.onerror = (error) => {
        console.error("Error loading Typeform script:", error);
        reject(error);
      };

      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    loadTypeformScript().catch((error) => {
      toast({
        description: "Error al cargar el formulario",
        variant: "destructive",
      });
    });

    return () => {
      const script = document.querySelector('script[src*="typeform"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [loadTypeformScript, toast]);

  const reloadForm = useCallback(async (formId: string) => {
    const iframe = document.querySelector(`iframe[data-tf-live="${formId}"]`);
    if (iframe) {
      const container = iframe.parentElement;
      if (container) {
        container.innerHTML = '';
        const newDiv = document.createElement('div');
        newDiv.setAttribute('data-tf-live', formId);
        container.appendChild(newDiv);
        
        try {
          await loadTypeformScript();
          toast({
            description: "Formulario actualizado",
            duration: 2000,
          });
        } catch (error) {
          toast({
            description: "Error al actualizar el formulario",
            variant: "destructive",
          });
        }
      }
    }
  }, [loadTypeformScript, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/783b3503-53aa-46a1-a06f-98a881be711f.png" 
            alt="Publimedia Logo" 
            className="h-8"
          />
          <h1 className="text-xl font-semibold">Bienvenido</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <span className="sr-only">Perfil</span>
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          </button>
        </div>
      </nav>

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r p-4">
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

      <footer className="bg-white border-t py-4 px-6 mt-auto">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/783b3503-53aa-46a1-a06f-98a881be711f.png" 
              alt="Publimedia Logo" 
              className="h-6"
            />
            <span className="text-sm text-gray-600">
              © {new Date().getFullYear()} Todos los derechos reservados
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Powered by WolfPack Media
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;