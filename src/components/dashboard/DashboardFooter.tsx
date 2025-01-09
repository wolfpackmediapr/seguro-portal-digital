const DashboardFooter = () => {
  return (
    <footer className="bg-white border-t py-4 px-6 mt-auto">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/783b3503-53aa-46a1-a06f-98a881be711f.png" 
            alt="Publimedia Logo" 
            className="h-6"
          />
          <span className="text-sm text-gray-600">
            © {new Date().getFullYear()} Todos los derechos reservados
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Powered by WolfPack Media
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;