export interface ChatMessage {
  id: string;
  message: string;
  message_with_html?: string;
  created_at: string;
  og_tags?: Array<{
    og_image?: string;
    og_title: string;
    og_description: string;
    og_tag_link: string;
  }>;
  content_images?: string[];
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
