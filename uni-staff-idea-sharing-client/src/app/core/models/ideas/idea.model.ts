import { CategoryModel } from "../category.model";
import { StaffModel } from "../staff.model";
import { CommentModel } from "./comment.model";
import { VoteModel } from "./vote.model";

export interface IdeaModel {
  ideaID: number;
  title: string;
  description: string;
  isAnonymous: boolean | number;
  staffID: number;
  settingID: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  
  staff?: StaffModel;
  categories?: CategoryModel[];
  comments?: CommentModel[];
  votes?: VoteModel[];
  
  likesCount?: number;
  unlikesCount?: number;
  commentsCount?: number;
  viewsCount?: number; // Note: Add this to your backend if you want real view tracking
}