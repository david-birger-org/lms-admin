"use client";

import "highlight.js/styles/github.css";

import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

function WatermarkOverlay({ text }: { text: string }) {
  const repeated = Array.from({ length: 20 }, () => text).join("   ");
  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      aria-hidden
    >
      {rows.map((i) => (
        <div
          key={`wm-${i}`}
          className="whitespace-nowrap text-sm font-medium text-foreground/[0.04] dark:text-foreground/[0.06]"
          style={{
            transform: "rotate(-25deg)",
            transformOrigin: "0 0",
            marginTop: `${i * 120}px`,
            marginLeft: "-20%",
            width: "200%",
          }}
        >
          {repeated}
        </div>
      ))}
    </div>
  );
}

export function LectureReader({
  content,
  watermarkText,
}: {
  content: string;
  watermarkText: string;
}) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: intentional anti-copy protection
    <div
      className="relative"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      <WatermarkOverlay text={watermarkText} />
      <div className="prose prose-neutral dark:prose-invert max-w-none select-none">
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {content}
        </Markdown>
      </div>
    </div>
  );
}
