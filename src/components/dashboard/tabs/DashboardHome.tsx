
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TypeformEmbed from "@/components/dashboard/TypeformEmbed";

const DashboardHome = () => {
  return (
    <Tabs defaultValue="radio" className="w-full">
      <TabsList>
        <TabsTrigger value="radio">Alerta Radio</TabsTrigger>
        <TabsTrigger value="tv">Alerta TV</TabsTrigger>
      </TabsList>
      
      <TabsContent value="radio" className="mt-6">
        <TypeformEmbed 
          title="Alerta Radio"
          formId="01JEWES3GA7PPQN2SPRNHSVHPG"
        />
      </TabsContent>
      
      <TabsContent value="tv" className="mt-6">
        <TypeformEmbed 
          title="Alerta TV"
          formId="01JEWEP95CN5YH8JCET8GEXRSK"
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardHome;
