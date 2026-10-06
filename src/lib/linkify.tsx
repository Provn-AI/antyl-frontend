import type { ReactNode } from "react";

// Turns http(s) URLs inside plain message text into tappable links.
export function linkify(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-semibold break-all"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}