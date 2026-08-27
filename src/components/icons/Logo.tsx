import Image from "next/image";

/** The exact VedaAI logo mark, extracted from the Figma export. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image src="/illustrations/logo.png" alt="VedaAI" fill sizes={`${size}px`} className="object-contain" priority />
    </div>
  );
}
