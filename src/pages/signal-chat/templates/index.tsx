import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import { useSignalHandler } from '@/pages/signal-chat/hooks/useSignalHandler';
import SignalHeader from '../modules/SignalHeader';
import SignalMessage from '../modules/SignalMessage';
import InputForm from '../modules/InputForm';

export default function SignalChat() {
  const {
    fileInputRef,
    scrollTriggerRef,
    inputValue,
    selectedImages,
    isPushEnabled,
    isSubmitting,
    messageList,
    setInputValue,
    setIsPushEnabled,
    handleSendMessage,
    handleDeleteMessage,
    handleImageSelect,
    handleImageRemove,
    handleImageButtonClick,
    loadMoreMessages,
    hasNextPage,
    isFetchingNextPage,
  } = useSignalHandler();

  return (
    <div className="w-[100vw] flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SignalHeader />
      <div className="flex-1 overflow-hidden">
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
              <SignalMessage key={chat.id} chat={chat} onDelete={handleDeleteMessage} />
            ))}
        </ChatMessageList>
      </div>
      <InputForm
        inputValue={inputValue}
        selectedImages={selectedImages}
        isPushEnabled={isPushEnabled}
        isSubmitting={isSubmitting}
        fileInputRef={fileInputRef}
        onInputChange={setInputValue}
        onSubmit={handleSendMessage}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        onImageButtonClick={handleImageButtonClick}
        onPushEnabledChange={setIsPushEnabled}
      />
    </div>
  );
}
