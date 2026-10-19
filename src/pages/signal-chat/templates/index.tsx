import { useState } from 'react';
import { Star } from 'lucide-react';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import { useSignalHandler } from '@/pages/signal-chat/hooks/useSignalHandler';
import type { ChatMessage, SignalChannel } from '@/pages/signal-chat/types';
import { cn } from '@/libs/utils';
import Header from '@/pages/signal-chat/modules/header';
import Message from '@/pages/signal-chat/modules/message';
import InputForm from '../modules/input-form';
import CommentSection from '../modules/comment-section';

export default function SignalChat({ channel }: { channel: SignalChannel }) {
  const {
    scrollTriggerRef,
    selectedChat,
    setSelectedChat,

    // 메시지 입력창 관련 상태 및 함수
    inputValue,
    isAutoReactionEnabled,
    maxAutoReactions,
    fileInputRef,
    isSubmitting,
    selectedImages,
    setInputValue,
    setIsAutoReactionEnabled,
    setMaxAutoReactions,
    handleSendMessage,
    handleDeleteMessage,
    handleImageSelect,
    handleImageRemove,
    handleImageButtonClick,

    // 메시지 관련 상태 및 함수
    messageList,
    loadMoreMessages,
    hasNextPage,
    isFetchingNextPage,
    handleToggleInvestmentNote,
  } = useSignalHandler(channel);

  const handleOpenThread = (message: ChatMessage) => setSelectedChat(message);
  const handleCloseThread = () => setSelectedChat(null);

  // 투자노트는 프리미엄 채널에만 있는 기능 (무료 채널엔 없음)
  const canPickInvestmentNote = channel === 'premium';
  const [showInvestmentNotesOnly, setShowInvestmentNotesOnly] = useState(false);
  const investmentNoteCount = messageList.filter((m) => m.is_investment_note).length;
  // 모아보기는 현재까지 불러온(스크롤된) 목록 안에서만 필터링됨 — 전체 이력 기준 필터는
  // 백엔드에 파라미터가 생기면 그쪽으로 옮기는 게 맞음
  const displayedMessages =
    canPickInvestmentNote && showInvestmentNotesOnly
      ? messageList.filter((m) => m.is_investment_note)
      : messageList;

  return (
    <div className="flex w-[100vw]">
      <div
        className={`bg-background flex h-screen flex-col transition-[width] duration-100 ease-out ${
          selectedChat ? 'w-[calc(100vw-450px)]' : 'w-[100vw]'
        }`}
      >
        <Header channel={channel} />

        {canPickInvestmentNote && (
          <div className="border-border bg-background flex flex-shrink-0 items-center gap-2 border-b px-4 py-2">
            <button
              type="button"
              onClick={() => setShowInvestmentNotesOnly(false)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                !showInvestmentNotesOnly
                  ? 'bg-foreground text-contrast'
                  : 'text-contrast/50 hover:text-contrast',
              )}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setShowInvestmentNotesOnly(true)}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                showInvestmentNotesOnly
                  ? 'bg-amber-500 text-white'
                  : 'text-contrast/50 hover:text-contrast',
              )}
            >
              <Star className={cn('size-3', showInvestmentNotesOnly && 'fill-white')} />
              투자노트만 ({investmentNoteCount})
            </button>
          </div>
        )}

        <ChatMessageList
          onLoadMore={loadMoreMessages}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          scrollTriggerRef={scrollTriggerRef}
        >
          {showInvestmentNotesOnly && displayedMessages.length === 0 ? (
            <div className="text-contrast/40 flex flex-col items-center justify-center gap-2 py-16">
              <Star className="size-7" strokeWidth={1.5} />
              <p className="text-xs">아직 지정된 투자노트가 없습니다.</p>
            </div>
          ) : (
            displayedMessages
              .slice()
              .reverse()
              .map((chat) => (
                <Message
                  key={chat.id}
                  chat={chat}
                  onDelete={handleDeleteMessage}
                  onOpenThread={handleOpenThread}
                  onToggleInvestmentNote={handleToggleInvestmentNote}
                  canPickInvestmentNote={canPickInvestmentNote}
                  // TODO: 세션 로컬 "마지막으로 본 댓글 수" 비교 로직 보류 — 지금은 댓글이
                  // 있는 모든 메시지를 새 댓글이 있는 것처럼 표시 (시안 공유용)
                  newCommentCount={chat.comment_count}
                />
              ))
          )}
        </ChatMessageList>
        <InputForm
          channel={channel}
          inputValue={inputValue}
          selectedImages={selectedImages}
          isSubmitting={isSubmitting}
          fileInputRef={fileInputRef}
          onInputChange={setInputValue}
          onSubmit={handleSendMessage}
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
          onImageButtonClick={handleImageButtonClick}
          isAutoReactionEnabled={isAutoReactionEnabled}
          maxAutoReactions={maxAutoReactions}
          onAutoReactionToggle={setIsAutoReactionEnabled}
          onMaxAutoReactionsChange={setMaxAutoReactions}
        />
      </div>
      {selectedChat && (
        <CommentSection
          selectedChat={selectedChat}
          onClose={handleCloseThread}
          onToggleInvestmentNote={handleToggleInvestmentNote}
          canPickInvestmentNote={canPickInvestmentNote}
        />
      )}
    </div>
  );
}
