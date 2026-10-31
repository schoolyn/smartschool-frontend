export type NoticeAudienceScope = "SCHOOL" | "ROLE" | "CLASS" | "SECTION";

export interface INoticeAudience {
  scope: NoticeAudienceScope;
  roles: string[];
  classIds: string[];
  sectionIds: string[];
}

export interface INotice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
  attachmentURL: string;
  audience?: INoticeAudience;
  pinned?: boolean;
  isRead?: boolean;
}

export interface ICreateNoticeRequest {
  title: string;
  content: string;
  type: string;
  date?: string;
  attachment?: File | null;
  audience?: INoticeAudience;
}
