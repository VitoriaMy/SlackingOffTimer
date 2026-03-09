import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function FishAnimation({
  className,
}: {
  className?: string;
}) {
  return (
    <DotLottieReact
      src="/animations/fish.json"
      loop
      autoplay
      className={className}
      renderConfig={{
        wasmUrl: '/animations/dotlottie-player.wasm',
      }}
    />
  );
};