import { scoreArtDataUri, SCORE_ART_RATIO, SCORE_ART_RING_CENTER_Y } from "@/lib/scoreArt";

export function ScoreCardView({
  score,
  name,
  role,
  artMaxWidth = 360,
}: {
  score: number | string;
  name?: string | null;
  role?: string | null;
  artMaxWidth?: number;
}) {
  return (
    <div className="rounded-[36px] border border-orange-100 bg-gradient-to-br from-[#FFF3E6] via-[#FFFAF4] to-[#FFF6EC] px-5 pb-7 pt-6 text-center">
      <div className="inline-flex items-center gap-3 rounded-full bg-[#FCE9DE] px-6 py-2.5">
        <span className="h-[3px] w-6 rounded bg-[#F2754A]" />
        <span className="text-xs font-extrabold tracking-[0.3em] text-[#3B4A63]">ANTYL SCORE</span>
        <span className="h-[3px] w-6 rounded bg-[#F2754A]" />
      </div>

      <div
        className="relative mx-auto mt-2 w-full"
        style={{ maxWidth: artMaxWidth, aspectRatio: String(SCORE_ART_RATIO) }}
      >
        <img src={scoreArtDataUri()} alt="" className="absolute inset-0 h-full w-full" />
        <div
          className="absolute left-0 flex w-full items-center justify-center"
          style={{ top: `${SCORE_ART_RING_CENTER_Y * 100}%`, transform: "translateY(-50%)" }}
        >
          <span className="text-6xl font-black tabular-nums text-[#14213D] sm:text-7xl">{score}</span>
        </div>
      </div>

      {name && <h1 className="mt-1 text-3xl font-black tracking-tight text-[#14213D]">{name}</h1>}
      {role && (
        <span className="mt-3 inline-block rounded-full bg-[#FCE8DC] px-7 py-2 text-lg font-semibold text-slate-600">
          {role}
        </span>
      )}
    </div>
  );
}