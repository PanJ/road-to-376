import { useCallback } from "react";
import { MemberType, Vote } from "../types";

export type VoteProps = {
  vote: Vote;
  onClickVote: (v: Vote) => void;
  isActive: boolean;
};

export function VoteItem({ vote, onClickVote, isActive }: VoteProps) {
  const onClick = useCallback(() => {
    onClickVote(vote);
  }, [onClickVote, vote]);
  let text = `<p>${vote.name}</p>`;
  if (vote.memberType == MemberType.Senate) {
    text += `<p>สมาชิกวุฒิสภา</p>`;
  } else {
    text += `<p>ว่าที่สมาชิกผู้แทนราษฎร</p>`;
  }
  if (vote.partyName) {
    text += `<p>${vote.partyName}</p>`;
  }
  return (
    <div
      onClick={onClick}
      className={`vote-item cursor-pointer ${isActive ? "active" : ""}`}
      data-tooltip-id="vote-tooltip"
      data-tooltip-html={text}
    >
      <div
        className="rounded-full"
        style={{
          backgroundColor: vote.color,
        }}
      >
        <img
          className="w-[100%] aspect-square object-contain rounded-full object-top border border-white"
          src={`/images/${vote.id}.png`}
          alt={`${vote.name} (${vote.partyName})`}
        />
      </div>
    </div>
  );
}
