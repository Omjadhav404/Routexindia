"use client";

import React, { MouseEvent, useState, useEffect } from "react";

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
  duration?: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className = "",
  rippleColor = "rgba(255, 255, 255, 0.35)",
  duration = 600,
  onClick,
  ...props
}) => {
  const [rippleArray, setRippleArray] = useState<{ x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    let bounce: any;
    if (rippleArray.length > 0) {
      bounce = setTimeout(() => {
        setRippleArray([]);
      }, duration);
    }
    return () => clearTimeout(bounce);
  }, [rippleArray, duration]);

  const addRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = button.clientWidth > button.clientHeight ? button.clientWidth : button.clientHeight;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = { x, y, size };
    setRippleArray((prev) => [...prev, newRipple]);

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      onClick={addRipple}
      className={`relative overflow-hidden cursor-pointer ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {rippleArray.map((ripple, index) => (
        <span
          key={"ripple_" + index}
          className="absolute rounded-full pointer-events-none scale-0 animate-ripple"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: rippleColor,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </button>
  );
};
