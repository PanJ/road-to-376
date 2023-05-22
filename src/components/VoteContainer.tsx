import { Vote, MemberType } from "../types";
import { VoteItem } from "./VoteItem";

export type VoteContainerProps = {
  votes: Vote[];
  title: string;
  backgroundStyle: string;
  showOptions: "all" | MemberType.Senate | MemberType.Rep;
  desktopColumns: number;
  onClickVote: (v: Vote) => void;
  activeId: string;
};

export function VoteContainer({
  votes,
  title,
  backgroundStyle,
  showOptions = "all",
  desktopColumns,
  onClickVote,
  activeId,
}: VoteContainerProps) {
  return (
    <div
      className="flex flex-col flex-wrap content-start gap-2 p-2 w-[33.33%] max-md:w-full vote-container"
      style={{
        background: backgroundStyle,
        // width: `calc(100%*${desktopColumns}/18)`,
      }}
    >
      <div className="w-full rounded-md py-4 bg-[rgba(0,0,0,0.5)] text-center">
        <h3 className="font-black">{title}</h3>
      </div>
      <div
        className="grid grid-cols-6 gap-2"
        style={{
          gridTemplateColumns: `repeat(${desktopColumns}, minmax(0, 1fr))`,
        }}
      >
        {votes
          .filter((v) => v.memberType === showOptions || showOptions === "all")
          .map((v) => (
            <VoteItem
              key={v.id}
              vote={v}
              onClickVote={onClickVote}
              isActive={activeId === v.id}
            />
          ))}
      </div>
    </div>
  );
}
