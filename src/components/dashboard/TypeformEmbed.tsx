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
      const script = document.createElement("script");
      script.src = "//embed.typeform.com/next/embed.js";
      script.async = true;

      script.onload = () => {
        setTimeout(() => {
          try {
            if (window.tf) {
              window.tf.createWidget();
              resolve();
            } else {
              setTimeout(() => {
                if (window.tf) {
                  window.tf.createWidget();
                }
                resolve();
              }, 500);
            }
          } catch (error) {
            console.warn("Non-critical error during Typeform initialization:", error);
            resolve();
          }
        }, 100);
      };

      script.onerror = (error) => {
        console.error("Error loading Typeform script:", error);
        reject(error);
      };

      document.body.appendChild(script);
    });
  }, []);

  const initializeForm = useCallback(() => {
    // Remove any existing Typeform script
    const existingScript = document.querySelector('script[src*="typeform"]');
    if (existingScript) {
      document.body.removeChild(existingScript);
    }

    // Clear existing form containers and create new ones
    const existingForms = document.querySelectorAll(`[data-tf-live="${formId}"]`);
    existingForms.forEach(form => {
      if (form.parentElement) {
        form.parentElement.innerHTML = '';
        const newDiv = document.createElement('div');
        newDiv.setAttribute('data-tf-live', formId);
        form.parentElement.appendChild(newDiv);
      }
    });

    // Load and initialize new script
    return loadTypeformScript();
  }, [formId, loadTypeformScript]);

  const reloadForm = useCallback(async () => {
    try {
      await initializeForm();
      toast({
        description: "Formulario actualizado",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error reloading form:", error);
      toast({
        description: "Error al actualizar el formulario",
        variant: "destructive",
      });
    }
  }, [initializeForm, toast]);

  useEffect(() => {
    initializeForm().catch((error) => {
      console.error("Error in initial form load:", error);
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
  }, [initializeForm, toast]);

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