
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
  const [retryCount, setRetryCount] = useState(0);

  const initializeTypeform = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      setIsLoading(true);
      console.log(`Initializing Typeform with ID: ${formId} (attempt: ${retryCount + 1})`);

      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="typeform"]');
      if (existingScript) {
        console.log("Removing existing Typeform script");
        existingScript.remove();
      }

      // Clear the form container
      const container = document.querySelector(`[data-tf-live="${formId}"]`);
      if (container) {
        console.log("Clearing form container");
        container.innerHTML = '';
      }

      // Create and append new script
      const script = document.createElement("script");
      script.src = "https://embed.typeform.com/next/embed.js";
      script.async = true;
      
      script.onload = () => {
        console.log("Typeform script loaded successfully");
        // Add a small delay to ensure the script is fully loaded
        setTimeout(() => {
          if (window.tf) {
            try {
              // Check if the container exists
              const formContainer = document.querySelector(`[data-tf-live="${formId}"]`);
              if (!formContainer) {
                const error = new Error("Container element not found");
                console.error(error);
                reject(error);
                setIsLoading(false);
                return;
              }

              console.log("Creating Typeform widget with formId:", formId);
              // Create the widget with a valid domain - fixed the domain issue
              window.tf.createWidget({
                container: formContainer,
                embedId: formId,
                options: {
                  hideFooter: true,
                  hideHeaders: true,
                  opacity: 0,
                },
                domain: 'embed.typeform.com', // Use a fixed valid domain
                onReady: () => {
                  console.log("Typeform widget ready");
                  resolve();
                  setIsLoading(false);
                },
                onError: (error: any) => {
                  console.error("Typeform widget error:", error);
                  reject(error);
                  setIsLoading(false);
                }
              });

            } catch (error) {
              console.error("Error creating Typeform widget:", error);
              reject(error);
              setIsLoading(false);
            }
          } else {
            const error = new Error("Typeform script loaded but tf object not found");
            console.error(error);
            reject(error);
            setIsLoading(false);
          }
        }, 500); // Increased timeout to ensure script is fully loaded
      };

      script.onerror = (error) => {
        console.error("Error loading Typeform script:", error);
        reject(error);
        setIsLoading(false);
      };

      document.body.appendChild(script);
    });
  }, [formId, retryCount]);

  const handleReload = useCallback(async () => {
    try {
      setIsLoading(true);
      setRetryCount(prev => prev + 1);
      
      // Reinitialize Typeform
      await initializeTypeform();
      
      toast({
        description: "Formulario actualizado correctamente",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error reloading form:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el formulario. Por favor, inténtelo de nuevo.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [formId, initializeTypeform, toast]);

  useEffect(() => {
    console.log(`Setting up Typeform with ID: ${formId}`);
    
    // Initialize with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeTypeform().catch((error) => {
        console.error("Error initializing Typeform:", error);
        toast({
          title: "Error",
          description: "Error al cargar el formulario. Use el botón de actualizar.",
          variant: "destructive",
        });
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      const script = document.querySelector('script[src*="typeform"]');
      if (script) {
        script.remove();
      }
    };
  }, [initializeTypeform, toast, formId]);

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
        <div data-tf-live={formId} className="min-h-[400px] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-sm text-muted-foreground">Cargando formulario...</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TypeformEmbed;
