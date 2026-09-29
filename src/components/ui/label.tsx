import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  htmlFor?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, htmlFor, children, ...props }, ref) => (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
);
Label.displayName = "Label";

export { Label };
