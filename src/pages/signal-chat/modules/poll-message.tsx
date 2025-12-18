import { Pin } from 'lucide-react';
import { format } from 'date-fns';
import { ChatBubbleMessage } from '@/components/ui/chat/chat-bubble';
import { ChatMessage } from '@/pages/signal-chat/types';

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
    <ChatBubbleMessage>
      <div className="flex items-center gap-2">
        {/* 투표 종료 Title */}
        <div className="flex items-center rounded-md bg-gray-500 px-2 py-1">
          <span className="text-xs font-medium text-white">투표 종료</span>
        </div>
        <span className="text-contrast text-sm font-semibold">{message}</span>
      </div>

      {/* 투표 결과 */}
      {sortedSummaries && sortedSummaries.length > 0 && (
        <div className="border-border bg-muted/10 divide-border/60 mt-3 flex min-w-xl flex-col divide-y rounded-xl border px-3 py-2">
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
    </ChatBubbleMessage>
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
  const totalVotes = options?.reduce((sum, o) => sum + o.vote_count, 0) || 0;

  return (
    <ChatBubbleMessage>
      <div className="mb-2 flex flex-col gap-2">
        {/* 투표 Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md bg-gray-500 px-2 py-1">
              {isNotice && <Pin className="mr-1 h-3 w-3 text-white" />}
              <span className="text-xs font-medium text-white">투표</span>
            </div>
            <span className="text-contrast text-sm font-semibold">{title}</span>
          </div>
          <span className="text-placeholder text-[10px]">{`${format(
            createdAt,
            'yyyy-MM-dd HH:mm',
          )} ~ ${format(end_date, 'yyyy-MM-dd HH:mm')}`}</span>
        </div>

        {/* 투표 Content */}
        {content && <span className="text-contrast/80 text-sm">{content}</span>}
      </div>

      {/* 투표 Option */}
      {options && (
        <div className="flex min-w-xl flex-col gap-3">
          {options.map(({ id, text, vote_count }) => {
            const percentage = totalVotes > 0 ? (vote_count / totalVotes) * 100 : 0;

            return (
              <div key={id} className="border-border flex w-full flex-col gap-1 border-t pt-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-contrast text-sm">{text}</p>
                  <span className="text-contrast/70 text-[10px]">{vote_count}표</span>
                </div>

                <div className="flex flex-1 items-center gap-1.5">
                  <div className="bg-muted/50 h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="min-w-[3rem] text-right text-xs font-semibold">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ChatBubbleMessage>
  );
}
