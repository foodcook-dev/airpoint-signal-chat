import { Bell } from 'lucide-react';
// import { ThemeToggle } from '@/components/theme-toggle';

export default function SignalHeader() {
  return (
    <div className="fixed top-4 left-4 z-50 bg-foreground/95 backdrop-blur-sm shadow-lg border border-border/50 px-6 py-4 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[rgb(255,137,93)] rounded-full flex items-center justify-center">
          <Bell className="text-white w-5 h-5" />
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
