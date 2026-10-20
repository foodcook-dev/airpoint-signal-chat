import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { PATH } from '@/constants/api-path';
import { ADMIN_DEBUG_TOKEN } from '@/libs/client';

type Audience = 'paid' | 'free';

interface SocketContextType {
  isConnected: boolean;
  // 관리자가 보고 있는 탭(프리미엄/무료)이 바뀔 때 호출 — 연결은 유지한 채 구독 대상만 전환한다
  joinAudience: (audience: Audience) => void;
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

    // TODO: 실제 이벤트명이 정해지면 이벤트별로 분기해서 필요한 쿼리만 무효화하도록 변경
    socket.onAny((eventName, ...args) => {
      console.log('📨 Socket 이벤트 수신:', { eventName, data: args });
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
    <SocketContext.Provider value={{ isConnected, joinAudience, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket은 SocketProvider 내부에서만 사용할 수 있습니다.');
  return context;
};
