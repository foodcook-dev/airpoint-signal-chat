import { create } from 'zustand';

// 소켓으로 들어온 신규 댓글/대댓글 id, 그리고 신규 댓글이 달린 시그널 id를 들고 있는
// 클라이언트 전용 스토어. React Query 캐시(쿼리별 데이터)와 분리해 둔 이유 — 댓글/시그널
// 목록은 관리자의 다른 조작(댓글 작성 후 refetch)이나 onAny의 전체 invalidate(`['signal']`
// 쿼리 포함) 때문에 수시로 새 데이터로 통째로 교체되는데, 그때마다 캐시에 박아둔 플래그가
// 같이 지워지면 안 되기 때문이다.
interface NewCommentsState {
  newIdsBySignal: Record<string, Set<number>>;
  newSignalIds: Set<string>;
  markNew: (signalTalkId: number | string, id: number) => void;
  clearSignal: (signalTalkId: number | string) => void;
  markSignalNew: (signalTalkId: number | string) => void;
  clearSignalNew: (signalTalkId: number | string) => void;
}

const useNewCommentsStore = create<NewCommentsState>((set) => ({
  newIdsBySignal: {},
  newSignalIds: new Set(),
  // 댓글/대댓글 개별 NEW — 패널을 닫거나(혹은 다른 시그널로 전환) clearSignal로 그 시그널 몫만 지운다
  markNew: (signalTalkId, id) =>
    set((state) => {
      const key = String(signalTalkId);
      const prev = state.newIdsBySignal[key];
      if (prev?.has(id)) return state;
      const next = new Set(prev);
      next.add(id);
      return { newIdsBySignal: { ...state.newIdsBySignal, [key]: next } };
    }),
  clearSignal: (signalTalkId) =>
    set((state) => {
      const key = String(signalTalkId);
      if (!state.newIdsBySignal[key]) return state;
      const rest = { ...state.newIdsBySignal };
      delete rest[key];
      return { newIdsBySignal: rest };
    }),
  // 시그널 목록 카드의 NEW — 그 시그널의 댓글 패널을 열면 clearSignalNew로 끈다
  markSignalNew: (signalTalkId) =>
    set((state) => {
      const key = String(signalTalkId);
      if (state.newSignalIds.has(key)) return state;
      const next = new Set(state.newSignalIds);
      next.add(key);
      return { newSignalIds: next };
    }),
  clearSignalNew: (signalTalkId) =>
    set((state) => {
      const key = String(signalTalkId);
      if (!state.newSignalIds.has(key)) return state;
      const next = new Set(state.newSignalIds);
      next.delete(key);
      return { newSignalIds: next };
    }),
}));

export default useNewCommentsStore;
