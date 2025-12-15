export interface ChatMessage {
  id: string;
  message: string;
  message_with_html: string;
  created_at: string;
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
