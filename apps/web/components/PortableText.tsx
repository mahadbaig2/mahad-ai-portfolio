import React from 'react';
import { PortableText as BasePortableText, type PortableTextComponents } from '@portabletext/react';
import Image from 'next/image';
import { urlForImage } from '@/lib/sanity/image';

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-relaxed text-neutral-700 mb-4">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-neutral-900 mt-8 mb-4 tracking-tight border-b border-neutral-100 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-medium text-neutral-900 mt-6 mb-3 tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-medium text-neutral-900 mt-4 mb-2">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-neutral-300 pl-4 my-4 italic text-neutral-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-5 mb-4 space-y-1.5 text-neutral-700 text-base">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-5 mb-4 space-y-1.5 text-neutral-700 text-base">
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
      <strong className="font-semibold text-neutral-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-neutral-800">{children}</em>,
    code: ({ children }) => (
      <code className="font-mono text-xs bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const href = value?.href || '#';
      const isExternal = href.startsWith('http') || href.startsWith('mailto');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors"
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
      const imageUrl = urlForImage(value).width(1200).url();
      return (
        <figure className="my-6">
          <div className="relative aspect-video w-full overflow-hidden rounded border border-neutral-200 bg-neutral-50">
            <Image
              src={imageUrl}
              alt={value.alt || 'Content image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-xs text-neutral-500 mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    codeBlock: ({ value }) => {
      return (
        <div className="my-6 overflow-hidden rounded border border-neutral-200 bg-neutral-900 text-neutral-100">
          {(value.filename || value.language) && (
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-1.5 text-xs text-neutral-400 font-mono">
              <span>{value.filename || ''}</span>
              <span className="uppercase text-[10px] tracking-wider text-neutral-500">
                {value.language || 'code'}
              </span>
            </div>
          )}
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
            <code>{value.code}</code>
          </pre>
        </div>
      );
    },
    callout: ({ value }) => {
      const tone = value?.tone || 'info';
      const borderClass =
        tone === 'warning' ? 'border-neutral-700' : 'border-neutral-400';
      return (
        <div
          className={`my-4 border-l-2 ${borderClass} bg-neutral-50 px-4 py-3 text-sm text-neutral-800 rounded-r`}
        >
          <p className="leading-relaxed">{value.text}</p>
        </div>
      );
    },
  },
};

interface PortableTextProps {
  value: Parameters<typeof BasePortableText>[0]['value'];
  className?: string;
}

export function PortableText({ value, className = '' }: PortableTextProps) {
  if (!value) return null;
  return (
    <div className={`prose-neutral max-w-none ${className}`}>
      <BasePortableText value={value} components={components} />
    </div>
  );
}
