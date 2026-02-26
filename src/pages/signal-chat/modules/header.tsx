// import { ThemeToggle } from '@/components/modules/theme-toggle';
import logoPng from '@/assets/images/app_logo.png';
import { useQuery } from '@tanstack/react-query';
import createAxios from '@/libs/create-axios-instance';
import { Users } from 'lucide-react';

export default function Header() {
  const { data: activeUserCount } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      createAxios({
        method: 'get',
        endpoint: `/talk/signal_talks/active_user_count/`,
      }),
    refetchInterval: 5000,
  });

  return (
    <div className="bg-foreground/95 border-border/50 fixed top-4 left-4 z-50 rounded-2xl border px-6 py-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-1">
          <img src={logoPng} alt="logo" className="max-w-full" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-contrast text-sm font-semibold">관리자 시그널 채팅</p>
          <div className="flex items-center gap-1 rounded-sm bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            <Users className="h-4 w-4 text-blue-500" />
            <span>{`현재 접속자: ${activeUserCount?.connected_count || 0}명`}</span>
          </div>
        </div>
        {/* <ThemeToggle /> */}
      </div>
      <div className="mt-1 flex justify-center"></div>
    </div>
  );
}
