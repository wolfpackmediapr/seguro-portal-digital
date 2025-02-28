
interface TypeformWidgetOptions {
  hideFooter?: boolean;
  hideHeaders?: boolean;
  opacity?: number;
}

interface TypeformWidgetConfig {
  container: Element | null;
  embedId: string;
  options?: TypeformWidgetOptions;
  domain?: string; // Add domain property to fix the type error
}

interface Window {
  tf: {
    createWidget: (config: TypeformWidgetConfig) => void;
  }
}
