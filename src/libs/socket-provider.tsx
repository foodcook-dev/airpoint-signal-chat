import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { PATH } from '@/constants/api-path';
import { ADMIN_DEBUG_TOKEN } from '@/libs/client';
import useNewCommentsStore from '@/stores/new-comments';
import type {
  ChatResponse,
  SignalReactionUpdateEvent,
  SignalCommentCountUpdateEvent,
  SignalCommentEvent,
  Comment,
  Reply,
  CommentResponse,
} from '@/types/signal';

// 별도 핸들러가 캐시를 직접 patch하는 이벤트 — onAny의 전체 무효화에서 제외한다
const SPECIFICALLY_HANDLED_EVENTS = new Set([
  'signal_reaction_update',
  'update_comment_count',
  'create_signal_talk_comment',
  'update_signal_talk_comment',
  'delete_signal_talk_comment',
]);

// 소켓이 같은 이벤트를 배열로 묶어 보내는 경우가 있어 항상 단일 객체로 정규화한다
function firstOf<T>(payload: T | T[]): T | undefined {
  return Array.isArray(payload) ? payload[0] : payload;
}

function toComment(event: SignalCommentEvent): Comment {
  return {
    id: event.id,
    signal_talk_id: event.signal_talk_id,
    user_id: event.user_id,
    username: event.username,
    nickname: event.nickname,
    message: event.message,
    images: event.images,
    replies: [],
    reply_to_id: event.reply_to_id,
    reported_count: 0,
    is_edited: event.is_edited ?? false,
    deleted_at: false,
    created_at: event.created_at,
    is_admin_author: event.is_admin_author ?? false,
  };
}

function toReply(event: SignalCommentEvent): Reply {
  const mainCommentId = event.main_comment_id as number;
  return {
    created_at: event.created_at,
    deleted_at: false,
    id: event.id,
    images: event.images,
    is_edited: event.is_edited ?? false,
    main_comment_id: mainCommentId,
    message: event.message,
    nickname: event.nickname,
    reply_to_id: event.reply_to_id ?? mainCommentId,
    reported_count: 0,
    signal_talk_id: event.signal_talk_id,
    tag_nickname: event.tag_nickname ?? '',
    user_id: String(event.user_id),
    username: event.username,
    is_admin_author: event.is_admin_author ?? false,
  };
}

// 중복 댓글 관리
function hasComment(data: InfiniteData<CommentResponse>, id: number): boolean {
  return data.pages.some((page) => page.results.some((c) => String(c.id) === String(id)));
}

function hasReply(data: InfiniteData<CommentResponse>, id: number): boolean {
  return data.pages.some((page) =>
    page.results.some((c) => c.replies.some((r) => String(r.id) === String(id))),
  );
}

function patchCommentThread(
  queryClient: QueryClient,
  signalTalkId: number,
  updater: (old: InfiniteData<CommentResponse>) => InfiniteData<CommentResponse>,
) {
  queryClient.setQueriesData<InfiniteData<CommentResponse>>(
    {
      predicate: (query) =>
        query.queryKey[0] === 'comment' && String(query.queryKey[1]) === String(signalTalkId),
    },
    (old) => (old ? updater(old) : old),
  );
}

type Audience = 'paid' | 'free';

interface SocketContextType {
  isConnected: boolean;
  joinAudience: (audience: Audience) => void;
  joinRoom: (signalTalkId: number) => void;
  leaveRoom: (signalTalkId: number) => void;
  sendMessage: (eventName: string, data: unknown, callback?: (response: unknown) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

function disconnectSocket(socket: Socket) {
  socket.offAny();
  socket.removeAllListeners();
  socket.disconnect();
}

// 앱이 켜지는 시점에 1회 연결하고 세션 동안 유지한다. 채널(탭) 전환은 재연결이 아니라
// joinAudience로 같은 소켓 위에서 구독 대상만 바꾼다.
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);

  const audienceRef = useRef<Audience | null>(null);
  // 재연결됐을 때 열려 있던 상세방을 다시 들어가기 위해 보관
  const roomIdRef = useRef<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(PATH.base, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      autoConnect: true,
      auth: {
        token: `Bearer ${ADMIN_DEBUG_TOKEN}`,
        socket_protocol_version: 2,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket 연결 성공:', socket.id);
      setIsConnected(true);
      // 재연결이면 끊기기 전에 보고 있던 방을 다시 들어간다 (나가기는 필요 없음 — 새 연결이라 서버엔 남아있지 않음)
      if (audienceRef.current) {
        socket.emit('join_v2_signal_talk_list', {
          token: ADMIN_DEBUG_TOKEN,
          audience: audienceRef.current,
        });
      }
      if (roomIdRef.current != null) {
        socket.emit('join_room', { token: ADMIN_DEBUG_TOKEN, signal_talk_id: roomIdRef.current });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket 연결 끊김:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket 연결 실패:', error.message);
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('❌ Socket IO 에러:', error);
    });

    // reactions만 바로 덮어써서 전체 리페치 없이 즉시 반영한다
    socket.on('signal_reaction_update', (payload: SignalReactionUpdateEvent) => {
      const { signal_talk_id, reactions } = payload;

      queryClient.setQueriesData<InfiniteData<ChatResponse>>({ queryKey: ['signal'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.map((msg) =>
              String(msg.id) === String(signal_talk_id) ? { ...msg, reactions } : msg,
            ),
          })),
        };
      });
    });

    // 시그널 댓글 수 변경 — 목록(메시지 버블)의 comment_count만 patch한다. 상세 댓글 패널의
    // 실제 내용은 create/update/delete 이벤트가 각각 직접 patch하므로 여기서는 손대지 않는다.
    // NEW 표시도 여기서 같이 켠다 — create_signal_talk_comment는 그 시그널 방(join_room)에
    // 들어가 있어야만(=패널을 연 적 있어야만) 오는데, 이 이벤트는 목록 구독(join_v2_signal_talk_list)
    // 만으로도 항상 오기 때문에 패널을 안 열어본 시그널의 신규 댓글은 이 카운트 증가로만 감지할 수 있다.
    socket.on('update_comment_count', (payload: SignalCommentCountUpdateEvent) => {
      const { signal_talk_id, v2_comment_count } = payload;

      queryClient.setQueriesData<InfiniteData<ChatResponse>>({ queryKey: ['signal'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.map((msg) => {
              if (String(msg.id) !== String(signal_talk_id)) return msg;
              if (v2_comment_count > msg.comment_count) {
                useNewCommentsStore.getState().markSignalNew(signal_talk_id);
              }
              return { ...msg, comment_count: v2_comment_count };
            }),
          })),
        };
      });
    });

    // 댓글 생성 — main_comment_id가 있으면 대댓글(원댓글의 replies에 추가), 없으면 최상위
    // 댓글(마지막으로 불러온 페이지 끝에 추가 + count 증가)로 캐시를 직접 patch한다.
    // 관리자 차단 여부와 무관하게 전부 노출한다 — 관리자는 숨기지 말고 봐야 모더레이션이 가능하다.
    socket.on(
      'create_signal_talk_comment',
      (payload: SignalCommentEvent | SignalCommentEvent[]) => {
        const comment = firstOf(payload);
        if (!comment) return;

        // hasNewComment/isNew 둘 다 캐시가 아니라 별도 스토어에 — refetch나 onAny의 전체
        // invalidate로 목록이 서버 데이터로 통째로 교체돼도(댓글 작성, 무관한 다른 이벤트 등) 안 지워지게 한다
        useNewCommentsStore.getState().markSignalNew(comment.signal_talk_id);
        useNewCommentsStore.getState().markNew(comment.signal_talk_id, comment.id);

        patchCommentThread(queryClient, comment.signal_talk_id, (old) => {
          if (comment.main_comment_id != null) {
            if (hasReply(old, comment.id)) return old;

            let inserted = false;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                results: page.results.map((c) => {
                  if (!inserted && c.id === comment.main_comment_id) {
                    inserted = true;
                    return { ...c, replies: [...c.replies, toReply(comment)] };
                  }
                  return c;
                }),
              })),
            };
          }

          if (hasComment(old, comment.id)) return old;

          const pages = old.pages;
          return {
            ...old,
            pages: pages.map((page, i) => ({
              ...page,
              count: page.count + 1,
              results:
                i === pages.length - 1 ? [...page.results, toComment(comment)] : page.results,
            })),
          };
        });
      },
    );

    // 댓글/대댓글 수정 — id로 찾아 message/images/is_edited만 덮어쓴다 (정렬 위치는 그대로)
    socket.on(
      'update_signal_talk_comment',
      (payload: SignalCommentEvent | SignalCommentEvent[]) => {
        const comment = firstOf(payload);
        if (!comment) return;

        patchCommentThread(queryClient, comment.signal_talk_id, (old) => ({
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.map((c) => {
              if (comment.main_comment_id == null) {
                return c.id === comment.id
                  ? {
                      ...c,
                      message: comment.message,
                      images: comment.images,
                      is_edited: comment.is_edited ?? c.is_edited,
                    }
                  : c;
              }
              if (c.id !== comment.main_comment_id) return c;
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === comment.id
                    ? {
                        ...r,
                        message: comment.message,
                        images: comment.images,
                        is_edited: comment.is_edited ?? r.is_edited,
                      }
                    : r,
                ),
              };
            }),
          })),
        }));
      },
    );

    // 댓글/대댓글 삭제 — 목록에서 지우지 않고 deleted_at만 세운다. 관리자 화면은 삭제된 댓글도
    // "삭제됨" 표시로 계속 보여주는 모더레이션 UI라서, 실제로 지워버리는 대신 상태만 바꾼다.
    socket.on(
      'delete_signal_talk_comment',
      (payload: SignalCommentEvent | SignalCommentEvent[]) => {
        const comment = firstOf(payload);
        if (!comment) return;

        patchCommentThread(queryClient, comment.signal_talk_id, (old) => ({
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.map((c) => {
              if (comment.main_comment_id == null) {
                return c.id === comment.id
                  ? { ...c, deleted_at: true, message: comment.message }
                  : c;
              }
              if (c.id !== comment.main_comment_id) return c;
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === comment.id ? { ...r, deleted_at: true, message: comment.message } : r,
                ),
              };
            }),
          })),
        }));
      },
    );

    // TODO: 실제 이벤트명이 정해지면 이벤트별로 분기해서 필요한 쿼리만 무효화하도록 변경
    socket.onAny((eventName, ...args) => {
      console.log('📨 Socket 이벤트 수신:', { eventName, data: args });
      if (SPECIFICALLY_HANDLED_EVENTS.has(eventName)) return;
      queryClient.invalidateQueries({ queryKey: ['signal'] });
      queryClient.invalidateQueries({ queryKey: ['comment'] });
    });

    return () => {
      disconnectSocket(socket);
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [queryClient]);

  // 탭 전환: 이전 audience 방을 나가고 새 audience 방에 들어간다
  const joinAudience = (audience: Audience) => {
    const socket = socketRef.current;
    const prevAudience = audienceRef.current;
    audienceRef.current = audience;

    if (!socket?.connected || prevAudience === audience) return;

    if (prevAudience) {
      socket.emit('leave_v2_signal_talk_list', {
        token: ADMIN_DEBUG_TOKEN,
        audience: prevAudience,
      });
    }
    socket.emit('join_v2_signal_talk_list', { token: ADMIN_DEBUG_TOKEN, audience });
  };

  // 댓글 상세방 입장 — 목록방은 건드리지 않는다
  const joinRoom = (signalTalkId: number) => {
    roomIdRef.current = signalTalkId;
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', {
        token: ADMIN_DEBUG_TOKEN,
        signal_talk_id: signalTalkId,
      });
    }
  };

  // 댓글 상세방 퇴장 — 목록방은 건드리지 않는다
  const leaveRoom = (signalTalkId: number) => {
    if (roomIdRef.current === signalTalkId) roomIdRef.current = null;
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_room', {
        token: ADMIN_DEBUG_TOKEN,
        signal_talk_id: signalTalkId,
      });
    }
  };

  const sendMessage = (
    eventName: string,
    data: unknown,
    callback?: (response: unknown) => void,
  ) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket이 연결되지 않았습니다.');
      return;
    }

    if (callback) socketRef.current.emit(eventName, data, callback);
    else socketRef.current.emit(eventName, data);
  };

  return (
    <SocketContext.Provider value={{ isConnected, joinAudience, joinRoom, leaveRoom, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket은 SocketProvider 내부에서만 사용할 수 있습니다.');
  return context;
};
