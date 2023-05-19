import { useCallback, useEffect, useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import Modal from "react-modal";
import useSWR from "swr";
import "./App.css";
import { VoteContainer } from "./components/VoteContainers";
import { Vote, MemberType, VoteType } from "./types";
import { FilterOption } from "./components/FilterOption";

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

function App() {
  const { data: voteData, isLoading: isVoteLoading } = useSWR<Vote[]>(
    "/data/vote.csv?v=8",
    csvFetcher
  );

  const [showOption, setShowOption] = useState<
    "all" | MemberType.Senate | MemberType.Rep
  >("all");

  const onShowOptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setShowOption(
        e.target.value as "all" | MemberType.Senate | MemberType.Rep
      );
    },
    []
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

  const [activeId, setActiveId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVote, setCurrentVote] = useState<Vote | undefined>();

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(
        Math.random() * processedVoteData["2"].length
      );
      const randomId = processedVoteData["2"][randomIndex].id;
      setActiveId(randomId);
    }, 300);
    return () => clearInterval(interval);
  }, [processedVoteData]);

  const onClickVote = useCallback((v: Vote) => {
    setCurrentVote(v);
    setModalOpen(true);
  }, []);
  const onClose = useCallback(() => {
    setCurrentVote(undefined);
    setModalOpen(false);
  }, []);

  // console.log(processedVoteData);
  if (isVoteLoading) return null;

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
      <div className="flex flex-row p-0 mt-4 sizing-box md:mt-16">
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

      <div className="flex flex-row gap-2 my-4 md-4">
        {/* show options */}
        <FilterOption
          isActive={showOption === "all"}
          value="all"
          onChange={onShowOptionChange}
        >
          ทั้งหมด
        </FilterOption>
        <FilterOption
          isActive={showOption === MemberType.Senate}
          value={MemberType.Senate}
          onChange={onShowOptionChange}
        >
          <span className="max-md:hidden">แสดงเฉพาะ </span>ส.ว.
        </FilterOption>
        <FilterOption
          isActive={showOption === MemberType.Rep}
          value={MemberType.Rep}
          onChange={onShowOptionChange}
        >
          <span className="max-md:hidden">แสดงเฉพาะ </span>ส.ส.
        </FilterOption>
      </div>

      <div className="flex flex-col md-4 md:flex-row">
        <VoteContainer
          title="โหวตเห็นด้วย"
          votes={processedVoteData["2"]}
          backgroundStyle="linear-gradient(39deg, rgb(6, 36, 0) 0%, rgb(72, 119, 67) 35%, rgb(49 173 17) 100%)"
          showOptions={showOption}
          desktopColumns={6}
          onClickVote={onClickVote}
          activeId={activeId}
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
          showOptions={showOption}
          desktopColumns={6}
          onClickVote={onClickVote}
          activeId={activeId}
        />
        {/* <VoteContainer
          title="มีแนวโน้มไม่โหวตเห็นด้วย"
          votes={processedVoteData["-1"]}
          backgroundStyle="linear-gradient(39deg, rgba(55,52,51,1) 0%, rgba(144,72,65,1) 26%, rgba(149,95,76,1) 100%)"
        /> */}
        <VoteContainer
          title="ไม่โหวตเห็นด้วย"
          votes={processedVoteData["-2"]}
          showOptions={showOption}
          backgroundStyle="linear-gradient(39deg, rgb(71, 62, 59) 0%, rgb(201, 59, 45) 30%, rgb(157 45 10) 100%)"
          desktopColumns={6}
          onClickVote={onClickVote}
          activeId={activeId}
        />
      </div>
      <p className="mt-4 font-black">
        by{" "}
        <a rel="noopener" href="https://twitter.com/PanJ" target="_blank">
          PanJ
        </a>
      </p>
      <p className="mb-8">
        Got an updated data?{" "}
        <a
          rel="noopener"
          href="https://github.com/PanJ/road-to-376"
          target="_blank"
        >
          Submit on GitHub
        </a>
      </p>
      <p className="mb-8 text-sm">
        Thanks for the images from{" "}
        <a rel="noopener" href="https://wevis.info/" target="_blank">
          WeVis
        </a>{" "}
        and{" "}
        <a
          rel="noopener"
          href="https://election2566.thestandard.co/"
          target="_blank"
        >
          THE STANDARD
        </a>
      </p>
      <Tooltip id="vote-tooltip" />
      <Modal
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.5)" },
          content: {
            border: "0",
            padding: "0",
            backgroundColor: currentVote?.color || "#777",
            maxWidth: "400px",
            margin: "auto",
            borderRadius: "20px",
          },
        }}
        isOpen={modalOpen}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onAfterOpen={() => {}}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onRequestClose={() => {
          setModalOpen(false);
        }}
        shouldCloseOnOverlayClick
        contentLabel="Example Modal"
      >
        <div className="flex flex-col items-center w-full min-h-full">
          <div className="mt-8">
            <img
              src={`/images/${currentVote?.id}.png`}
              alt={`${currentVote?.name} (${currentVote?.partyName})`}
            />
          </div>
          <div className="p-4 w-full text-center bg-[rgba(0,0,0,0.5)] grow flex flex-col">
            <p className="font-black my-4 text-[2rem]">{currentVote?.name}</p>
            <p className="font-regular text-[1.2rem]">
              {currentVote?.memberType === MemberType.Senate && "สมาชิกวุฒิสภา"}
              {currentVote?.memberType === MemberType.Rep &&
                "ว่าที่สมาชิกผู้แทนราษฎร"}
            </p>
            {(currentVote?.partyName?.length ?? 0) > 0 && (
              <p className="font-regular text-[1.2rem]">
                พรรค{currentVote?.partyName}
              </p>
            )}
            <div className="grow"></div>
            {currentVote?.bio !== "" && (
              <a
                href={currentVote?.bio}
                target="_blank"
                className="block w-full p-2 my-2 border border-white border-solid rounded-lg"
              >
                ดูประวัติ
              </a>
            )}
            {currentVote?.reference !== "" && (
              <a
                href={currentVote?.reference}
                target="_blank"
                className="block w-full p-2 my-2 border border-white border-solid rounded-lg"
              >
                เปิดแหล่งข้อมูลอ้างอิง
              </a>
            )}

            <a
              onClick={onClose}
              className="block w-full p-2 my-2 border border-white border-solid rounded-lg cursor-pointer"
            >
              ปิด
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default App;
