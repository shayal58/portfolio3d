import type { ComponentPropsWithoutRef, ElementType } from "react";

type Props<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

/** Frosted-glass container. Styling lives in the `glass` utility in globals.css. */
export function GlassPanel<T extends ElementType = "div">({
  as,
  className = "",
  ...rest
}: Props<T>) {
  const Tag = as ?? "div";
  return <Tag className={`glass rounded-2xl ${className}`} {...rest} />;
}
