export interface Article {
  objectID: string;
  title: string;
  author: string;
  created_at: string;
  url: string;
  story_title?: string;
  story_url?: string;
}

export interface HNResponse {
  hits: Article[];
  page: number;
  nbPages: number;
  hitsPerPage: number;
  nbHits: number;
}
