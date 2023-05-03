import { IAttachmentFileInfo, IAttachmentInfo } from "@pnp/sp/attachments";

export interface SoftwareItem {
  Id?: number;
  title: string;
  description: string;
  status: ToolStatus;
  pocs: PointOfContact[];
  viewCount: number;
  maturity?: string;
  guide?: any;
  teamChannelLink?: any;
  averageRatings?: number;
  ratingCount?: number;
  reviews?: ToolReview[];
  reviewCount?: number;
  downloadLink?: string;
  links: any[];
  Attachments?: IAttachmentInfo[];
  Tags?: string[];
  fileInfos?: IAttachmentFileInfo[];
  canUserEdit?: boolean;
}

export enum ToolStatus {
  Draft = "Draft",
  Pending = "Pending",
  Submitted = "Submitted",
  Approved = "Approved",
  Declined = "Declined",
}

export interface PointOfContact {
  name: string;
  email: string;
  bio: string;
  id: number;
}

export interface ToolReview {
  timestamp: string;
  comment: string;
  reviewer: string;
}

export interface ToolQuestion {
  id: number;
  title: string;
  altTitle: string;
  caption?: string;
  answerType: AnswerType;
  displayOrder: number;
  fieldName: string;
  isRequired: boolean;
  errorMessage: string;
}

export interface ToolAnswer {
  id: number;
  answerJson: any;
  Attachments?: IAttachmentInfo[];
  fileInfos?: IAttachmentFileInfo[];
  status: ToolStatus;
  createdOn?: Date;
  submittedOn?: Date;
  submittedBy?: string;
}

export enum AnswerType {
  YesNo = "YesNo",
  YesNoConditional = "YesNoConditional",
  ShortText = "ShortText",
  LongText = "LongText",
  Person = "Person",
  Link = "Link",
  ScreenShot = "ScreenShot",
  Attachment = "Attachment",
  Tags = "Tags",
  NoAnswer = "NoAnswer",
}

export interface ToolVideo {
  id: number;
  title: string;
  streamId: string;
  toolId: number;
}
