import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import { useSignalHandler } from '@/hooks/useSignalHandler';
import type { ChatMessage, SignalChannel } from '@/types/signal';
import Header from '@/components/signal/header';
import Message from '@/components/signal/message';
import InputForm from '@/components/signal/input-form';
import CommentSection from '@/components/signal/comment-section';
import InvestmentNoteDialog from '@/components/modules/dialog/investment-note-dialog';

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

    // 투자노트 지정 모달
    investmentNoteTarget,
    handlePickInvestmentNote,
    handleCloseInvestmentNoteModal,
    handleConfirmInvestmentNote,

    // "새 댓글" 목록에서 시그널 상세패널로 진입
    handleOpenSignalThread,
    isOpeningSignalThread,
  } = useSignalHandler(channel);

  const handleOpenThread = (message: ChatMessage) => setSelectedChat(message);
  const handleCloseThread = () => setSelectedChat(null);

  // 투자노트는 프리미엄 채널에만 있는 기능 (무료 채널엔 없음)
  const canPickInvestmentNote = channel === 'premium';

  return (
    <div className="flex w-[100vw]">
      <div
        className={`bg-background @container flex h-screen flex-col transition-[width] duration-100 ease-out ${
          selectedChat ? 'w-[calc(100vw-560px)]' : 'w-[100vw]'
        }`}
      >
        <Header
          channel={channel}
          onOpenSignalThread={handleOpenSignalThread}
          isOpeningSignalThread={isOpeningSignalThread}
        />

        <ChatMessageList
          onLoadMore={loadMoreMessages}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          scrollTriggerRef={scrollTriggerRef}
        >
          {messageList
            .slice()
            .reverse()
            .map((chat) => (
              <Message
                key={chat.id}
                chat={chat}
                onDelete={handleDeleteMessage}
                onOpenThread={handleOpenThread}
                onPickInvestmentNote={handlePickInvestmentNote}
                canPickInvestmentNote={canPickInvestmentNote}
                isSelected={selectedChat?.id === chat.id}
              />
            ))}
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
          onPickInvestmentNote={handlePickInvestmentNote}
          canPickInvestmentNote={canPickInvestmentNote}
        />
      )}

      <InvestmentNoteDialog
        open={!!investmentNoteTarget}
        onOpenChange={(open) => !open && handleCloseInvestmentNoteModal()}
        chatMessage={investmentNoteTarget}
        onConfirm={handleConfirmInvestmentNote}
      />
    </div>
  );
}
