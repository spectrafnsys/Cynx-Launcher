import { cn } from "../../utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse-glow rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
