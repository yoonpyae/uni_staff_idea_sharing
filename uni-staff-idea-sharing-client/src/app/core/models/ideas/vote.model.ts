export interface VoteModel {
  voteID: number;
  voteType: 'Like' | 'Unlike';
  staffID: number;
  ideaID: number;
  created_at?: string;
  updated_at?: string;
}