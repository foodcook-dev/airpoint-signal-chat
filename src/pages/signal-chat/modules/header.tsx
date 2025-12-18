// import { ThemeToggle } from '@/components/modules/theme-toggle';
import logoPng from '@/assets/images/app_logo.png';

export default function Header() {
  return (
    <div className="bg-foreground/95 border-border/50 fixed top-4 left-4 z-50 rounded-2xl border px-6 py-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-1">
          <img src={logoPng} alt="logo" className="max-w-full" />
        </div>
        <div>
          <p className="text-contrast text-sm font-semibold">관리자 시그널 채팅</p>
          <p className="text-contrast text-xs">메시지를 작성하고 전달하세요.</p>
        </div>
        {/* <ThemeToggle /> */}
      </div>
    </div>
  );
}
