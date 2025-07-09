import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import { useSignalHandler } from '@/pages/signal-chat/hooks/useSignalHandler';
import SignalHeader from '../modules/signal-header';
import SignalMessage from '../modules/signal-message';
import InputForm from '../modules/input-form';

export default function SignalChat() {
  const {
    fileInputRef,
    scrollTriggerRef,
    inputValue,
    selectedImages,
    isSubmitting,
    messageList,
    setInputValue,
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
    <div className="w-[100vw] flex flex-col h-screen bg-background">
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
        isSubmitting={isSubmitting}
        fileInputRef={fileInputRef}
        onInputChange={setInputValue}
        onSubmit={handleSendMessage}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        onImageButtonClick={handleImageButtonClick}
      />
    </div>
  );
}
