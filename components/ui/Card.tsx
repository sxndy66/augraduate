"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  gradientBorder?: boolean;
  hover?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ gradientBorder = false, hover = false, className, children, ...props }, ref) => {
    if (gradientBorder) {
      return (
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-electric-blue/40 via-royal-indigo/20 to-transparent">
          <motion.div
            ref={ref}
            className={cn(
              "glass-card rounded-2xl h-full w-full",
              hover && "transition-transform duration-300 hover:scale-[1.01]",
              className
            )}
            {...props}
          >
            {children}
          </motion.div>
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-card rounded-2xl",
          hover && "transition-all duration-300 hover:border-electric-blue/30 hover:shadow-lg hover:shadow-electric-blue/10",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
