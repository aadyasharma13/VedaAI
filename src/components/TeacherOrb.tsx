import Image from "next/image";

/**
 * The exact teacher illustration from the Figma export (rings, avatar, and
 * orbiting badge icons are all baked into this single image asset).
 */
export function TeacherOrb() {
  return (
    <div className="relative w-[180px] h-[180px] mx-auto">
      <Image
        src="/illustrations/teacher-orb.png"
        alt="Teacher illustration"
        fill
        sizes="180px"
        className="object-contain"
        priority
      />
    </div>
  );
}
