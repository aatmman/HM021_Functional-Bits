import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track 
      className="relative h-3 w-full grow overflow-hidden rounded-full"
      style={{
        background: 'linear-gradient(145deg, hsl(25 10% 10%) 0%, hsl(25 10% 8%) 100%)',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      }}
    >
      <SliderPrimitive.Range 
        className="absolute h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, hsl(28 85% 48%) 0%, hsl(28 85% 52%) 100%)',
          boxShadow: '0 0 12px hsl(28 85% 52% / 0.4)',
        }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className="block h-6 w-6 rounded-full transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:scale-110"
      style={{
        background: 'linear-gradient(145deg, hsl(35 20% 95%) 0%, hsl(35 15% 85%) 100%)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
        border: '2px solid hsl(28 85% 52%)',
      }}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
