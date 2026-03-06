import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function WaterAnimation({
  className,
}: {
  className?: string; 
}) {
  return (
    <DotLottieReact
      src="/animations/water.json"
      loop
      autoplay
      className={className}
    />
  );
};