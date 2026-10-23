import { useState } from 'react';
import { BookMarked, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatSignalDate } from '@/utils';
import likePng from '@/assets/images/signal_like.png';
import goodPng from '@/assets/images/signal_good.png';
import checkPng from '@/assets/images/signal_check.png';
import logoPng from '@/assets/images/app_logo.png';
import type { ChatMessage } from '@/types/signal';

interface SignalPreviewBarProps {
  selectedChat: ChatMessage;
  canPickInvestmentNote: boolean;
  onPickInvestmentNote?: (chat: ChatMessage) => void;
  onImageClick: (url: string) => void;
}

// 선택된 채팅 메시지 — 기본은 인용 바로 접혀있고 클릭하면 전체 내용이 펼쳐진다
export default function SignalPreviewBar({
  selectedChat,
  canPickInvestmentNote,
  onPickInvestmentNote,
  onImageClick,
}: SignalPreviewBarProps) {
  const { message_with_html, message, content_images, created_at, reactions } = selectedChat;
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  return (
    <div className="border-border/60 flex-shrink-0 border-b">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsPreviewExpanded((prev) => !prev)}
        onKeyDown={(e) => e.key === 'Enter' && setIsPreviewExpanded((prev) => !prev)}
        className="hover:bg-foreground/40 flex cursor-pointer items-center gap-2.5 px-4 py-3 transition-colors"
      >
        <div className="bg-primary/50 h-7 w-1 flex-shrink-0 rounded-full" />
        <div className="border-border flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border bg-white px-1">
          <img src={logoPng} alt="logo" className="max-w-full" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-contrast/90 flex-shrink-0 text-xs font-semibold">에어포인트</span>
          <span className="text-contrast/60 min-w-0 flex-1 truncate text-xs">
            {message || '(이미지)'}
          </span>
        </div>
        {canPickInvestmentNote && (
          <Button
            variant="ghost"
            size="icon"
            className="text-contrast/40 h-7 w-7 flex-shrink-0 hover:text-amber-500"
            onClick={(e) => {
              e.stopPropagation();
              onPickInvestmentNote?.(selectedChat);
            }}
            title="투자노트로 지정"
          >
            <BookMarked className="size-4" />
          </Button>
        )}
        <span className="text-contrast/50 flex-shrink-0 text-[10px]">
          {formatSignalDate(created_at)}
        </span>
        <span className="text-primary flex flex-shrink-0 items-center gap-0.5 text-[10px] font-medium">
          {isPreviewExpanded ? (
            <>
              접기
              <ChevronUp className="size-3.5" />
            </>
          ) : (
            <>
              자세히
              <ChevronDown className="size-3.5" />
            </>
          )}
        </span>
      </div>

      {isPreviewExpanded && (
        <div className="bg-foreground/70 flex max-h-[260px] flex-col gap-5 overflow-y-auto px-4 py-5">
          {/* 채팅 메시지 */}
          {message_with_html ? (
            <div
              className="text-contrast max-w-full text-xs leading-relaxed break-words whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: message_with_html }}
            />
          ) : (
            <span className="text-contrast text-xs break-words">{message}</span>
          )}

          {/* 첨부된 이미지 */}
          {content_images.length > 0 && (
            <div>
              <span className="text-contrast/50 text-xs">
                첨부 이미지 {content_images.length}장
              </span>
              <div className="[&::-webkit-scrollbar-thumb]:bg-contrast/20 hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                {content_images.map((image) => (
                  <div key={image} className="flex justify-center pb-2">
                    <img
                      src={image}
                      className="max-h-40 max-w-40 cursor-pointer rounded-lg object-contain transition-opacity hover:opacity-80"
                      onClick={() => onImageClick(image)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 리액션 */}
          {reactions && (reactions.like > 0 || reactions.good > 0 || reactions.check > 0) && (
            <div className="border-border/50 flex justify-end gap-1.5 border-t pt-3 text-xs select-none">
              {reactions.like > 0 && (
                <div className="bg-background border-border/50 text-contrast/80 flex items-center gap-1 rounded-full border px-2 py-1 shadow-xs">
                  <img src={likePng} alt="like" className="inline-block h-3.5" />
                  <span>{reactions.like}</span>
                </div>
              )}
              {reactions.good > 0 && (
                <div className="bg-background border-border/50 text-contrast/80 flex items-center gap-1 rounded-full border px-2 py-1 shadow-xs">
                  <img src={goodPng} alt="good" className="inline-block h-3.5" />
                  <span>{reactions.good}</span>
                </div>
              )}
              {reactions.check > 0 && (
                <div className="bg-background border-border/50 text-contrast/80 flex items-center gap-1 rounded-full border px-2 py-1 shadow-xs">
                  <img src={checkPng} alt="check" className="inline-block h-3.5" />
                  <span>{reactions.check}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
