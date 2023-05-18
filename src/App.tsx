import { useMemo } from "react";
import { Tooltip } from "react-tooltip";
import useSWR from "swr";
import "./App.css";

enum MemberType {
  Senate = "SV",
  Rep = "SS",
}

enum VoteType {
  No = -2,
  LikelyNo = -1,
  Unknown = 0,
  LikelyYes = 1,
  Yes = 2,
}

type Vote = {
  id: string;
  name: string;
  memberType: MemberType;
  partyName?: string;
  color?: string;
  voteType: VoteType;
  reference: string;
};

const csvFetcher = (url: string) =>
  fetch(url)
    .then((res) => res.text())
    .then(
      (res) =>
        res
          .split("\n")
          .map((l) => l.split(","))
          .reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (prev: { header: string[]; data: any[] }, cur, index) => {
              if (index == 0) {
                return {
                  header: cur.map((b) => b.trim()),
                  data: [],
                };
              }
              const dataItem = prev.header.reduce(
                (p, c, i) => ({ ...p, [c]: cur[i].trim() }),
                {}
              );
              prev.data.push(dataItem);
              return prev;
            },
            { header: [], data: [] }
          ).data
    );

type VoteProps = {
  vote: Vote;
};
function VoteItem({ vote }: VoteProps) {
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
    <a
      href={vote.reference}
      target="_blank"
      className=""
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
          className="w-[100%] aspect-square object-contain rounded-full object-top"
          src={`/images/${vote.id}.png`}
        />
      </div>
    </a>
  );
}

type VoteContainerProps = {
  votes: Vote[];
  title: string;
  backgroundStyle: string;
};
function VoteContainer({ votes, title, backgroundStyle }: VoteContainerProps) {
  return (
    <div
      className="flex gap-2 flex-col flex-wrap md:w-[33%] w-full p-2 content-start"
      style={{
        background: backgroundStyle,
      }}
    >
      <div className="w-full rounded-md py-4 bg-[rgba(0,0,0,0.5)] text-center">
        <h3 className="font-black">{title}</h3>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {votes.map((v) => (
          <VoteItem vote={v} />
        ))}
      </div>
    </div>
  );
}

function App() {
  const { data: voteData, isLoading: isVoteLoading } = useSWR<Vote[]>(
    "/data/vote.csv?v=1",
    csvFetcher
  );

  const processedVoteData = useMemo<{
    [v in VoteType]: Vote[];
  }>(
    () =>
      voteData?.reduce<{
        [v in VoteType]: Vote[];
      }>(
        (prev, cur) => {
          prev[cur.voteType].push(cur);
          return prev;
        },
        {
          [VoteType.No]: [],
          [VoteType.LikelyNo]: [],
          [VoteType.Unknown]: [],
          [VoteType.LikelyYes]: [],
          [VoteType.Yes]: [],
        }
      ) ?? {
        [VoteType.No]: [],
        [VoteType.LikelyNo]: [],
        [VoteType.Unknown]: [],
        [VoteType.LikelyYes]: [],
        [VoteType.Yes]: [],
      },
    [voteData]
  );

  if (isVoteLoading) return null;

  console.log(processedVoteData);

  const yesVoteCount =
    processedVoteData["2"].length + processedVoteData["1"].length;
  const maybeVoteCount = processedVoteData["0"].length;
  const noVoteCount =
    processedVoteData["-2"].length + processedVoteData["-1"].length;
  const totalVoteCount = yesVoteCount + maybeVoteCount + noVoteCount;

  return (
    <>
      <h1 className="font-black md:text-[4.2rem] leading-none mt-8 text-[2rem]">
        เช็คคะแนนเสียงสมาชิกรัฐสภา
      </h1>
      <h1 className="font-black md:text-[5rem] leading-none text-[2rem]">
        ส่งพิธาเป็นนายกรัฐมนตรี
      </h1>
      <div className="p-4 sizing-box flex flex-row md:mt-16 mt-4">
        <div
          className="h-[50px] bg-[#165902] flex items-center md:pl-4 pl-2 font-black md:text-xl text-md text-left"
          style={{ width: `${(100 * yesVoteCount) / totalVoteCount}%` }}
        >
          {yesVoteCount}{" "}
          {yesVoteCount < 376
            ? `(ยังขาดอีก ${376 - yesVoteCount} เสียง)`
            : "(เกินเป้า 376!)"}
        </div>
        <div
          className="h-[50px] bg-[#827762] flex items-center md:pl-4 pl-2 font-black md:text-xl text-md text-left"
          style={{ width: `${(100 * maybeVoteCount) / totalVoteCount}%` }}
        >
          {maybeVoteCount}
        </div>
        <div
          className="h-[50px] bg-[#8e0d04] flex items-center md:pl-4 pl-2 font-black md:text-xl text-md text-left"
          style={{ width: `${(100 * noVoteCount) / totalVoteCount}%` }}
        >
          {noVoteCount}
        </div>
      </div>
      <div className="md:mt-8 md-4 flex md:flex-row flex-col">
        <VoteContainer
          title="โหวตเห็นด้วย"
          votes={processedVoteData["2"]}
          backgroundStyle="linear-gradient(39deg, rgba(6,36,0,1) 0%, rgba(72,119,67,1) 35%, rgba(0,255,87,1) 100%)"
        />
        {/* <VoteContainer
          title="มีแนวโน้มโหวตเห็นด้วย"
          votes={processedVoteData["1"]}
          backgroundStyle="linear-gradient(39deg, rgba(33,48,30,1) 0%, rgba(65,89,62,1) 35%, rgba(79,154,110,1) 100%)"
        /> */}
        <VoteContainer
          title="ยังไม่ทราบ / ไม่ชัดเจน"
          votes={processedVoteData["0"]}
          backgroundStyle="linear-gradient(39deg, rgba(46,61,46,1) 0%, rgba(83,79,79,1) 49%, rgba(64,49,49,1) 100%)"
        />
        {/* <VoteContainer
          title="มีแนวโน้มไม่โหวตเห็นด้วย"
          votes={processedVoteData["-1"]}
          backgroundStyle="linear-gradient(39deg, rgba(55,52,51,1) 0%, rgba(144,72,65,1) 26%, rgba(149,95,76,1) 100%)"
        /> */}
        <VoteContainer
          title="ไม่โหวตเห็นด้วย"
          votes={processedVoteData["-2"]}
          backgroundStyle="linear-gradient(39deg, rgba(71,62,59,1) 0%, rgba(201,59,45,1) 30%, rgba(189,86,15,1) 100%)"
        />
      </div>
      <p className="font-black mt-4">
        by{" "}
        <a href="https://twitter.com/PanJ" target="_blank">
          PanJ
        </a>
      </p>
      <p className="mb-8">
        Got an updated data?{" "}
        <a href="https://github.com/PanJ/road-to-376" target="_blank">
          Submit on GitHub
        </a>
      </p>
      <p className="mb-8 text-sm">
        Thanks for the images from{" "}
        <a href="https://wevis.info/" target="_blank">
          WeVis
        </a>{" "}
        and{" "}
        <a href="https://election2566.thestandard.co/" target="_blank">
          THE STANDARD
        </a>
      </p>
      <Tooltip id="vote-tooltip" />
    </>
  );
}

export default App;
