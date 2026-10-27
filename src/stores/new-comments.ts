import { create } from 'zustand';

interface NewCommentsState {
  newIdsBySignal: Record<string, Set<number>>;
  newSignalIds: Set<string>;
  locallyReadAtBySignal: Record<string, number>;
  markNew: (signalTalkId: number | string, id: number) => void;
  clearSignal: (signalTalkId: number | string) => void;
  markSignalNew: (signalTalkId: number | string) => void;
  clearSignalNew: (signalTalkId: number | string) => void;
  markLocallyReadNow: (signalTalkId: number | string) => void;
}

const useNewCommentsStore = create<NewCommentsState>((set) => ({
  newIdsBySignal: {},
  newSignalIds: new Set(),
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
  markLocallyReadNow: (signalTalkId) =>
    set((state) => ({
      locallyReadAtBySignal: { ...state.locallyReadAtBySignal, [String(signalTalkId)]: Date.now() },
    })),
}));

export default useNewCommentsStore;
