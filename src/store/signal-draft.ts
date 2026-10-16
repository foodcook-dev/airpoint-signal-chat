import { create } from 'zustand';
import type { SelectedImage, SignalChannel } from '@/pages/signal-chat/types';

// 탭을 전환해도 채널별 작성 중인 내용이 섞이지 않도록 채널 단위로 보관
export interface SignalDraft {
  inputValue: string;
  selectedImages: SelectedImage[];
  isAutoReactionEnabled: boolean;
  maxAutoReactions: number;
}

const createEmptyDraft = (): SignalDraft => ({
  inputValue: '',
  selectedImages: [],
  isAutoReactionEnabled: true,
  maxAutoReactions: 50,
});

interface SignalDraftState {
  drafts: Record<SignalChannel, SignalDraft>;
  updateDraft: (
    channel: SignalChannel,
    updater: Partial<SignalDraft> | ((prev: SignalDraft) => Partial<SignalDraft>),
  ) => void;
  resetDraft: (channel: SignalChannel) => void;
}

const useSignalDraftStore = create<SignalDraftState>((set) => ({
  drafts: { premium: createEmptyDraft(), free: createEmptyDraft() },
  updateDraft: (channel, updater) =>
    set((state) => {
      const prev = state.drafts[channel];
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return { drafts: { ...state.drafts, [channel]: { ...prev, ...next } } };
    }),
  resetDraft: (channel) =>
    set((state) => ({
      drafts: {
        ...state.drafts,
        [channel]: { ...createEmptyDraft(), ...pickReactionSettings(state.drafts[channel]) },
      },
    })),
}));

// 발송 후에도 자동 리액션 설정은 유지
const pickReactionSettings = ({ isAutoReactionEnabled, maxAutoReactions }: SignalDraft) => ({
  isAutoReactionEnabled,
  maxAutoReactions,
});

export default useSignalDraftStore;
