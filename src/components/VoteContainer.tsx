import { useState } from "react";
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
  const [isShowVoters, setIsShowVoters] = useState(true);

  return (
    <div
      className="flex flex-col flex-wrap content-start gap-2 p-2 w-[33.33%] max-md:w-full vote-container"
      style={{
        background: backgroundStyle,
        // width: `calc(100%*${desktopColumns}/18)`,
      }}
    >
      <div className="w-full rounded-md py-4 bg-[rgba(0,0,0,0.5)] hover:cursor-pointer md:hover:cursor-default"
        onClick={() => {setIsShowVoters((prev) => !prev)}}
      >
      <div className="flex items-center justify-center relative">
          <h3 className="font-black">{title}</h3>
          <div className="absolute mr-2 right-0 md:hidden">
            {isShowVoters ? <IconCaretDown/> : <IconCaretUp/>}
          </div>
        </div>
      </div>
      <div
        className={`grid grid-cols-6 gap-2 ${!isShowVoters && 'hidden md:grid'}`}
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

function IconCaretUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M858.9 689L530.5 308.2c-9.4-10.9-27.5-10.9-37 0L165.1 689c-12.2 14.2-1.2 35 18.5 35h656.8c19.7 0 30.7-20.8 18.5-35z" />
    </svg>
  );
}

function IconCaretDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z" />
    </svg>
  );
}
