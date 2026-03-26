
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika boyunca veriler "taze" kabul edilir (Cache)
      gcTime: 1000 * 60 * 30,   // 30 dakika kullanılmayan veriler silinir
      retry: 1,
      refetchOnWindowFocus: false, // Odaklanınca tekrar çekmeyi kapat (Trafik tasarrufu)
    },
  },
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
