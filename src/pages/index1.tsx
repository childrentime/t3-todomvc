import { UseElementVisibility, useElementVisibility } from "@reactuses/core";
import { useRef } from "react";

export default function InfiniteList() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible] = useElementVisibility(ref);

  return (
    <div>
      <div></div>
      <div ref={ref}/>
    </div>
  );
}
