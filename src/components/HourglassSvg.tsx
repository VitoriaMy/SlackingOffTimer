import { useId } from "react";

type HourglassSvgProps = {
  percent: number;
  width?: number;
  height?: number;
  className?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function HourglassSvg({ percent, width = 220, height = 320, className }: HourglassSvgProps) {
  const normalized = clamp(percent, 0, 100) / 100;
  const topRatio = 1 - normalized;
  const bottomRatio = normalized;
  const showDrips = normalized > 0 && normalized < 1;

  const topWaterHeight = 100 * topRatio;
  const topWaterY = 160 - topWaterHeight;

  const bottomWaterHeight = 106 * bottomRatio;
  const bottomWaterY = 266 - bottomWaterHeight;
  const dripImpactY = bottomWaterY;
  const upperBottomApexY = 166;

  const topClipId = useId();
  const bottomClipId = useId();

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 200 320"
      role="img"
      aria-label={`沙漏进度 ${Math.round(normalized * 100)}%`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={topClipId}>
          <path d="M61 60 H139 Q145 60 141 68 L105 158 Q100 166 95 158 L59 68 Q55 60 61 60 Z" />
        </clipPath>
        <clipPath id={bottomClipId}>
          <path d="M95 178 Q100 170 105 178 L145 260 Q145 266 139 266 H61 Q55 266 55 260 Z" />
        </clipPath>
      </defs>

      <path
        d="M61 60 H139 Q145 60 141 68 L105 158 M95 158 L59 68 Q55 60 61 60 M95 178 L55 260 Q55 266 61 266 H139 Q145 266 145 260 L105 178"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <path
        d="M95 158 C97 161 98 164 98 168 C98 172 97 175 95 178 M105 158 C103 161 102 164 102 168 C102 172 103 175 105 178"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g clipPath={`url(#${topClipId})`}>
        <rect x="55" y={topWaterY} width="90" height={topWaterHeight} fill="#5aa9e6" opacity="0.92" />
        {topRatio > 0 ? (
          <path
            fill="none"
            stroke="#3d8ed0"
            strokeWidth="1.5"
            d={`M55 ${topWaterY} C70 ${topWaterY - 2} 85 ${topWaterY + 2} 100 ${topWaterY} C115 ${topWaterY - 2} 130 ${topWaterY + 2} 145 ${topWaterY}`}
          >
            <animate
              attributeName="d"
              dur="1.8s"
              repeatCount="indefinite"
              values={`M55 ${topWaterY} C70 ${topWaterY - 2} 85 ${topWaterY + 2} 100 ${topWaterY} C115 ${topWaterY - 2} 130 ${topWaterY + 2} 145 ${topWaterY};M55 ${topWaterY} C70 ${topWaterY + 2} 85 ${topWaterY - 2} 100 ${topWaterY} C115 ${topWaterY + 2} 130 ${topWaterY - 2} 145 ${topWaterY};M55 ${topWaterY} C70 ${topWaterY - 2} 85 ${topWaterY + 2} 100 ${topWaterY} C115 ${topWaterY - 2} 130 ${topWaterY + 2} 145 ${topWaterY}`}
            />
          </path>
        ) : null}
      </g>

      <g clipPath={`url(#${bottomClipId})`}>
        <rect x="55" y={bottomWaterY} width="90" height={bottomWaterHeight} fill="#5aa9e6" opacity="0.92" />
        {bottomRatio > 0 ? (
          <path
            fill="none"
            stroke="#3d8ed0"
            strokeWidth="1.5"
            d={`M55 ${bottomWaterY} C70 ${bottomWaterY - 2} 85 ${bottomWaterY + 2} 100 ${bottomWaterY} C115 ${bottomWaterY - 2} 130 ${bottomWaterY + 2} 145 ${bottomWaterY}`}
          >
            <animate
              attributeName="d"
              dur="1.8s"
              begin="0.25s"
              repeatCount="indefinite"
              values={`M55 ${bottomWaterY} C70 ${bottomWaterY - 2} 85 ${bottomWaterY + 2} 100 ${bottomWaterY} C115 ${bottomWaterY - 2} 130 ${bottomWaterY + 2} 145 ${bottomWaterY};M55 ${bottomWaterY} C70 ${bottomWaterY + 2} 85 ${bottomWaterY - 2} 100 ${bottomWaterY} C115 ${bottomWaterY + 2} 130 ${bottomWaterY - 2} 145 ${bottomWaterY};M55 ${bottomWaterY} C70 ${bottomWaterY - 2} 85 ${bottomWaterY + 2} 100 ${bottomWaterY} C115 ${bottomWaterY - 2} 130 ${bottomWaterY + 2} 145 ${bottomWaterY}`}
            />
          </path>
        ) : null}
        {bottomRatio > 0.08 ? (
          <g opacity="0.9">
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`74 ${bottomWaterY};124 ${bottomWaterY};74 ${bottomWaterY}`}
                keyTimes="0;0.5;1"
                dur="5s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="scale"
                additive="sum"
                calcMode="discrete"
                values="1 1;1 1;-1 1;-1 1;1 1"
                keyTimes="0;0.49;0.5;0.99;1"
                dur="5s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                additive="sum"
                values="0;4;-4;3;0"
                keyTimes="0;0.25;0.5;0.75;1"
                dur="0.65s"
                repeatCount="indefinite"
              />
              <g transform="scale(1.35)">
                <path d="M-6 0 C-3 -2.4 3 -2.4 6 0 C3 2.4 -3 2.4 -6 0 Z" fill="#1f5f8f" />
                <path d="M-6 0 L-9 -2 L-9 2 Z" fill="#1f5f8f" />
                <circle cx="3" cy="-0.4" r="0.45" fill="#e5f4ff" />
              </g>
            </g>
          </g>
        ) : null}
        {showDrips && bottomRatio > 0 ? (
          <>
            <ellipse cx="100" cy={bottomWaterY + 1.5} rx="0.5" ry="0.25" fill="none" stroke="#2f7fbd" strokeWidth="1.2" opacity="0.72">
              <animate attributeName="rx" values="0.5;0.5;7;11" keyTimes="0;0.74;0.88;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="ry" values="0.25;0.25;1.6;2.2" keyTimes="0;0.74;0.88;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0.72;0" keyTimes="0;0.72;0.8;1" dur="1s" repeatCount="indefinite" />
            </ellipse>
            <circle cx="100" cy={dripImpactY} r="1.2" fill="#5aa9e6" opacity="0">
              <animate attributeName="cx" values="100;100;95;91" keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="cy" values={`${dripImpactY};${dripImpactY};${dripImpactY - 2.5};${dripImpactY - 5}`} keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0.9;0" keyTimes="0;0.72;0.82;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="r" values="1.2;1.2;1;0.2" keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy={dripImpactY} r="1.2" fill="#5aa9e6" opacity="0">
              <animate attributeName="cx" values="100;100;105;109" keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="cy" values={`${dripImpactY};${dripImpactY};${dripImpactY - 2.5};${dripImpactY - 5}`} keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0.9;0" keyTimes="0;0.72;0.82;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="r" values="1.2;1.2;1;0.2" keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
            </circle>
          </>
        ) : null}
      </g>

      {showDrips ? (
        <>
          <ellipse cx="100" cy={upperBottomApexY} rx="1.8" ry="2.8" fill="#5aa9e6" opacity="0.95">
            <animate
              attributeName="cy"
              values={`${upperBottomApexY};170;180;${dripImpactY};${dripImpactY}`}
              keyTimes="0;0.35;0.65;0.92;1"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate attributeName="rx" values="1.8;1.8;1.5;0.2;0.2" keyTimes="0;0.35;0.65;0.92;1" dur="1s" repeatCount="indefinite" />
            <animate attributeName="ry" values="2.8;2.8;2.3;0.2;0.2" keyTimes="0;0.35;0.65;0.92;1" dur="1s" repeatCount="indefinite" />
          </ellipse>
        </>
      ) : null}
    </svg>
  );
}
