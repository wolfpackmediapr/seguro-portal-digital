
import { useCallback, useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

  const initializeTypeform = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      setIsLoading(true);

      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="typeform"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Clear the form container
      const container = document.querySelector(`[data-tf-live="${formId}"]`);
      if (container) {
        container.innerHTML = '';
      }

      // Create and append new script
      const script = document.createElement("script");
      script.src = "https://embed.typeform.com/next/embed.js";
      script.async = true;
      
      script.onload = () => {
        // Add a small delay to ensure the script is fully loaded
        setTimeout(() => {
          if (window.tf) {
            try {
              // Check if the container exists
              const formContainer = document.querySelector(`[data-tf-live="${formId}"]`);
              if (!formContainer) {
                reject(new Error("Container element not found"));
                setIsLoading(false);
                return;
              }

              // Create the widget with a valid domain - fixed the domain issue
              window.tf.createWidget({
                container: formContainer,
                embedId: formId,
                options: {
                  hideFooter: true,
                  hideHeaders: true,
                  opacity: 0,
                },
                domain: 'embed.typeform.com' // Use a fixed valid domain instead of relying on window.location
              });

              resolve();
              setIsLoading(false);
            } catch (error) {
              console.error("Error creating Typeform widget:", error);
              reject(error);
              setIsLoading(false);
            }
          } else {
            reject(new Error("Typeform script loaded but tf object not found"));
            setIsLoading(false);
          }
        }, 300); // Increase timeout to ensure script is fully loaded
      };

      script.onerror = (error) => {
        console.error("Error loading Typeform script:", error);
        reject(error);
        setIsLoading(false);
      };

      document.body.appendChild(script);
    });
  }, [formId]);

  const handleReload = useCallback(async () => {
    try {
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
          title="Actualizar formulario"
        >
          <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div data-tf-live={formId} className="min-h-[400px]"></div>
      </CardContent>
    </Card>
  );
};

export default TypeformEmbed;
