
interface TypeformWidgetOptions {
  hideFooter?: boolean;
  hideHeaders?: boolean;
  opacity?: number;
}

interface TypeformWidgetConfig {
  container: Element | null;
  embedId: string;
  options?: TypeformWidgetOptions;
  domain?: string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

interface Window {
  tf: {
    createWidget: (config: TypeformWidgetConfig) => void;
  }
}
