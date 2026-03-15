import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-xs font-medium whitespace-nowrap transition-all outline-none select-none backdrop-blur-xl focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary/32 bg-primary text-primary-foreground shadow-lg shadow-fuchsia-500/20 hover:-translate-y-0.5 hover:bg-primary/92 hover:shadow-xl hover:shadow-fuchsia-500/25 dark:bg-primary dark:text-primary-foreground",
        outline:
          "border-white/55 bg-white/42 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:bg-white/58 hover:text-foreground aria-expanded:bg-white/58 aria-expanded:text-foreground dark:border-white/14 dark:bg-white/8 dark:hover:bg-white/12",
        secondary:
          "border-white/36 bg-secondary/72 text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.56)] hover:bg-secondary/88 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground dark:border-white/12 dark:bg-white/7 dark:hover:bg-white/11",
        ghost:
          "hover:bg-white/38 hover:text-foreground aria-expanded:bg-white/38 aria-expanded:text-foreground dark:hover:bg-white/10",
        destructive:
          "border-destructive/28 bg-destructive/16 text-destructive shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] hover:bg-destructive/24 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:border-destructive/18 dark:bg-destructive/18 dark:hover:bg-destructive/26 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6.5 gap-1 rounded-lg px-2 text-[11px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-lg px-2.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-6.5 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7.5 rounded-lg",
        "icon-lg": "size-8.5 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
