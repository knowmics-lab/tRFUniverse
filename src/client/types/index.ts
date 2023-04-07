export * from "./aminoacid";
export * from "./anticodon";
export * from "./chromosome";
export * from "./metadata";
export * from "./responses";
export * from "./fragments";
export * from "./targets";
export * from "./analysis";
export * from "./phensim";

export type Notification = {
    id: string;
    title: string;
    message: string;
    link?: string;
    type?: "primary" | "info" | "success" | "warning" | "danger";
    createdAt: Date;
    read?: boolean;
};

export type PendingAnalysis = {
    id: string;
    prefix: string;
    url: string;
    message?: string;
};

export type BreadcrumbItem =
    | {
          href: string;
          text: string;
          active?: false;
      }
    | {
          href?: undefined;
          text: string;
          active: true;
      };

export type Option<T = string> = {
    value: T;
    label: string;
};
