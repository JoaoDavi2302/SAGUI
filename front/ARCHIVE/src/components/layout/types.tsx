import React from "react";

export type SidebarItem =
  | {
      label: string;
      href: string;
      icon?: React.ReactNode;
    }
  | {
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
    };

export type HeaderItem =
  | {
      label: string;
      href: string;
    }
  | {
      label: string;
      action: "logout";
    };