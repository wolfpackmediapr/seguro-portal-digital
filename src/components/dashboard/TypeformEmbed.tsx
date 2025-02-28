
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TypeformEmbedProps {
  title: string;
  formId: string;
  refreshTrigger: number;
  onLoadStateChange?: (isLoading: boolean) => void;
}

const TypeformEmbed = ({ 
  title, 
  formId, 
  refreshTrigger,
  onLoadStateChange 
}: TypeformEmbedProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const updateLoadingState = useCallback((state: boolean) => {
    setIsLoading(state);
    if (onLoadStateChange) {
      onLoadStateChange(state);
    }
  }, [onLoadStateChange]);

  const initializeTypeform = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      updateLoadingState(true);

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
                updateLoadingState(false);
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
              updateLoadingState(false);
            } catch (error) {
              console.error("Error creating Typeform widget:", error);
              reject(error);
              updateLoadingState(false);
            }
          } else {
            reject(new Error("Typeform script loaded but tf object not found"));
            updateLoadingState(false);
          }
        }, 300); // Increase timeout to ensure script is fully loaded
      };

      script.onerror = (error) => {
        console.error("Error loading Typeform script:", error);
        reject(error);
        updateLoadingState(false);
      };

      document.body.appendChild(script);
    });
  }, [formId, updateLoadingState]);

  useEffect(() => {
    // Initialize the form when the component mounts or when refreshTrigger changes
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
  }, [initializeTypeform, toast, refreshTrigger]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div data-tf-live={formId} className="min-h-[400px]"></div>
      </CardContent>
    </Card>
  );
};

export default TypeformEmbed;
