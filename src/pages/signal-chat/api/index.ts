import API from '@/libs/client';
import type { ChatMessage, ChatResponse, CommentResponse } from '@/pages/signal-chat/types';

// 시그널 톡 목록 (관리자) GET
export async function getSignalTalksAdmin({
  audience,
  page,
  pageSize = 10,
}: {
  audience: 'paid' | 'free';
  page: number;
  pageSize?: number;
}): Promise<ChatResponse> {
  const { data } = await API.get<ChatResponse>('/talk/signal_talks/admin/', {
    params: { audience, page, page_size: pageSize },
  });
  return data;
}

// 시그널 톡 생성 (관리자 발송)
export async function postSignalTalk(formData: FormData): Promise<ChatMessage> {
  const { data } = await API.post<ChatMessage>('/talk/signal_talks/create/', formData);
  return data;
}

// 채널별 현재 접속자 수
export async function getActiveUserCount(): Promise<{ connected_count: number }> {
  const { data } = await API.get<{ connected_count: number }>(
    '/talk/signal_talks/active_user_count/',
  );
  return data;
}

// 시그널 톡 댓글 목록 (관리자) GET
export async function getCommentsAdmin({
  signalTalkId,
  page,
  pageSize = 10,
}: {
  signalTalkId: string | number | undefined;
  page: number;
  pageSize?: number;
}): Promise<CommentResponse> {
  const { data } = await API.get<CommentResponse>(
    `/talk/signal_talks/${signalTalkId}/comments/admin/`,
    { params: { page, page_size: pageSize } },
  );
  return data;
}

// 댓글 비활성화
export async function postDeactivateComment(commentId: number): Promise<unknown> {
  const { data } = await API.post(`/talk/signal_talks/comments/${commentId}/deactivate/`);
  return data;
}

// 사용자 댓글 작성 제한
export async function postCommentBanUser({
  userId,
  reason,
  blockedUntil,
  memo,
}: {
  userId: number;
  reason: string;
  blockedUntil: string;
  memo: string;
}): Promise<unknown> {
  const { data } = await API.post('/user/comment-ban-admin/', {
    user_id: userId,
    reason,
    blocked_until: blockedUntil,
    memo,
  });
  return data;
}
