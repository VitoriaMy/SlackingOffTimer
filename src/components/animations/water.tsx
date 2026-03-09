import { DotLottieReact } from "@lottiefiles/dotlottie-react";
export function WaterAnimation({ className }: { className?: string }) {
  return (
    <DotLottieReact
      className={className}
      src="/animations/water.json"
      autoplay={true}
      loop={true}
      renderConfig={{
        wasmUrl: '/animations/dotlottie-player.wasm',
      }}
    />
  );
}
