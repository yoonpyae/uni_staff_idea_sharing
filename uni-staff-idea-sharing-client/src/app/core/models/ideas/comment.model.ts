import { StaffModel } from "../staff.model";

export interface CommentModel {
  commentID: number;
  comment: string;
  isAnonymous: boolean | number;
  status: string;
  ideaID: number;
  staffID: number;
  created_at?: string;
  updated_at?: string;
  
  staff?: StaffModel;
}