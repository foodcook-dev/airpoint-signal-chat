import { useState } from 'react';
import { X, MessageSquareOff, UserX, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import likePng from '@/assets/images/signal_like.png';
import goodPng from '@/assets/images/signal_good.png';
import checkPng from '@/assets/images/signal_check.png';
import logoPng from '@/assets/images/app_logo.png';
import type { ChatMessage } from '../types';
import UserBlockDialog from '@/components/modules/dialog/user-block-dialog';
import ImagePreviewDialog from '@/components/modules/dialog/image-preview-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useCommentHandler } from '../hooks/useCommentHandler';

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
    <div className="flex h-screen w-[450px] border-l border-border bg-background flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold tracking-tight text-contrast">댓글</span>
          <span className="text-xs text-contrast/50">작성된 댓글을 확인하고 관리하세요.</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-contrast hover:bg-foreground/60"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="overflow-y-auto max-h-[400px] px-4 py-5 border-b border-border gap-6 flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white shadow-sm rounded-full flex px-1 items-center justify-center">
            <img src={logoPng} alt="logo" className="max-w-full" />
          </div>
          <div>
            <p className="text-sm font-semibold text-contrast/90">에어포인트</p>
            <p className="text-xs text-contrast/70">{format(created_at, 'yyyy-MM-dd HH:mm')}</p>
          </div>
        </div>
        {message_with_html ? (
          <div
            className="text-sm text-contrast break-words max-w-full whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message_with_html }}
          />
        ) : (
          <span className="text-sm text-contrast break-words">{message}</span>
        )}
        {content_images.length > 0 && (
          <div>
            <span className="text-xs text-contrast/50">첨부 이미지 {content_images.length}장</span>
            <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-contrast/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40">
              {content_images.map((image) => (
                <div key={image} className="pb-2 flex justify-center">
                  <img
                    src={image}
                    className="rounded-lg max-w-40 max-h-40 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(image)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {(reactions?.like > 0 || reactions?.good > 0 || reactions?.check > 0) && (
          <div className="flex pt-3 gap-1 border-t border-border/50 justify-end text-xs text-contrast/80 select-none">
            {reactions?.like > 0 && (
              <div className="flex gap-1 items-center rounded-sm p-1">
                <img src={likePng} alt="like" className="inline-block h-3.5" />
                <span className="font-medium">{reactions.like}</span>
              </div>
            )}
            {reactions?.good > 0 && (
              <div className="flex gap-1 items-center rounded-sm p-1">
                <img src={goodPng} alt="good" className="inline-block h-3.5" />
                <span className="font-medium">{reactions.good}</span>
              </div>
            )}
            {reactions?.check > 0 && (
              <div className="flex gap-1 items-center rounded-sm p-1">
                <img src={checkPng} alt="check" className="inline-block h-3.5" />
                <span className="font-medium">{reactions.check}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between px-4 py-3 items-center bg-foreground/70">
        <p className="text-xs font-medium text-contrast/80">전체 댓글 {commentCount}개</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-contrast hover:bg-foreground/60"
          onClick={() => commentRefetch()}
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>
      <div
        ref={scrollContainerRef}
        className="relative flex flex-col flex-1 overflow-y-auto min-h-0"
      >
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
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
                  className="px-4 py-4 border-b border-border/60 hover:bg-foreground/40 transition-colors"
                >
                  {deleted_at && (
                    <div className="flex items-center gap-0.5 text-contrast/50 mb-2">
                      <Trash2 className="size-3" />
                      <span className="text-xs">삭제된 댓글입니다.</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-sm font-medium truncate ${
                          deleted_at ? 'text-contrast/50' : 'text-contrast/90'
                        }`}
                      >
                        {nickname}
                      </p>
                      <div className="flex gap-1 text-xs text-contrast/70 whitespace-nowrap">
                        <p>{format(created_at, 'yyyy-MM-dd HH:mm')}</p>
                        {is_edited && <p>(수정됨)</p>}
                      </div>
                      {reported_count > 0 && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${'bg-red-500/20 text-red-600'}`}
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
                        className="h-6 w-6 text-contrast/60 hover:text-red-500 hover:bg-foreground/60"
                        onClick={() => handleDisableComment(id, deleted_at)}
                        title="댓글 비활성화"
                      >
                        <MessageSquareOff className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-contrast/60 hover:text-red-500 hover:bg-foreground/60"
                        onClick={() => handleBlockUser(user_id, nickname)}
                        title="사용자 댓글 작성 제한"
                      >
                        <UserX className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div
                    className={`text-sm py-2 leading-relaxed whitespace-pre-wrap break-words ${
                      deleted_at ? 'text-contrast/40 line-through' : 'text-contrast'
                    }`}
                  >
                    {message}
                  </div>
                  {images.length > 0 && (
                    <>
                      <div className="mt-4">
                        <span className="text-xs text-contrast/50">
                          첨부 이미지 {images.length}장
                        </span>
                      </div>
                      <div className="flex mt-2 gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-contrast/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40">
                        {images.map((image) => (
                          <div key={image} className="pb-2 flex justify-center">
                            <img
                              src={image}
                              className="rounded-lg max-w-40 max-h-40 object-contain cursor-pointer hover:opacity-80 transition-opacity"
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
