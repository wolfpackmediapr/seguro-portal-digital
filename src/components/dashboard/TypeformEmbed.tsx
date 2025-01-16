import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { useTypeformWidget } from "@/hooks/useTypeformWidget";
import { useFormReload } from "@/hooks/useFormReload";

interface TypeformEmbedProps {
  title: string;
  formId: string;
}

const TypeformEmbed = ({ title, formId }: TypeformEmbedProps) => {
  const { initializeTypeform } = useTypeformWidget(formId);
  const { handleReload } = useFormReload(formId, initializeTypeform);

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