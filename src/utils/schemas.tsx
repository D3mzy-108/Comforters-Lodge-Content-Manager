export type DailyPost = {
  id: number;
  series_title: string;
  personal_question: string;
  theme: string;
  opening_hook: string;
  biblical_qa: string;
  reflection: string;
  story: string;
  prayer: string;
  activity_guide: string;
  date_posted: string;
};

export type DailyDevotion = {
  id: number;
  //   cover_image_url: string;
  citation: string;
  verse_content: string;
  date_posted: string; // ISO date
};

export type Hymn = {
  id: number;
  hymn_number: number;
  hymn_title: string;
  classification: string;
  tune_ref: string;
  cross_ref: string;
  scripture: string;
  chorus_title: string;
  chorus: string;
  verses: string[];
};

export type PagePaginator = {
  page: number;
  ttl_pages: number | undefined | null;
  progress: string | undefined | null;
};

export type DashboardDisplayMode = "posts" | "devotions" | "hymns";
export type UploadMode = "single" | "tsv";
