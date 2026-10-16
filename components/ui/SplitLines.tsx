import type { ElementType, ReactNode } from 'react';

type Props = {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  /** Opt into the scroll-triggered line reveal from useSilkReveal. */
  reveal?: boolean;
  lineClassName?: string;
  id?: string;
};

/** Headline split into masked lines — each `.line-inner` slides up from 110% inside an overflow-hidden mask. */
export function SplitLines({ lines, as: Tag = 'h2', className, reveal = true, lineClassName = '', id }: Props) {
  return (
    <Tag id={id} className={className} {...(reveal ? { 'data-silk-lines': '' } : {})}>
      {lines.map((line, i) => (
        <span key={i} className="masked-line">
          <span className={`line-inner block ${lineClassName}`}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
