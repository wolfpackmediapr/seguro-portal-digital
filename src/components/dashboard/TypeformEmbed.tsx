import { useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TypeformEmbedProps {
  title: string;
  formId: string;
}

const TypeformEmbed = ({ title, formId }: TypeformEmbedProps) => {
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
        } else {
          reject(new Error("Typeform widget not available"));
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

  const reloadForm = useCallback(async () => {
    try {
      const iframe = document.querySelector(`iframe[data-tf-live="${formId}"]`);
      if (iframe) {
        const container = iframe.parentElement;
        if (container) {
          container.innerHTML = '';
          
          const newDiv = document.createElement('div');
          newDiv.setAttribute('data-tf-live', formId);
          container.appendChild(newDiv);
          
          await loadTypeformScript();
          
          toast({
            description: "Formulario actualizado",
            duration: 2000,
          });
        }
      }
    } catch (error) {
      console.error("Error reloading form:", error);
      toast({
        description: "Error al actualizar el formulario",
        variant: "destructive",
      });
    }
  }, [formId, loadTypeformScript, toast]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button 
          variant="outline" 
          size="icon"
          onClick={reloadForm}
          title="Actualizar formulario"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div data-tf-live={formId}></div>
      </CardContent>
    </Card>
  );
};

export default TypeformEmbed;