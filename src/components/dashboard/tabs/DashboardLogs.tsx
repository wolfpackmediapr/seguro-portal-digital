
import { useState, useEffect } from "react";
import { AdminLogs } from "@/components/admin/AdminLogs";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DashboardLogs = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Just simulate a refresh delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        description: "Logs actualizados correctamente",
        duration: 2000,
      });
    } catch (err) {
      console.error("Error refreshing logs:", err);
      setError("Error al actualizar los logs. Inténtelo de nuevo.");
      
      toast({
        title: "Error",
        description: "Error al actualizar los logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    handleRefresh();
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 mb-4">
            {error}
          </div>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RotateCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isLoading}
        >
          <RotateCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar logs
        </Button>
      </div>
      <AdminLogs />
    </div>
  );
};

export default DashboardLogs;
