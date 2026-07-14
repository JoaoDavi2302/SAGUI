import React from "react";

export type SidebarItem =
  | {
      label: string;
      href: string;
      icon?: React.ReactNode;
      exact?: boolean;
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

export type HeaderSearchType =
  | "courses"
  | "disciplines"
  | "users"
  | "professor-disciplines";