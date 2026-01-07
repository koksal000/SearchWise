export type ScrapedResult = {
  title: string;
  link: string;
  snippet: string;
  imageUrl?: string;
  duration?: string;
};

export type VideoObject = {
  name?: string;
  description?: string;
  thumbnailurl?: string;
  contenturl?: string;
  embedurl?: string;
  uploaddate?: string;
  duration?: string; // ISO 8601 format
};

export type SearchResultItem = {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  pagemap?: {
    cse_thumbnail?: { src: string }[];
    metatags?: { [key: string]: string }[];
    videoobject?: VideoObject[];
  };
};

export type ImageSearchResultItemImage = {
  contextLink: string;
  thumbnailLink: string;
  width: number;
  height: number;
};

export type ImageSearchResultItem = {
  title: string;
  link: string;
  displayLink: string;
  image: ImageSearchResultItemImage;
};

export type VideoSearchResultItem = SearchResultItem & {
  videoUrl?: string;
  embedUrl?: string;
  coverImageUrl?: string;
  duration?: string;
  uploadDate?: string;
}

export type SearchResults = {
  searchInformation: {
    formattedTotalResults: string;
    formattedSearchTime: string;
  };
  items: SearchResultItem[];
};

export type ImageSearchResults = {
  searchInformation: {
    formattedTotalResults: string;
    formattedSearchTime: string;
  };
  items: ImageSearchResultItem[];
};

export enum SearchType {
    ALL = "all",
    IMAGES = "images",
    VIDEOS = "videos",
    NEWS = "news",
    GIF = "gif",
}

export type AppSettings = {
  theme: "light" | "dark";
  safeSearch: boolean;
  inAppWebView: boolean;
  saveHistory: boolean;
};

export type HistoryItem = {
  id: number;
  query: string;
  timestamp: number;
};

export type TabItem = {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  screenshot?: string; // a data URL
};

export type MediaViewerItem = {
    type: 'image' | 'video';
    title: string;
    sourceUrl: string;
    mediaUrl?: string;
    embedUrl?: string;
}
