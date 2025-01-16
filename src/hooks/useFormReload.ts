import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useFormReload = (formId: string, initializeTypeform: () => Promise<void>) => {
  const { toast } = useToast();

  const handleReload = useCallback(async () => {
    try {
      const container = document.querySelector(`[data-tf-live="${formId}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
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

  return { handleReload };
};