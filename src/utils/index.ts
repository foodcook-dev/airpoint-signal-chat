import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 예) 2026년 10월 16일 오후 01:30
export const formatSignalDate = (date: string | number | Date): string =>
  format(date, 'MM월 dd일 a h:mm', { locale: ko });

// 댓글 작성 시간 전용 — 1분 미만 "방금 전", 1시간 미만 "N분 전", 24시간 미만 "N시간 전",
// 7일 미만 "N일 전", 그 이후는 "yyyy.MM.dd"
export function formatCommentTime(isoString: string) {
  const diffSeconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);

  if (diffSeconds < 60) return '방금 전';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateImageFile = (file: File): string | null => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return '지원되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 지원)';
  }

  if (file.size > maxSize) {
    return `파일 크기가 ${formatFileSize(maxSize)}를 초과합니다.`;
  }

  return null;
};
