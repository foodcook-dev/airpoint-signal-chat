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
    tabActiveClass: 'border-[#FF7700] bg-[#FF7700]/8 text-[#B35400]!',
    badgeClass: 'bg-[#FF7700] text-white',
    inputRingClass: 'border-[#FF7700] focus-within:ring-[#FF7700]',
    sendButtonClass: 'bg-[#FF7700] hover:bg-[#E66A00]',
  },
  free: {
    label: '무료 시그널',
    shortLabel: '무료',
    description: '무료 회원 전용 채널입니다.',
    tabActiveClass: 'border-[#0077FF] bg-[#0077FF]/8 text-[#0053B2]!',
    badgeClass: 'bg-[#0077FF] text-white',
    inputRingClass: 'border-[#0077FF] focus-within:ring-[#0077FF]',
    sendButtonClass: 'bg-[#0077FF] hover:bg-[#0062D6]',
  },
};

export const isSignalChannel = (value?: string): value is SignalChannel =>
  !!value && value in SIGNAL_CHANNELS;
