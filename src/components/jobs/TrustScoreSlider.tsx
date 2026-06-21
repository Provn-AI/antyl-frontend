"use client";

interface Props {
  minScore: number;
  maxScore: number;

  onMinChange: (
    value: number
  ) => void;

  onMaxChange: (
    value: number
  ) => void;
}

export default function TrustScoreSlider({
  minScore,
  maxScore,
  onMinChange,
  onMaxChange,
}: Props) {
  return (
    <div className="space-y-4">

      <div className="font-semibold">
        Antyl Score Range
      </div>

      <div>

        <div className="flex justify-between text-sm mb-2">
          <span>
            Minimum: {minScore}
          </span>

          <span>
            Maximum: {maxScore}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={minScore}
          onChange={(e) =>
            onMinChange(
              Number(
                e.target.value
              )
            )
          }
          className="w-full"
        />

        <input
          type="range"
          min={0}
          max={100}
          value={maxScore}
          onChange={(e) =>
            onMaxChange(
              Number(
                e.target.value
              )
            )
          }
          className="w-full mt-3"
        />

      </div>

      <div className="flex justify-between text-xs text-gray-500">

        <span>
          Beginner
        </span>

        <span>
          Intermediate
        </span>

        <span>
          Advanced
        </span>

        <span>
          Expert
        </span>

      </div>

    </div>
  );
}