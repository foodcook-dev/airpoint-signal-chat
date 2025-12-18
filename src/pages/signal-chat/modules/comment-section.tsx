import { useState } from 'react';
import { X, MessageSquareOff, UserX, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import likePng from '@/assets/images/signal_like.png';
import goodPng from '@/assets/images/signal_good.png';
import checkPng from '@/assets/images/signal_check.png';
import logoPng from '@/assets/images/app_logo.png';
import UserBlockDialog from '@/components/modules/dialog/user-block-dialog';
import ImagePreviewDialog from '@/components/modules/dialog/image-preview-dialog';
import { Spinner } from '@/components/ui/spinner';
import type { ChatMessage } from '@/pages/signal-chat/types';
import { useCommentHandler } from '@/pages/signal-chat/hooks/useCommentHandler';

interface CommentSectionProps {
  selectedChat: ChatMessage;
  onClose: () => void;
}

export default function CommentSection({ selectedChat, onClose }: CommentSectionProps) {
  const { message_with_html, message, content_images, created_at, reactions } = selectedChat;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const {
    isFetching,
    selectedUser,
    commentList,
    commentCount,
    commentObserverRef,
    scrollContainerRef,
    blockDialogOpen,
    commentRefetch,
    setBlockDialogOpen,
    handleDisableComment,
    handleBlockUser,
    handleConfirmBlock,
  } = useCommentHandler({
    selectedChat,
  });

  return (
    <div className="border-border bg-background flex h-screen w-[450px] flex-col border-l">
      {/* 헤더 */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-contrast text-sm font-semibold">댓글</span>
          <span className="text-contrast/50 text-xs">작성된 댓글을 확인하고 관리하세요.</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-contrast hover:bg-foreground/60 h-7 w-7"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* 선택된 채팅 메시지 */}
      <div className="border-border flex max-h-[400px] flex-shrink-0 flex-col gap-6 overflow-y-auto border-b px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white px-1 shadow-sm">
            <img src={logoPng} alt="logo" className="max-w-full" />
          </div>
          <div>
            <p className="text-contrast/90 text-sm font-semibold">에어포인트</p>
            <p className="text-contrast/70 text-xs">{format(created_at, 'yyyy-MM-dd HH:mm')}</p>
          </div>
        </div>

        {/* 채팅 메시지 */}
        {message_with_html ? (
          <div
            className="text-contrast max-w-full text-sm leading-relaxed break-words whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: message_with_html }}
          />
        ) : (
          <span className="text-contrast text-sm break-words">{message}</span>
        )}

        {/* 첨부된 이미지 */}
        {content_images.length > 0 && (
          <div>
            <span className="text-contrast/50 text-xs">첨부 이미지 {content_images.length}장</span>
            <div className="[&::-webkit-scrollbar-thumb]:bg-contrast/20 hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              {content_images.map((image) => (
                <div key={image} className="flex justify-center pb-2">
                  <img
                    src={image}
                    className="max-h-40 max-w-40 cursor-pointer rounded-lg object-contain transition-opacity hover:opacity-80"
                    onClick={() => setSelectedImage(image)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 리액션 */}
        {reactions && (
          <div className="border-border/50 text-contrast/80 flex justify-end gap-1 border-t pt-3 text-xs select-none">
            {reactions?.like > 0 && (
              <div className="flex items-center gap-1 rounded-sm p-1">
                <img src={likePng} alt="like" className="inline-block h-3.5" />
                <span>{reactions.like}</span>
              </div>
            )}
            {reactions?.good > 0 && (
              <div className="flex items-center gap-1 rounded-sm p-1">
                <img src={goodPng} alt="good" className="inline-block h-3.5" />
                <span>{reactions.good}</span>
              </div>
            )}
            {reactions?.check > 0 && (
              <div className="flex items-center gap-1 rounded-sm p-1">
                <img src={checkPng} alt="check" className="inline-block h-3.5" />
                <span>{reactions.check}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 댓글 리스트 헤더 */}
      <div className="bg-foreground/70 flex items-center justify-between px-4 py-3">
        <p className="text-contrast/80 text-xs font-medium">전체 댓글 {commentCount}개</p>
        <Button
          variant="ghost"
          size="icon"
          className="text-contrast hover:bg-foreground/60 h-5 w-5"
          onClick={() => commentRefetch()}
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* 댓글 리스트 */}
      <div
        ref={scrollContainerRef}
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        {isFetching && (
          <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <Spinner size="md" />
          </div>
        )}
        {commentList.length > 0 && (
          <>
            {commentList.map(
              ({
                id,
                nickname,
                message,
                images,
                is_edited,
                reported_count,
                deleted_at,
                created_at,
                user_id,
              }) => (
                <div
                  key={id}
                  className="border-border/60 hover:bg-foreground/40 border-b px-4 py-4"
                >
                  {deleted_at && (
                    <div className="text-contrast/50 mb-2 flex items-center gap-0.5">
                      <Trash2 className="size-3" />
                      <span className="text-xs">삭제된 댓글입니다.</span>
                    </div>
                  )}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p
                        className={`truncate text-sm font-medium ${
                          deleted_at ? 'text-contrast/50' : 'text-contrast/90'
                        }`}
                      >
                        {nickname}
                      </p>
                      <div className="text-contrast/70 flex gap-1 text-xs whitespace-nowrap">
                        <p>{format(created_at, 'yyyy-MM-dd HH:mm')}</p>
                        {is_edited && <p>(수정됨)</p>}
                      </div>
                      {reported_count > 0 && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${'bg-red-500/20 text-red-600'}`}
                          title={`누적 신고 ${reported_count}회`}
                        >
                          신고 {reported_count}회
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-contrast/60 hover:bg-foreground/60 h-6 w-6 hover:text-red-500"
                        onClick={() => handleDisableComment(id, deleted_at)}
                        title="댓글 비활성화"
                      >
                        <MessageSquareOff className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-contrast/60 hover:bg-foreground/60 h-6 w-6 hover:text-red-500"
                        onClick={() => handleBlockUser(user_id, nickname)}
                        title="사용자 댓글 작성 제한"
                      >
                        <UserX className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div
                    className={`py-2 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                      deleted_at ? 'text-contrast/40' : 'text-contrast'
                    }`}
                  >
                    {message}
                  </div>
                  {images.length > 0 && (
                    <>
                      <div className="mt-4">
                        <span className="text-contrast/50 text-xs">
                          첨부 이미지 {images.length}장
                        </span>
                      </div>
                      <div className="[&::-webkit-scrollbar-thumb]:bg-contrast/20 hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40 mt-2 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                        {images.map((image) => (
                          <div key={image} className="flex justify-center pb-2">
                            <img
                              src={image}
                              className="max-h-40 max-w-40 cursor-pointer rounded-lg object-contain transition-opacity hover:opacity-80"
                              onClick={() => setSelectedImage(image)}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ),
            )}
            <div ref={commentObserverRef} className="h-4" />
          </>
        )}
      </div>

      {selectedUser && (
        <UserBlockDialog
          open={blockDialogOpen}
          onOpenChange={setBlockDialogOpen}
          userId={selectedUser.userId}
          nickname={selectedUser.nickname}
          onConfirm={handleConfirmBlock}
        />
      )}

      <ImagePreviewDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        imageUrl={selectedImage}
      />
    </div>
  );
}
