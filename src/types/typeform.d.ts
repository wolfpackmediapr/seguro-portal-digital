interface TypeformWidgetOptions {
  hideFooter?: boolean;
  hideHeaders?: boolean;
  opacity?: number;
}

interface TypeformWidgetConfig {
  container: Element | null;
  embedId: string;
  options?: TypeformWidgetOptions;
}

interface Window {
  tf: {
    createWidget: (config: TypeformWidgetConfig) => void;
  }
}