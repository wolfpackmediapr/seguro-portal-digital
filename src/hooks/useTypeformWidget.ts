import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useTypeformWidget = (formId: string) => {
  const { toast } = useToast();

  const initializeTypeform = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="typeform"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = "https://embed.typeform.com/next/embed.js";
      script.async = true;
      
      script.onload = () => {
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

  useEffect(() => {
    initializeTypeform().catch((error) => {
      if (error instanceof Error && 
          !error.message.includes("domain") && 
          !error.message.includes("tf object")) {
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

  return { initializeTypeform };
};