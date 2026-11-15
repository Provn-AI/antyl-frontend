import { Sparkles, CalendarDays, Clock } from "lucide-react";

export interface BlogArticleData {
  title: string;
  content: string;
  published_at: string;
}

export function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Light formatting for plain-text content: blank lines separate blocks,
// "#" / "##" / "###" lines become headings, "-" / "*" lines become bullet
// lists and "1." lines become numbered lists. Anything else is a paragraph.
export function renderContent(content: string) {
  const blocks = content.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);

  return blocks.map((block, i) => {
    const lines = block.split("\n");

    const heading = lines.length === 1 ? block.match(/^#{1,3}\s+(.+)$/) : null;
    if (heading) {
      return (
        <h2
          key={i}
          className="text-xl sm:text-2xl font-bold text-gray-900 mt-9 mb-3 break-words"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          {heading[1]}
        </h2>
      );
    }

    if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
      return (
        <ul key={i} className="my-5 space-y-2.5">
          {lines.map((l, j) => (
            <li key={j} className="flex items-start gap-3 text-gray-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2754A] mt-2.5 flex-shrink-0" />
              <span className="break-words min-w-0">{l.replace(/^\s*[-*•]\s+/, "")}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      return (
        <ol key={i} className="my-5 space-y-2.5">
          {lines.map((l, j) => (
            <li key={j} className="flex items-start gap-3 text-gray-600 leading-relaxed">
              <span className="w-6 h-6 rounded-full bg-orange-50 text-[#F2754A] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {j + 1}
              </span>
              <span className="break-words min-w-0">{l.replace(/^\s*\d+[.)]\s+/, "")}</span>
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p
        key={i}
        className={`whitespace-pre-line break-words leading-relaxed my-5 first:mt-0 ${
          i === 0 ? "text-lg text-gray-700" : "text-[15px] sm:text-base text-gray-600"
        }`}
      >
        {block}
      </p>
    );
  });
}

export default function BlogArticle({ blog }: { blog: BlogArticleData }) {
  return (
    <article className="w-full min-w-0 bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
      <header className="relative px-6 sm:px-10 pt-9 sm:pt-11 pb-7 sm:pb-8 bg-gradient-to-br from-orange-50 via-orange-50/40 to-white border-b border-orange-100/60 overflow-hidden">
        <div aria-hidden className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-[#F2754A]/10" />
        <div aria-hidden className="absolute right-20 -bottom-14 w-32 h-32 rounded-full bg-[#FFB347]/15" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F2754A] bg-white border border-orange-100 px-3 py-1.5 rounded-full mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Weekly roundup
          </span>

          <h1
            className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight break-words"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 text-xs font-semibold text-gray-500">
            <span
              className="flex items-center gap-1.5"
              title={new Date(blog.published_at).toLocaleString("en-IN")}
            >
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              {new Date(blog.published_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {readingTime(blog.content)} min read
            </span>
          </div>
        </div>
      </header>

      <div className="px-6 sm:px-10 py-8 sm:py-10">
        <div className="max-w-none">{renderContent(blog.content)}</div>
      </div>
    </article>
  );
}