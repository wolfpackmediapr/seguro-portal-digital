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

  const initializeTypeform = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="typeform"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create and append new script
      const script = document.createElement("script");
      script.src = "https://embed.typeform.com/next/embed.js";
      script.async = true;
      
      script.onload = () => {
        // Add a small delay to ensure the script is fully loaded
        setTimeout(() => {
          if (window.tf) {
            const container = document.querySelector(`[data-tf-live="${formId}"]`);
            if (!container) {
              reject(new Error("Container element not found"));
              return;
            }

            try {
              window.tf.createWidget({
                container,
                embedId: formId,
                options: {
                  hideFooter: true,
                  hideHeaders: true,
                  opacity: 0,
                }
              });
              resolve();
            } catch (error) {
              console.error("Error creating Typeform widget:", error);
              reject(error);
            }
          } else {
            reject(new Error("Typeform script loaded but tf object not found"));
          }
        }, 100);
      };

      script.onerror = (error) => {
        console.error("Error loading Typeform script:", error);
        reject(error);
      };

      document.body.appendChild(script);
    });
  }, [formId]);

  const handleReload = useCallback(async () => {
    try {
      // Clear the form container
      const container = document.querySelector(`[data-tf-live="${formId}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
      // Reinitialize Typeform
      await initializeTypeform();
      
      toast({
        description: "Formulario actualizado",
        duration: 2000,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error reloading form:", error);
        toast({
          description: "Error al actualizar el formulario",
          variant: "destructive",
        });
      }
    }
  }, [formId, initializeTypeform, toast]);

  useEffect(() => {
    // Only show error toast for actual errors, not initialization
    initializeTypeform().catch((error) => {
      if (error instanceof Error && 
          !error.message.includes("domain") && // Ignore domain-related errors
          !error.message.includes("tf object")) { // Ignore initialization timing issues
        console.error("Error initializing Typeform:", error);
        toast({
          description: "Error al cargar el formulario",
          variant: "destructive",
        });
      }
    });

    return () => {
      const script = document.querySelector('script[src*="typeform"]');
      if (script) {
        script.remove();
      }
    };
  }, [initializeTypeform, toast]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleReload}
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