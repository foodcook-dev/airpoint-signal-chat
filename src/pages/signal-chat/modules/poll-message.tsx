import { ChatBubbleMessage } from '@/components/ui/chat/chat-bubble';
import { ChatMessage } from '../types';
import { format } from 'date-fns';

export function PollResultMessage({
  poll_notification,
  message,
  message_with_html,
}: {
  poll_notification: NonNullable<ChatMessage['poll_notification']>;
  message: string;
  message_with_html?: string | null;
}) {
  const { summaries } = poll_notification;
  const totalVotes = summaries?.reduce((sum, item) => sum + item.vote_count, 0) || 0;
  const sortedSummaries = summaries
    ? [...summaries].sort((a, b) => b.vote_count - a.vote_count)
    : [];

  return (
    <ChatBubbleMessage>
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-2 self-start rounded-md px-2 py-1 text-xs font-medium text-white bg-gray-500">
          <span>투표 종료</span>
        </div>
        {message_with_html ? (
          <div
            className="text-sm text-contrast"
            dangerouslySetInnerHTML={{ __html: message_with_html }}
          />
        ) : (
          <span className="text-sm text-contrast">{message}</span>
        )}
      </div>

      {sortedSummaries && sortedSummaries.length > 0 && (
        <div className="min-w-xl mt-3 rounded-xl border border-border bg-muted/10 px-3 py-2 flex flex-col divide-y divide-border/60">
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
              <div
                key={index}
                className="w-full flex items-stretch gap-3 py-2 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col items-center justify-center min-w-[2.25rem]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-primary text-white">
                    {rank}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-sm text-contrast line-clamp-2">
                      {summary.option_text}
                    </p>
                    <span className="text-[10px] text-contrast/70 whitespace-nowrap">
                      {summary.vote_count}표
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex flex-1 items-center gap-2">
                      <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs min-w-[3rem] text-right text-contrast">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
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
  created_at,
}: {
  poll: NonNullable<ChatMessage['poll']>;
  created_at: string;
}) {
  const totalVotes = poll.options?.reduce((sum, o) => sum + o.vote_count, 0) || 0;

  return (
    <ChatBubbleMessage>
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-white bg-gray-500">
              <span>투표</span>
            </div>
            <span className="font-semibold text-sm text-contrast line-clamp-2">{poll.title}</span>
          </div>
          <span className="font-normal text-[11px] text-placeholder whitespace-nowrap">{`${format(
            created_at,
            'yyyy-MM-dd HH:mm',
          )} ~ ${format(poll.end_date, 'yyyy-MM-dd HH:mm')}`}</span>
        </div>

        {poll.content && (
          <span className="font-normal text-sm text-contrast/80 leading-relaxed">
            {poll.content}
          </span>
        )}
      </div>

      {poll.options && (
        <div className="min-w-xl flex flex-col gap-3">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;

            return (
              <div
                key={option.id}
                className="w-full border-t border-border pt-2 flex flex-col gap-1"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium text-sm text-contrast line-clamp-2">{option.text}</p>
                  <span className="text-[10px] text-contrast/70 whitespace-nowrap">
                    {option.vote_count}표
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-1.5">
                    <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="font-semibold text-xs min-w-[3rem] text-right">
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
