import { Pin, BarChart3 } from 'lucide-react';
import { ChatMessage } from '@/types/signal';
import { formatSignalDate } from '@/utils';
import { cn } from '@/libs/auth';

export function PollResultMessage({
  pollResult,
  message,
}: {
  pollResult: NonNullable<ChatMessage['poll_notification']>;
  message: string;
}) {
  const { summaries } = pollResult;
  const totalVotes = summaries?.reduce((sum, item) => sum + item.vote_count, 0) || 0;
  const sortedSummaries = summaries
    ? [...summaries].sort((a, b) => b.vote_count - a.vote_count)
    : [];

  return (
    <div>
      <div className="flex items-center gap-2">
        {/* 투표 종료 Title */}
        <div className="bg-contrast/10 text-contrast/60 flex items-center gap-1 rounded-full px-2.5 py-1">
          <BarChart3 className="size-3" />
          <span className="text-xs font-semibold">투표 종료</span>
        </div>
        <span className="text-contrast text-[13px] font-semibold">{message}</span>
      </div>

      {/* 투표 결과 */}
      {sortedSummaries && sortedSummaries.length > 0 && (
        <div className="border-border bg-background mt-3 flex w-full flex-col gap-1.5 rounded-xl border px-2 py-2">
          {sortedSummaries.map((summary, index) => {
            const percentage = totalVotes > 0 ? (summary.vote_count / totalVotes) * 100 : 0;

            let rank = index + 1;
            if (index > 0) {
              const prev = sortedSummaries[index - 1];
              if (prev.vote_count === summary.vote_count) {
                let startIndex = index - 1;
                while (
                  startIndex > 0 &&
                  sortedSummaries[startIndex - 1].vote_count === summary.vote_count
                ) {
                  startIndex--;
                }
                rank = startIndex + 1;
              }
            }
            const isTop = rank === 1;

            return (
              <div
                key={index}
                className="border-border/60 relative flex items-center overflow-hidden rounded-lg border px-2 py-1.5"
              >
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-lg',
                    isTop ? 'bg-primary/15' : 'bg-contrast/[0.04]',
                  )}
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative flex w-full items-center gap-1.5">
                  <span
                    className={cn(
                      'w-6 flex-shrink-0 text-[10px] font-bold',
                      isTop ? 'text-primary' : 'text-contrast/40',
                    )}
                  >
                    {rank}위
                  </span>
                  <p className="text-contrast flex-1 truncate text-[12px] font-medium">
                    {summary.option_text}
                  </p>
                  <span className="text-contrast/60 flex-shrink-0 text-[10px]">
                    {summary.vote_count}표
                  </span>
                  <span className="text-contrast min-w-[2.5rem] flex-shrink-0 text-right text-xs font-bold">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PollMessage({
  poll,
  createdAt,
  isNotice,
}: {
  poll: NonNullable<ChatMessage['poll']>;
  createdAt: string;
  isNotice: boolean;
}) {
  const { title = '', content = '', end_date, options = [] } = poll;

  return (
    <div>
      <div className="mb-2 flex flex-col gap-2">
        {/* 투표 Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-1">
              {isNotice && <Pin className="size-3" />}
              <BarChart3 className="size-3" />
              <span className="text-xs font-semibold">공지</span>
            </div>
            <span className="text-contrast text-[13px] font-semibold">{title}</span>
          </div>
          <span className="text-placeholder text-[10px]">{`${formatSignalDate(
            createdAt,
          )} ~ ${formatSignalDate(end_date)}`}</span>
        </div>

        {/* 투표 Content */}
        {content && <span className="text-contrast/80 text-[13px]">{content}</span>}
      </div>

      {/* 투표 Option — 진행률/투표수는 상세 패널에서만 보여주고 리스트에는 옵션만 노출 */}
      {options.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {options.map(({ id, text }) => (
            <div key={id} className="border-border border-t pt-2">
              <p className="text-contrast text-[13px]">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
