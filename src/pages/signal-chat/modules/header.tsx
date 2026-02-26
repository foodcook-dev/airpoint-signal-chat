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
    <div className="bg-foreground/95 border-border/50 fixed top-4 left-4 z-50 rounded-2xl border px-4 py-4 shadow-lg backdrop-blur-sm">
      <div className="flex-row items-center">
        <div className="border-border mb-2 flex items-center gap-3 border-b pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-1">
            <img src={logoPng} alt="logo" className="max-w-full" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-contrast text-sm font-semibold">관리자 시그널 채팅</p>
            <p className="text-contrast text-xs">메시지를 작성하고 전달하세요.</p>
          </div>
          {/* <ThemeToggle /> */}
        </div>
        <div className="flex items-center justify-center gap-2 bg-blue-50 py-1 text-xs font-medium text-blue-700">
          <Users className="h-4 w-4 text-blue-500" />
          <span>{`현재 ${activeUserCount?.connected_count || 0}명 접속중`}</span>
        </div>
      </div>
    </div>
  );
}
