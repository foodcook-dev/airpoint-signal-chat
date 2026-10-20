import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoPng from '@/assets/images/app_logo.png';
import { useQuery } from '@tanstack/react-query';
import { getActiveUserCount } from '@/api/signal';
import { Crown, Info, Users, Bell } from 'lucide-react';
import { cn } from '@/libs/auth';
import { Button } from '@/components/ui/button';
import NewCommentsPopover from '@/components/modules/new-comments-popover';
import { SIGNAL_CHANNELS } from '@/constants/signal';
import type { SignalChannel } from '@/types/signal';

// TODO: API 연동 전 시안 — 실제로는 서버에서 마지막 확인 시점 이후 신규 댓글 수를 내려줘야 함
const MOCK_NEW_COMMENT_COUNT = 5;

function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute top-full right-0 z-10 mt-1 w-max rounded bg-black px-2 py-1 text-xs text-white shadow">
          {text}
        </span>
      )}
    </span>
  );
}

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
        'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-150',
        isActive
          ? config.tabActiveClass
          : 'text-contrast/65! hover:bg-foreground hover:text-contrast! border-transparent',
      )}
    >
      {channel === 'premium' && <Crown className="size-4" />}
      {config.label}
      <span
        className={cn(
          'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
          isActive ? config.badgeClass : 'bg-button-background text-contrast/60',
        )}
      >
        <Users className="size-3" />
        {channel === 'premium'
          ? activeUserCount?.paid_connected_count || 0
          : activeUserCount?.free_connected_count || 0}
      </span>
    </NavLink>
  );
}

export default function Header({ channel }: { channel: SignalChannel }) {
  const channelConfig = SIGNAL_CHANNELS[channel];
  const [newCommentsOpen, setNewCommentsOpen] = useState(false);
  // "모두 확인" 버튼을 눌러야 비워짐 (목업 — 실제로는 서버에 확인 처리를 기록해야 함)
  const [newCommentCount, setNewCommentCount] = useState(MOCK_NEW_COMMENT_COUNT);

  return (
    <div className="bg-background border-border flex flex-shrink-0 items-center justify-between gap-4 border-b px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="border-border flex h-10 w-10 items-center justify-center rounded-full border bg-white px-1">
            <img src={logoPng} alt="logo" className="max-w-full" />
          </div>
          <div className="flex flex-col">
            <p className="text-contrast text-sm font-semibold">관리자 시그널 채팅</p>
            <p className="text-contrast/60 text-xs">메시지를 작성하고 전달하세요.</p>
          </div>
        </div>

        <nav className="border-border flex items-center gap-1 border-l pl-4">
          {(Object.keys(SIGNAL_CHANNELS) as SignalChannel[]).map((key) => (
            <ChannelTab key={key} channel={key} isActive={key === channel} />
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Tooltip text="탭의 숫자는 채널별 현재 접속 중인 사용자 수입니다.">
          <Info className="h-4 w-4 cursor-pointer text-blue-400" />
        </Tooltip>

        <NewCommentsPopover
          open={newCommentsOpen}
          onOpenChange={setNewCommentsOpen}
          unreadCount={newCommentCount}
          onMarkAllRead={() => setNewCommentCount(0)}
        >
          <Button
            variant="outline"
            size="sm"
            className={cn('relative gap-1.5 text-xs', channelConfig.tabActiveClass)}
          >
            <Bell className="size-4" />
            {channelConfig.shortLabel} 새 댓글
            {newCommentCount > 0 && (
              <span
                className={cn(
                  'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                  channelConfig.badgeClass,
                )}
              >
                {newCommentCount}
              </span>
            )}
          </Button>
        </NewCommentsPopover>
      </div>
    </div>
  );
}
