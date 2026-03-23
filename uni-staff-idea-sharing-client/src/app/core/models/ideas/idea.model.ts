import { CategoryModel } from "../category.model";
import { StaffModel } from "../staff.model";
import { CommentModel } from "./comment.model";
import { VoteModel } from "./vote.model";
import { DocumentModel } from "./document.model";
import { ClosureSettingModel } from "../closureSetting.model";

export interface IdeaModel {
  ideaID: number;
  title: string;
  description: string;
  isAnonymous: boolean | number;
  staffID: number;
  settingID: number;
  status: string;
  viewCount: number;        
  isFlagged?: boolean | number;       
  isCommentEnabled?: boolean | number; 
  created_at?: string;
  updated_at?: string;
  
  staff?: StaffModel;
  categories?: CategoryModel[];
  comments?: CommentModel[];
  votes?: VoteModel[];
  documents?: DocumentModel[];        
  closureSetting?: ClosureSettingModel[];      
}