export type Paper = {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  abstract?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};
