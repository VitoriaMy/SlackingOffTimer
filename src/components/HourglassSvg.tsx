import { useId } from "react";

function HourglassFish({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke="#2c2943" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8.7C4.1 5.2 7.3 2.9 11.6 2.4C13.5 2.1 15.2 2.3 17.2 3.1C19.1 3.9 20.5 5 22 6.6L24.3 5.4L23.2 8.6L25.6 10L22.1 10.3C21.1 12.8 19.5 14.6 17.1 15.9C15.2 16.9 13.1 17.2 10.8 17.1C8.7 17 6.6 16.6 4.7 15.6L4.4 18.3L2.7 16.1C1.2 16 0.1 15.4 -0.8 14.5C-1.7 13.4 -2.2 12.2 -2.2 10.7C-2.3 9.2 -1.9 7.9 -1 6.9C-0.2 6 0.8 5.4 2.2 5.1L2 8.7Z" strokeWidth="1.8" />
      <path d="M6.8 5.3C7.6 6.1 8 6.9 8.1 7.8" strokeWidth="1.8" />
      <path d="M9.9 4.2C10.9 5.2 11.4 6.4 11.5 7.8" strokeWidth="1.8" />
      <circle cx="15.8" cy="8.3" r="1.2" fill="#2c2943" stroke="none" />
    </g>
  );
}

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

  const topWaterHeight = 78 * topRatio;
  const topWaterY = 140 - topWaterHeight;

  const bottomWaterHeight = 52 * bottomRatio;
  const bottomWaterY = 228 - bottomWaterHeight;
  const dripImpactY = bottomWaterY;
  const upperBottomApexY = 168;

  const topClipId = useId();
  const bottomClipId = useId();

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 240 340"
      role="img"
      aria-label={`沙漏进度 ${Math.round(normalized * 100)}%`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={topClipId}>
          <path d="M81 94 C81 126 92 149 109 163 C116 169 119 176 119 182 L121 182 C121 176 124 169 131 163 C148 149 159 126 159 94 Z" />
        </clipPath>
        <clipPath id={bottomClipId}>
          <path d="M119 184 C119 191 116 198 109 205 C92 219 81 242 81 274 H159 C159 242 148 219 131 205 C124 198 121 191 121 184 Z" />
        </clipPath>
      </defs>

      <g fill="none" stroke="#2c2943" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="120" cy="72" rx="65" ry="13.5" />
        <path d="M55 72 V80 C55 86 84 90 120 90 C156 90 185 86 185 80 V72" />
        <ellipse cx="120" cy="286" rx="65" ry="13.5" />
        <path d="M55 278 V286 C55 292 84 296 120 296 C156 296 185 292 185 286 V278" />
        <path d="M76 96 C74 128 74 160 76 236" />
        <path d="M164 96 C166 128 166 160 164 236" />
        <circle cx="74" cy="186" r="4.4" />
        <circle cx="166" cy="186" r="4.4" />
        <path d="M81 94 C81 126 92 149 109 163 C116 169 119 176 119 182" />
        <path d="M159 94 C159 126 148 149 131 163 C124 169 121 176 121 182" />
        <path d="M119 184 C119 191 116 198 109 205 C92 219 81 242 81 274" />
        <path d="M121 184 C121 191 124 198 131 205 C148 219 159 242 159 274" />
      </g>

      <path
        d="M118 180 C118 183 117 186 116 188 M122 180 C122 183 123 186 124 188"
        fill="none"
        stroke="#2c2943"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g clipPath={`url(#${topClipId})`}>
        <rect x="81" y={topWaterY} width="78" height={topWaterHeight} fill="#efefee" opacity="1" />
        {topRatio > 0 ? (
          <path
            fill="none"
            stroke="#908fa0"
            strokeWidth="1.6"
            d={`M82 ${topWaterY} C96 ${topWaterY - 2} 108 ${topWaterY + 2} 120 ${topWaterY} C132 ${topWaterY - 2} 144 ${topWaterY + 2} 158 ${topWaterY}`}
          >
            <animate
              attributeName="d"
              dur="1.8s"
              repeatCount="indefinite"
              values={`M82 ${topWaterY} C96 ${topWaterY - 2} 108 ${topWaterY + 2} 120 ${topWaterY} C132 ${topWaterY - 2} 144 ${topWaterY + 2} 158 ${topWaterY};M82 ${topWaterY} C96 ${topWaterY + 2} 108 ${topWaterY - 2} 120 ${topWaterY} C132 ${topWaterY + 2} 144 ${topWaterY - 2} 158 ${topWaterY};M82 ${topWaterY} C96 ${topWaterY - 2} 108 ${topWaterY + 2} 120 ${topWaterY} C132 ${topWaterY - 2} 144 ${topWaterY + 2} 158 ${topWaterY}`}
            />
          </path>
        ) : null}
      </g>

      <g clipPath={`url(#${bottomClipId})`}>
        <rect x="81" y={bottomWaterY} width="78" height={bottomWaterHeight} fill="#efefee" opacity="1" />
        {bottomRatio > 0 ? (
          <path
            fill="none"
            stroke="#908fa0"
            strokeWidth="1.6"
            d={`M82 ${bottomWaterY} C96 ${bottomWaterY - 2} 108 ${bottomWaterY + 2} 120 ${bottomWaterY} C132 ${bottomWaterY - 2} 144 ${bottomWaterY + 2} 158 ${bottomWaterY}`}
          >
            <animate
              attributeName="d"
              dur="1.8s"
              begin="0.25s"
              repeatCount="indefinite"
              values={`M82 ${bottomWaterY} C96 ${bottomWaterY - 2} 108 ${bottomWaterY + 2} 120 ${bottomWaterY} C132 ${bottomWaterY - 2} 144 ${bottomWaterY + 2} 158 ${bottomWaterY};M82 ${bottomWaterY} C96 ${bottomWaterY + 2} 108 ${bottomWaterY - 2} 120 ${bottomWaterY} C132 ${bottomWaterY + 2} 144 ${bottomWaterY - 2} 158 ${bottomWaterY};M82 ${bottomWaterY} C96 ${bottomWaterY - 2} 108 ${bottomWaterY + 2} 120 ${bottomWaterY} C132 ${bottomWaterY - 2} 144 ${bottomWaterY + 2} 158 ${bottomWaterY}`}
            />
          </path>
        ) : null}
        {bottomRatio > 0.08 ? (
          <g opacity="0.9">
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`112 ${bottomWaterY};134 ${bottomWaterY};112 ${bottomWaterY}`}
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
              <HourglassFish x={1} y={0} scale={0.62} />
            </g>
          </g>
        ) : null}
        {showDrips && bottomRatio > 0 ? (
          <>
            <ellipse cx="120" cy={bottomWaterY + 1.5} rx="0.5" ry="0.25" fill="none" stroke="#706d82" strokeWidth="1.2" opacity="0.55">
              <animate attributeName="rx" values="0.5;0.5;7;11" keyTimes="0;0.74;0.88;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="ry" values="0.25;0.25;1.6;2.2" keyTimes="0;0.74;0.88;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0.72;0" keyTimes="0;0.72;0.8;1" dur="1s" repeatCount="indefinite" />
            </ellipse>
            <circle cx="120" cy={dripImpactY} r="1.2" fill="#7a768f" opacity="0">
              <animate attributeName="cx" values="120;120;115;111" keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="cy" values={`${dripImpactY};${dripImpactY};${dripImpactY - 2.5};${dripImpactY - 5}`} keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0.9;0" keyTimes="0;0.72;0.82;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="r" values="1.2;1.2;1;0.2" keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="120" cy={dripImpactY} r="1.2" fill="#7a768f" opacity="0">
              <animate attributeName="cx" values="120;120;125;129" keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="cy" values={`${dripImpactY};${dripImpactY};${dripImpactY - 2.5};${dripImpactY - 5}`} keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0.9;0" keyTimes="0;0.72;0.82;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="r" values="1.2;1.2;1;0.2" keyTimes="0;0.74;0.86;1" dur="1s" repeatCount="indefinite" />
            </circle>
          </>
        ) : null}
      </g>

      {showDrips ? (
        <>
          <ellipse cx="120" cy={upperBottomApexY} rx="1.8" ry="2.8" fill="#7a768f" opacity="0.95">
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
