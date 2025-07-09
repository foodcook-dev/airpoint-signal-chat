import { Bell } from 'lucide-react';

export default function SignalHeader() {
  return (
    <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
            <Bell className="text-white w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">관리자 시그널 발송 페이지</p>
            <p className="text-xs text-gray-500">내용을 작성하고 발송하세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
