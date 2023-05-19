export type Vote = {
  id: string;
  name: string;
  memberType: MemberType;
  partyName?: string;
  color?: string;
  voteType: VoteType;
  reference: string;
  bio: string;
};

export enum MemberType {
  Senate = "SV",
  Rep = "SS",
}

export enum VoteType {
  No = -2,
  LikelyNo = -1,
  Unknown = 0,
  LikelyYes = 1,
  Yes = 2,
}
