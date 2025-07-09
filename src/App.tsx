import { HashRouter } from 'react-router-dom';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import ResponseError from '@/libs/response-error';
import { getTokenFromUrl, setTokenToStorage } from '@/libs/utils';
import Pages from '@/pages/Root';

export default function App() {
  // const commonErrorHandle = useGlobalRejectHandler();
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
      console.log('토큰이 URL에서 추출되어 저장되었습니다:', token);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Pages />
      </HashRouter>
    </QueryClientProvider>
  );
}
