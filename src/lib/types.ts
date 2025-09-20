export type SearchResultItem = {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  pagemap?: {
    cse_thumbnail?: { src: string }[];
    metatags?: { [key: string]: string }[];
  };
};

export type ImageSearchResultItem = {
  title: string;
  link: string;
  displayLink: string;
  image: {
    contextLink: string;
    thumbnailLink: string;
    width: number;
    height: number;
  };
};

export type VideoSearchResultItem = SearchResultItem & {
  videoUrl?: string;
  coverImageUrl?: string;
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

export type SearchType = "all" | "images" | "videos" | "news";

export type AppSettings = {
  theme: "light" | "dark";
  safeSearch: boolean;
  inAppWebView: boolean;
  saveHistory: boolean;
  filterInAppFriendly: boolean;
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
