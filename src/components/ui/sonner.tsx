"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "#1C1C22",
          "--normal-border": "#3D3D48",
          "--normal-text": "#F5F5F0",
          "--success-bg": "#0F7B5C",
          "--error-bg": "#7C2D2D",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
