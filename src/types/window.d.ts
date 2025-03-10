interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<string>;
    on: (event: string, callback: (accounts: string[]) => void) => void;
    removeListener: (event: string, callback: () => void) => void;
  }
} 