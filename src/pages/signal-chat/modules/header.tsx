import { ThemeToggle } from '@/components/modules/theme-toggle';
import logoPng from '@/assets/images/app_logo.png';

export default function Header() {
  return (
    <div className="fixed top-4 left-4 z-50 bg-foreground/95 backdrop-blur-sm shadow-lg border border-border/50 px-6 py-4 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex px-1 items-center justify-center">
          <img src={logoPng} alt="logo" className="max-w-full" />
        </div>
        <div>
          <p className="text-sm text-contrast font-semibold">관리자 시그널 채팅</p>
          <p className="text-xs text-contrast">메시지를 작성하고 전달하세요</p>
        </div>
        {/* <ThemeToggle /> */}
      </div>
    </div>
  );
}
