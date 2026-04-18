import { StaffModel } from "../staff.model";
import { CommentModel } from "./comment.model";
import { IdeaModel } from "./idea.model";

export interface ReportModel {
    report_id?: number;
    report_type: 'idea' | 'comment';
    reason: string;
    status?: 'pending' | 'resolved' | 'dismissed';
    ideaID?: number | null;
    commentID?: number | null;
    reporter_id: number;
    resolved_by?: number | null;

    created_at?: string;
    updated_at?: string;

    reporter?: StaffModel;
    resolver?: StaffModel;
    idea?: IdeaModel;
    comment?: CommentModel;
}