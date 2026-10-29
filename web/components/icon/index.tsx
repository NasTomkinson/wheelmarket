"use client";

import type { HTMLAttributes } from "react";

import { Icon as IconifyIcon } from "@iconify-icon/react";

interface IconProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  className?: string;
}

export const Icon = ({ className, name, ...rest }: IconProps) => {
  return (
    <div
      className={`icon text-inherit ${className ? className : ""}`}
      {...rest}
    >
      <IconifyIcon
        inline
        height="none"
        className="w-full flex"
        icon={name}
      />
    </div>
  );
};
