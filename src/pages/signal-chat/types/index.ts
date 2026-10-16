export interface ChatMessage {
  id: string;
  comment_count: number;
  message: string;
  message_with_html: string;
  created_at: string;
  is_notice: boolean;
  // TODO: 백엔드 필드 확정 전까지 optional — 투자노트로 픽된 시그널인지 여부
  is_investment_note?: boolean;
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
  };
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
