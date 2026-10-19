import type { ReactNode } from 'react';
import { CheckCheck, MessageSquare } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatCommentTime } from '@/utils';

interface MockNewComment {
  id: number;
  nickname: string;
  message: string;
  image?: string;
  created_at: string;
}

// TODO: API 연동 전 시안용 mock 데이터 — 관리자가 마지막으로 확인한 이후 새로 달린 댓글 목록
const now = Date.now();
const MOCK_NEW_COMMENTS: MockNewComment[] = [
  {
    id: 1,
    nickname: '투자고수123',
    message: '이번 시그널 타이밍 정말 좋았어요! 덕분에 좋은 수익 챙겼습니다 감사합니다',
    created_at: new Date(now - 1000 * 40).toISOString(),
  },
  {
    id: 2,
    nickname: '케이시',
    message: '첨부해주신 차트 보고 포지션 정리했습니다. 참고 이미지 올려드려요',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop',
    created_at: new Date(now - 1000 * 60 * 6).toISOString(),
  },
  {
    id: 3,
    nickname: 'ㅇㅇ',
    message: '다음 브리핑은 몇 시쯤 올라오나요?',
    created_at: new Date(now - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 4,
    nickname: 'test',
    message:
      '오늘 장 마감 후 리뷰도 올려주시면 좋을 것 같습니다. 특히 코스닥 쪽 변동성 관련해서 자세한 설명 부탁드려요',
    created_at: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 5,
    nickname: '주식초보',
    message: '감사합니다 많이 배워갑니다',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=200&h=200&fit=crop',
    created_at: new Date(now - 1000 * 60 * 60 * 9).toISOString(),
  },
];

interface NewCommentsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unreadCount: number;
  onMarkAllRead: () => void;
  children: ReactNode;
}

export default function NewCommentsPopover({
  open,
  onOpenChange,
  unreadCount,
  onMarkAllRead,
  children,
}: NewCommentsPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex max-h-[70vh] w-[420px] flex-col overflow-hidden p-0"
      >
        <div className="border-border/60 flex items-center justify-end border-b px-3 py-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="text-contrast/60 hover:text-primary disabled:text-contrast/30 flex items-center gap-1 text-xs font-medium transition-colors disabled:cursor-not-allowed"
          >
            <CheckCheck className="size-3.5" />
            모두 확인
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_NEW_COMMENTS.length > 0 ? (
            MOCK_NEW_COMMENTS.map((comment) => (
              <div
                key={comment.id}
                className="border-border/60 hover:bg-foreground/40 flex items-start gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-primary inline-block size-1.5 flex-shrink-0 rounded-full" />
                    <p className="text-contrast/90 truncate text-xs font-semibold">
                      {comment.nickname}
                    </p>
                    <p className="text-contrast/50 flex-shrink-0 text-[10px] whitespace-nowrap">
                      {formatCommentTime(comment.created_at)}
                    </p>
                  </div>
                  <p className="text-contrast/80 mt-1 line-clamp-2 text-xs leading-relaxed break-words">
                    {comment.message}
                  </p>
                </div>

                {comment.image && (
                  <img
                    src={comment.image}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-contrast/40 flex flex-col items-center justify-center gap-2 py-16">
              <MessageSquare className="size-7" strokeWidth={1.5} />
              <p className="text-xs">새로 달린 댓글이 없습니다.</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
