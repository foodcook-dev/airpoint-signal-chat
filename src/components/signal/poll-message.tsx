import { Pin, BarChart3 } from 'lucide-react';
import { ChatMessage } from '@/types/signal';
import { formatSignalDate } from '@/utils';

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
        <span className="text-contrast text-sm font-semibold">{message}</span>
      </div>

      {/* 투표 결과 */}
      {sortedSummaries && sortedSummaries.length > 0 && (
        <div className="border-border bg-muted/10 divide-border/60 mt-3 flex w-full flex-col divide-y rounded-xl border px-3 py-2">
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

            return (
              <div key={index} className="flex w-full gap-3 py-2 first:pt-0 last:pb-0">
                <div className="bg-primary flex h-9 w-9 min-w-[2.25rem] items-center justify-center rounded-full">
                  <span className="text-xs font-bold text-white">{rank}위</span>
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-contrast text-sm font-semibold">{summary.option_text}</p>
                    <span className="text-contrast/70 text-[10px]">{summary.vote_count}표</span>
                  </div>

                  <div className="mt-0.5 flex flex-1 items-center gap-2">
                    <div className="bg-muted/50 h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-contrast min-w-[3rem] text-right text-xs font-bold">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
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
            <span className="text-contrast text-sm font-semibold">{title}</span>
          </div>
          <span className="text-placeholder text-[10px]">{`${formatSignalDate(
            createdAt,
          )} ~ ${formatSignalDate(end_date)}`}</span>
        </div>

        {/* 투표 Content */}
        {content && <span className="text-contrast/80 text-sm">{content}</span>}
      </div>

      {/* 투표 Option — 진행률/투표수는 상세 패널에서만 보여주고 리스트에는 옵션만 노출 */}
      {options.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {options.map(({ id, text }) => (
            <div key={id} className="border-border border-t pt-2">
              <p className="text-contrast text-sm">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
