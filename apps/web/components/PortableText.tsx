import React from "react";
import { PortableText as BasePortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity/image";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base md:text-[17px] leading-[1.7] text-on-surface-variant mb-4">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-serif text-2xl md:text-3xl font-normal text-primary mt-9 mb-4 tracking-tight border-b border-hairline/70 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif text-xl font-medium text-primary mt-6 mb-3 tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-serif text-lg font-medium text-primary mt-4 mb-2">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary-container bg-mint/50 rounded-r-lg px-5 py-3 my-5 font-serif text-lg italic text-primary">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-5 mb-4 space-y-2 text-on-surface-variant text-base">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-5 mb-4 space-y-2 text-on-surface-variant text-base">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-on-surface">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-primary">{children}</em>,
    code: ({ children }) => (
      <code className="font-mono text-xs bg-mint text-primary px-1.5 py-0.5 rounded border border-hairline">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const href = value?.href || "#";
      const isExternal = href.startsWith("http") || href.startsWith("mailto");
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-primary font-medium underline underline-offset-4 decoration-jade hover:decoration-primary transition-colors"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      const imageUrl = urlForImage(value)?.width(1200).url();
      if (!imageUrl) {
        return null;
      }
      return (
        <figure className="my-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-hairline bg-surface-white shadow-editorial-sm">
            <Image
              src={imageUrl}
              alt={value.alt || "Content image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center font-mono text-xs text-muted-text mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    codeBlock: ({ value }) => {
      return (
        <div className="my-6 overflow-hidden rounded-xl border border-charcoal-gutter bg-charcoal-gutter text-surface-white shadow-editorial-sm">
          {(value.filename || value.language) && (
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-on-primary-container font-mono">
              <span>{value.filename || ""}</span>
              <span className="uppercase text-[11px] tracking-wider text-secondary-fixed">
                {value.language || "code"}
              </span>
            </div>
          )}
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-inverse-on-surface">
            <code>{value.code}</code>
          </pre>
        </div>
      );
    },
    callout: ({ value }) => {
      const tone = value?.tone || "info";
      const borderClass =
        tone === "warning" ? "border-warning bg-warning/10" : "border-primary-container bg-mint";
      return (
        <div className={`my-5 border-l-2 ${borderClass} px-4 py-3 text-sm text-on-surface rounded-r-lg`}>
          <p className="leading-relaxed">{value.text}</p>
        </div>
      );
    },
  },
};

interface PortableTextProps {
  value: Parameters<typeof BasePortableText>[0]["value"];
  className?: string;
}

export function PortableText({ value, className = "" }: PortableTextProps) {
  if (!value) return null;
  return (
    <div className={`max-w-none ${className}`}>
      <BasePortableText value={value} components={components} />
    </div>
  );
}
