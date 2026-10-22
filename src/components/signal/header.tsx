import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoPng from '@/assets/images/app_logo.png';
import { useQuery } from '@tanstack/react-query';
import { getActiveUserCount } from '@/api/signal';
import { Crown, Users, Bell } from 'lucide-react';
import { cn } from '@/libs/auth';
import { Button } from '@/components/ui/button';
import NewCommentsPopover from '@/components/modules/new-comments-popover';
import { ThemeToggle } from '@/components/modules/theme-toggle';
import { SIGNAL_CHANNELS } from '@/constants/signal';
import type { SignalChannel } from '@/types/signal';

// TODO: API 연동 전 시안 — 실제로는 서버에서 마지막 확인 시점 이후 신규 댓글 수를 내려줘야 함
const MOCK_NEW_COMMENT_COUNT = 5;

function ChannelTab({ channel, isActive }: { channel: SignalChannel; isActive: boolean }) {
  const config = SIGNAL_CHANNELS[channel];

  // TODO: 채널별 API가 준비되면 channel 값을 요청에 반영 (현재는 두 채널 모두 동일 API 사용)
  const { data: activeUserCount } = useQuery({
    queryKey: ['user', channel],
    queryFn: () => getActiveUserCount(),
    refetchInterval: 5000,
  });

  return (
    <NavLink
      to={`/chat/${channel}`}
      className={cn(
        'relative flex h-full items-center gap-2 px-2 text-sm font-semibold whitespace-nowrap transition-colors',
        isActive ? config.tabTextClass : 'text-contrast/50 hover:text-contrast/80',
      )}
    >
      {channel === 'premium' && <Crown className="size-4" />}
      <span className="@2xl:hidden">{config.shortLabel}</span>
      <span className="hidden @2xl:inline">{config.label}</span>
      <span
        className={cn(
          'hidden items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium @lg:flex',
          isActive ? config.badgeClass : 'bg-button-background text-contrast/60',
        )}
      >
        <Users className="size-3" />
        {channel === 'premium'
          ? activeUserCount?.paid_connected_count || 0
          : activeUserCount?.free_connected_count || 0}
      </span>
      {/* 활성 탭 밑줄 — 헤더 하단 테두리와 같은 높이에 맞춰 떨어지도록 nav/탭을 h-full로 맞춤 */}
      {isActive && (
        <span className={cn('absolute inset-x-0 bottom-0 h-[2px]', config.tabUnderlineClass)} />
      )}
    </NavLink>
  );
}

export default function Header({ channel }: { channel: SignalChannel }) {
  const channelConfig = SIGNAL_CHANNELS[channel];
  const [newCommentsOpen, setNewCommentsOpen] = useState(false);
  // "모두 확인" 버튼을 눌러야 비워짐 (목업 — 실제로는 서버에 확인 처리를 기록해야 함)
  const [newCommentCount, setNewCommentCount] = useState(MOCK_NEW_COMMENT_COUNT);

  return (
    <div className="bg-background border-border flex h-16 flex-shrink-0 items-stretch justify-between gap-4 border-b px-4">
      <div className="flex items-stretch gap-4">
        <div className="flex flex-shrink-0 items-center gap-3">
          <div className="border-border flex h-10 w-10 items-center justify-center rounded-full border bg-white px-1">
            <img src={logoPng} alt="logo" className="max-w-full" />
          </div>
          <div className="flex flex-col">
            <p className="text-contrast text-sm font-semibold whitespace-nowrap">
              관리자 시그널 채팅
            </p>
            <p className="text-contrast/60 hidden text-xs whitespace-nowrap @xl:block">
              메시지를 작성하고 전달하세요.
            </p>
          </div>
        </div>

        <nav className="border-border flex items-stretch gap-2 pl-6">
          {(Object.keys(SIGNAL_CHANNELS) as SignalChannel[]).map((key) => (
            <ChannelTab key={key} channel={key} isActive={key === channel} />
          ))}
        </nav>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        {/* 개발 서버 확인용 다크/라이트 모드 토글 */}
        <ThemeToggle />

        <NewCommentsPopover
          open={newCommentsOpen}
          onOpenChange={setNewCommentsOpen}
          unreadCount={newCommentCount}
          onMarkAllRead={() => setNewCommentCount(0)}
        >
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-button-background text-contrast/70 hover:text-contrast gap-1.5 text-xs"
          >
            <span className="relative flex items-center">
              <Bell className="size-4" />
              {newCommentCount > 0 && (
                <span
                  className={cn(
                    'absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white',
                    channelConfig.badgeClass,
                  )}
                >
                  {newCommentCount > 9 ? '9+' : newCommentCount}
                </span>
              )}
            </span>
            {/* 헤더가 좁아지면 버튼 텍스트는 숨기고 벨 아이콘만 남긴다 */}
            <span className="hidden whitespace-nowrap @lg:inline">
              {channelConfig.shortLabel} 시그널 새 댓글
            </span>
          </Button>
        </NewCommentsPopover>
      </div>
    </div>
  );
}
