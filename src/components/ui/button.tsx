import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
        ghost: "border border-white/20 bg-white/5 text-white hover:bg-white/12",
        outline: "border border-cyan-300/30 bg-transparent text-cyan-100 hover:bg-cyan-400/10"
      },
      size: {
        sm: "h-8 px-3 text-xs uppercase",
        md: "h-10 px-4 text-sm uppercase",
        lg: "h-12 px-6 text-sm uppercase"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
