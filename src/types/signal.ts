export interface ActiveUserCount {
  connected_count: number;
  free_connected_count: number;
  paid_connected_count: number;
}

export interface ChatMessage {
  id: string;
  comment_count: number;
  message: string;
  message_with_html: string;
  created_at: string;
  is_notice: boolean;
  og_tags: Array<{
    og_image: string;
    og_title: string;
    og_description: string;
    og_tag_link: string;
  }>;
  content_images: string[];
  poll: null | {
    id: number;
    title: string;
    content: string;
    is_multiple: boolean;
    end_date: string;
    options: Array<{
      id: number;
      text: string;
      order: number;
      vote_count: number;
      user_voted: boolean;
    }>;
  };
  poll_notification: null | {
    id: number;
    type: 'closed';
    summaries: Array<{
      option_text: string;
      vote_count: number;
      order: number;
    }>;
  };
  reactions: {
    like: number;
    good: number;
    check: number;
    is_liked?: boolean;
    is_good?: boolean;
    is_checked?: boolean;
  };
}

// 소켓 'signal_reaction_update' 이벤트 페이로드 — 리액션이 추가/삭제될 때마다 하나씩 온다
export interface SignalReactionUpdateEvent {
  signal_talk_id: number;
  user_id: number;
  username: string;
  type: 'like' | 'good' | 'check';
  action: 'added' | 'removed';
  reactions: ChatMessage['reactions'];
}

// 소켓 'update_comment_count' 이벤트 페이로드 — 해당 시그널의 댓글이 생성/삭제될 때마다 하나씩 온다
export interface SignalCommentCountUpdateEvent {
  signal_talk_id: number;
  comment_count: number;
}

// 소켓 'create_signal_talk_comment' / 'update_signal_talk_comment' / 'delete_signal_talk_comment'
// 페이로드 — 생성/수정/삭제된 댓글(또는 대댓글, main_comment_id가 있으면 대댓글) 하나를 그대로 내려준다.
// 새로 불러오지 않고 이 페이로드만으로 ['comment', signal_talk_id] 캐시를 직접 patch한다.
export interface SignalCommentEvent {
  id: number;
  signal_talk_id: number;
  user_id: number;
  username: string;
  nickname: string;
  message: string;
  images: string[];
  created_at: string;
  main_comment_id: number | null;
  reply_to_id: number | null;
  tag_nickname: string | null;
  is_edited?: boolean;
  admin_blocked?: boolean;
}

export interface Comment {
  id: number;
  signal_talk_id: number;
  user_id: number;
  username: string;
  nickname: string;
  message: string;
  images: string[];
  replies: Reply[];
  reply_to_id: null | number;
  reported_count: number;
  is_edited: boolean;
  deleted_at: boolean;
  created_at: string;
}

export type Reply = {
  created_at: string;
  deleted_at: boolean;
  id: number;
  images: string[];
  is_edited: boolean;
  main_comment_id: number;
  message: string;
  nickname: string;
  reply_to_id: number;
  reported_count: number;
  signal_talk_id: number;
  tag_nickname: string;
  user_id: string;
  username: string;
};

export interface SelectedImage {
  url: string;
  name: string;
}

export interface ChatResponse {
  results: ChatMessage[];
  next?: string;
}

export interface ChatFormData {
  message?: string;
  is_special?: string;
  images?: File[];
}

export interface CommentResponse {
  count: number;
  next: string;
  results: Comment[];
}

export type SignalChannel = 'premium' | 'free';
