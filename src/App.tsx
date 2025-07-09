import { HashRouter } from 'react-router-dom';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ResponseError from '@/libs/response-error';
import { getTokenFromUrl, setTokenToStorage } from '@/libs/utils';
import Pages from '@/pages/Root';

export default function App() {
  // const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    return savedTheme || 'light';
  });

  const applyTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 0,
      },
    },
    queryCache: new QueryCache({
      onError: (e) => {
        if (e instanceof ResponseError) console.log(e);
      },
    }),
  });

  useEffect(() => {
    const token = getTokenFromUrl();
    if (token) {
      setTokenToStorage(token);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // const allowedOrigin = 'https://test.appairpoint.com'; // 외부에서 postMessage를 보낸 origin
      // if (event.origin !== allowedOrigin) return;
      const { type, theme: newTheme } = event.data;

      if (type === 'THEME_CHANGE') {
        console.log('Received theme change:', newTheme);
        applyTheme(newTheme);
      }
    };

    window.addEventListener('message', handleMessage);

    // cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Pages />
      </HashRouter>
    </QueryClientProvider>
  );
}
