import { XIcon, MessageSquareOff, UserX, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import likePng from '@/assets/images/signal_like.png';
import goodPng from '@/assets/images/signal_good.png';
import checkPng from '@/assets/images/signal_check.png';
import logoPng from '@/assets/images/app_logo.png';
import type { ChatMessage } from '../types';
import UserBlockDialog from '@/components/modules/dialog/user-block-dialog';
import { useCommentHandler } from '../hooks/useCommentHandler';

interface CommentSectionProps {
  selectedChat: ChatMessage;
  onClose: () => void;
}

export default function CommentSection({ selectedChat, onClose }: CommentSectionProps) {
  const { message_with_html, message, created_at, reactions } = selectedChat;
  const {
    selectedUser,
    commentList,
    commentCount,
    commentObserverRef,
    blockDialogOpen,
    isFetchingNextCommentPage,
    setBlockDialogOpen,
    handleDisableComment,
    handleBlockUser,
    handleConfirmBlock,
  } = useCommentHandler({
    selectedChat,
  });

  return (
    <div className="flex h-screen w-[400px] border-l border-border bg-background flex-col">
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold tracking-tight text-contrast">댓글</span>
          <span className="text-xs text-contrast/50">메시지에 작성된 댓글을 확인하세요</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-contrast hover:bg-foreground/60"
          onClick={onClose}
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="px-4 py-6 border-b border-border gap-10 flex flex-col flex-shrink-0">
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
            className="text-sm text-contrast break-words"
            dangerouslySetInnerHTML={{ __html: message_with_html }}
          />
        ) : (
          <span className="text-sm text-contrast break-words">{message}</span>
        )}
        {(reactions?.like > 0 || reactions?.good > 0 || reactions?.check > 0) && (
          <div className="flex pt-4 gap-1 border-t border-border/50 justify-end text-xs text-contrast/80 select-none">
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
      <div className="px-4 py-4 items-center bg-foreground/70">
        <p className="text-xs font-medium text-contrast/80">전체 댓글 {commentCount}개</p>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0">
        {commentList.length > 0 && (
          <>
            {commentList.map(
              ({ id, nickname, message, images, is_edited, deleted_at, created_at, user_id }) => (
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
                      <div className="flex items-center">
                        <p
                          className={`text-sm font-medium truncate ${
                            deleted_at ? 'text-contrast/50' : 'text-contrast/90'
                          }`}
                        >
                          {nickname}
                        </p>
                      </div>
                      <div className="flex gap-1 text-xs text-contrast/70 whitespace-nowrap">
                        <p>{format(created_at, 'yyyy-MM-dd HH:mm')}</p>
                        {is_edited && <p>(수정됨)</p>}
                      </div>
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
                          <div key={image} className="pb-4 flex justify-center">
                            <img src={image} className="max-w-50 max-h-50 object-contain" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ),
            )}
            <div ref={commentObserverRef} className="h-4" />
            {isFetchingNextCommentPage && (
              <div className="py-4 text-center text-xs text-contrast/50">로딩 중...</div>
            )}
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
    </div>
  );
}
