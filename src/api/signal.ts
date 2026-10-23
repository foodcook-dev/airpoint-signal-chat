import API from '@/libs/client';
import type {
  ActiveUserCount,
  ChatMessage,
  ChatResponse,
  CommentResponse,
  SelectedImage,
  SignalPollDetail,
} from '@/types/signal';

// 채널별 현재 접속자 수 GET
export async function getActiveUserCount(): Promise<ActiveUserCount> {
  const { data } = await API.get('/talk/signal_talks/active_user_count/');

  return data;
}

// 시그널 톡 목록 GET
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

// 시그널 톡 생성 POST
export async function postSignalTalk(formData: FormData): Promise<ChatMessage> {
  const { data } = await API.post<ChatMessage>('/talk/signal_talks/create/', formData);
  return data;
}

// 시그널 톡 댓글 목록 (관리자) GET
export async function getCommentsAdmin({
  signalTalkId,
  page,
  pageSize = 30,
}: {
  signalTalkId: string | number | undefined;
  page: number;
  pageSize?: number;
}): Promise<CommentResponse> {
  const { data } = await API.get<CommentResponse>(
    `/talk/signal_talks/${signalTalkId}/comments/admin/`,
    { params: { page, page_size: pageSize, sort: 'asc' } },
  );
  return data;
}

// 시그널 톡 댓글, 대댓글 생성 POST
export async function postComment({
  signalTalkId,
  content,
  image,
  mainCommentId,
  replyToId,
}: {
  signalTalkId: number | string;
  content: string;
  image?: SelectedImage;
  mainCommentId?: number | string;
  replyToId?: number | string;
}): Promise<unknown> {
  const formData = new FormData();
  if (mainCommentId != null) formData.append('main_comment_id', String(mainCommentId));
  if (replyToId != null) formData.append('reply_to_id', String(replyToId));
  formData.append('message', content);

  if (image) {
    const blob = await (await fetch(image.url)).blob();
    formData.append('images', new File([blob], image.name, { type: blob.type }));
  }

  const { data } = await API.post(`/v2/signal_talks/${signalTalkId}/comments/admin/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// 시그널 톡 댓글 수정 PATCH
export async function patchComment({
  commentId,
  content,
  image,
  removeImage,
}: {
  commentId: number | string;
  content: string;
  image?: SelectedImage;
  removeImage?: boolean;
}): Promise<unknown> {
  const shouldTouchImage = !!image || !!removeImage;
  const formData = new FormData();
  formData.append('message', content);
  formData.append('remove_images', shouldTouchImage ? 'true' : 'false');

  if (image) {
    const blob = await (await fetch(image.url)).blob();
    formData.append('images', new File([blob], image.name, { type: blob.type }));
  } else {
    formData.append('images', '');
  }

  const { data } = await API.patch(
    `/v2/signal_talks/comments/${commentId}/admin/update/`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return data;
}

// 댓글 삭제
export async function deleteComment({
  signalTalkId,
  commentId,
}: {
  signalTalkId: number;
  commentId: number;
}): Promise<void> {
  const { data } = await API.post(`/v2/signal_talks/comments/admin/delete-self/`, {
    signal_talk_id: signalTalkId,
    comment_id: commentId,
  });
  return data;
}

// 댓글 비활성화 POST
export async function postDeactivateComment(commentId: number): Promise<unknown> {
  const { data } = await API.post(`/talk/signal_talks/comments/${commentId}/deactivate/`);
  return data;
}

// 댓글 작성 제한 POST
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

// 시그널톡 삭제
export async function deleteSignalTalk(signalTalkId: number): Promise<void> {
  const { data } = await API.delete(`/v2/signal_talks/${signalTalkId}/admin/delete/`);
  return data;
}

// 투자노트 게시 POST
export async function postInvestmentNote({
  title,
  signalTalkId,
}: {
  title: string;
  signalTalkId: number | string;
}): Promise<unknown> {
  const { data } = await API.post('/v2/board/investment-notes/admin/', {
    category: 3,
    title,
    signal_talk_id: signalTalkId,
  });
  return data;
}

// 투표 상세 — 상세 패널에서 투표 진행률을 보여줄 때 사용 (시그널 리스트에는 노출하지 않음)
export async function getSignalPollDetail({
  pollId,
}: {
  pollId: string | number;
}): Promise<SignalPollDetail> {
  const { data } = await API.get<SignalPollDetail>(`/v2/signal_talk_polls/${pollId}/admin/`);
  return data;
}
