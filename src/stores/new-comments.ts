import { create } from 'zustand';

interface NewCommentsState {
  newIdsBySignal: Record<string, Set<number>>;
  readCommentCountBySignal: Record<string, number>;
  locallyReadAtBySignal: Record<string, number>;
  markNew: (signalTalkId: number | string, id: number) => void;
  clearSignal: (signalTalkId: number | string) => void;
  markReadAtCount: (signalTalkId: number | string, count: number) => void;
  markLocallyReadNow: (signalTalkId: number | string) => void;
}

const useNewCommentsStore = create<NewCommentsState>((set) => ({
  newIdsBySignal: {},
  readCommentCountBySignal: {},
  locallyReadAtBySignal: {},
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
  markReadAtCount: (signalTalkId, count) =>
    set((state) => {
      const key = String(signalTalkId);
      const prevCount = state.readCommentCountBySignal[key] ?? 0;
      if (count <= prevCount) return state;
      return {
        readCommentCountBySignal: { ...state.readCommentCountBySignal, [key]: count },
      };
    }),
  markLocallyReadNow: (signalTalkId) =>
    set((state) => ({
      locallyReadAtBySignal: { ...state.locallyReadAtBySignal, [String(signalTalkId)]: Date.now() },
    })),
}));

export default useNewCommentsStore;
