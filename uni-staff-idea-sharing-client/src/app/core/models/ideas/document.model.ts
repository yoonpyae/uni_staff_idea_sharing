export interface DocumentModel {
  documentID: number;
  docPath: string;
  fileType: string;
  fileSize: number;
  isHidden: boolean | number;
  ideaID: number;
  created_at?: string;
  updated_at?: string;
}