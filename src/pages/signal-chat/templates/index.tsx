import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import { useSignalHandler } from '@/pages/signal-chat/hooks/useSignalHandler';
import type { ChatMessage } from '@/pages/signal-chat/types';
import Header from '@/pages/signal-chat/modules/header';
import Message from '@/pages/signal-chat/modules/message';
import InputForm from '../modules/input-form';
import CommentSection from '../modules/comment-section';

export default function SignalChat() {
  const {
    scrollTriggerRef,
    selectedChat,
    setSelectedChat,

    // 메시지 입력창 관련 상태 및 함수
    inputValue,
    fileInputRef,
    isSubmitting,
    selectedImages,
    setInputValue,
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
  } = useSignalHandler();

  const handleOpenThread = (message: ChatMessage) => setSelectedChat(message);
  const handleCloseThread = () => setSelectedChat(null);

  return (
    <div className="w-[100vw] flex">
      <div
        className={`flex flex-col h-screen bg-background transition-[width] duration-100 ease-out ${
          selectedChat ? 'w-[calc(100vw-400px)]' : 'w-[100vw]'
        }`}
      >
        <Header />
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
              />
            ))}
        </ChatMessageList>
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
      {selectedChat && <CommentSection selectedChat={selectedChat} onClose={handleCloseThread} />}
    </div>
  );
}
