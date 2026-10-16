import type { SignalChannel } from '@/pages/signal-chat/types';

export const CHAT_CONSTANTS = {
  MAX_IMAGES: 5,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

export const DEFAULT_CHANNEL: SignalChannel = 'premium';

// Tailwind 클래스는 정적 문자열이어야 빌드에 포함되므로 채널별로 전체 클래스를 정의
export const SIGNAL_CHANNELS: Record<
  SignalChannel,
  {
    label: string;
    shortLabel: string;
    description: string;
    tabActiveClass: string;
    badgeClass: string;
    inputRingClass: string;
    sendButtonClass: string;
  }
> = {
  premium: {
    label: '프리미엄 시그널',
    shortLabel: '프리미엄',
    description: '프리미엄 구독자에게만 전달되는 채널입니다.',
    tabActiveClass: 'border-amber-600 bg-amber-50 text-amber-700!',
    badgeClass: 'bg-amber-600 text-white',
    inputRingClass: 'border-amber-600 focus-within:ring-amber-600',
    sendButtonClass: 'bg-amber-600 hover:bg-amber-700',
  },
  free: {
    label: '무료 시그널',
    shortLabel: '무료',
    description: '무료 회원 전용 채널입니다.',
    tabActiveClass: 'border-sky-600 bg-sky-50 text-sky-700!',
    badgeClass: 'bg-sky-600 text-white',
    inputRingClass: 'border-sky-600 focus-within:ring-sky-600',
    sendButtonClass: 'bg-sky-600 hover:bg-sky-700',
  },
};

export const isSignalChannel = (value?: string): value is SignalChannel =>
  !!value && value in SIGNAL_CHANNELS;
