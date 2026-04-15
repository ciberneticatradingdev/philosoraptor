export interface Thought {
  id: number;
  cycle_number: number;
  content: string;
  meme_phrase: string;
  meme_image_path: string;
  created_at: string;
}

export interface PaginatedThoughts {
  thoughts: Thought[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GenerateResponse {
  success: boolean;
  thought?: Thought;
  error?: string;
}
