export type DailyPost = {
  id: number;
  opening_hook: string;
  personal_question: string;
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
