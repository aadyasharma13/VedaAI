// Icons sourced directly from the Figma export SVGs, converted to use
// currentColor so they inherit the active/inactive nav item text color.
//
// The original exports had inconsistent viewBoxes relative to their actual
// glyph content — some (My Library, Settings/Classroom) came from Figma with
// a filter's expanded bounding box baked into the viewBox, leaving the real
// icon shape small and off-center. Each viewBox below is cropped tightly to
// the glyph's real rendered bounding box (measured via getBBox), with a
// small consistent padding, so every icon fills its box at the same visual
// weight when rendered at a shared `size`.

type IconProps = { size?: number; className?: string };

export function HomeIcon({ size = 19, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className}>
      <path d="M25.4998 19.6667H19.6665V25.5H25.4998V19.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.3333 19.6667H10.5V25.5H16.3333V19.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.4998 10.5H19.6665V16.3333H25.4998V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.3333 10.5H10.5V16.3333H16.3333V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExamsIcon({ size = 19, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="1.33 -0.33 17.33 20.67" fill="none" className={className}>
      <path
        d="M13.3335 3.33334H15.0002C15.4422 3.33334 15.8661 3.50894 16.1787 3.8215C16.4912 4.13406 16.6668 4.55798 16.6668 5.00001V16.6667C16.6668 17.1087 16.4912 17.5326 16.1787 17.8452C15.8661 18.1577 15.4422 18.3333 15.0002 18.3333H5.00016C4.55814 18.3333 4.13421 18.1577 3.82165 17.8452C3.50909 17.5326 3.3335 17.1087 3.3335 16.6667V5.00001C3.3335 4.55798 3.50909 4.13406 3.82165 3.8215C4.13421 3.50894 4.55814 3.33334 5.00016 3.33334H6.66683"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M12.4998 1.66666H7.49984C7.0396 1.66666 6.6665 2.03975 6.6665 2.49999V4.16666C6.6665 4.62689 7.0396 4.99999 7.49984 4.99999H12.4998C12.9601 4.99999 13.3332 4.62689 13.3332 4.16666V2.49999C13.3332 2.03975 12.9601 1.66666 12.4998 1.66666Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function LibraryIcon({ size = 19, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="11.67 7.67 20.67 20.66" fill="none" className={className}>
      <path
        d="M29.6752 21.2417C29.145 22.4954 28.3158 23.6002 27.2601 24.4594C26.2043 25.3187 24.9541 25.9062 23.6189 26.1707C22.2836 26.4351 20.9039 26.3685 19.6003 25.9765C18.2967 25.5845 17.109 24.8792 16.141 23.9222C15.173 22.9652 14.4542 21.7856 14.0474 20.4866C13.6406 19.1876 13.5581 17.8087 13.8073 16.4705C14.0565 15.1323 14.6298 13.8755 15.4769 12.81C16.324 11.7445 17.4192 10.9028 18.6668 10.3583"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M30.3333 18C30.3333 16.9056 30.1178 15.822 29.699 14.811C29.2802 13.7999 28.6664 12.8813 27.8926 12.1074C27.1187 11.3336 26.2001 10.7198 25.189 10.301C24.178 9.8822 23.0943 9.66666 22 9.66666V18H30.3333Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClassroomIcon({ size = 19, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="9.6 9.6 24.8 18.8" fill="none" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30.0053 12C31.1069 12 32 12.8674 32 13.9373V24.0627C32 24.8063 31.5687 25.452 30.9357 25.7767C30.7114 25.0842 30.552 24.599 30.4574 24.321C30.403 24.1608 30.3777 24.011 30.2979 23.8819C30.2236 23.7617 30.1006 23.6182 29.9791 23.4747L29.9521 23.4428C29.5516 22.968 29.0414 22.3553 28.609 21.8284C28.1946 21.3233 27.8524 20.8964 27.7181 20.7823C27.3989 20.5111 26.9468 20.214 26.2686 20.214H21.6676C21.6249 20.2067 21.5303 20.1911 21.4149 20.1494C20.9189 19.9705 19.8848 19.5195 19.367 19.3099C18.2147 18.1359 17.3503 17.2533 16.7739 16.6624C16.7264 16.6136 16.6112 16.494 16.4283 16.3035C16.2039 16.0698 15.8311 16.0459 15.5771 16.2491C15.3251 16.4507 15.2832 16.8101 15.4825 17.0613C17.2906 19.3399 18.2176 20.5028 18.2633 20.5498C18.3747 20.6643 18.7067 20.877 19.1144 21.1439C19.5341 21.4188 20.0335 21.75 20.4176 22.0092C20.7751 22.2505 20.9761 22.3192 21.016 22.655C21.1039 23.3955 21.2103 24.5105 21.3351 26H13.9947C12.8931 26 12 25.1326 12 24.0627V13.9373C12 12.8674 12.8931 12 13.9947 12H30.0053ZM27.7979 23.7915C27.9066 23.7819 28.0276 23.915 28.0771 23.9594C28.2486 24.1131 28.3003 24.1721 28.4096 24.2694C28.5691 24.4114 28.7331 24.5764 28.7553 24.6051C28.9727 24.99 29.2919 25.7639 29.4073 26L27.4654 26C27.5489 25.0617 27.6021 24.459 27.625 24.1919C27.6516 23.8819 27.6891 23.8011 27.7979 23.7915ZM24.4734 15.0609C23.1955 15.0609 22.1596 16.067 22.1596 17.3081C22.1596 18.5492 23.1955 19.5553 24.4734 19.5553C25.7513 19.5553 26.7872 18.5492 26.7872 17.3081C26.7872 16.067 25.7513 15.0609 24.4734 15.0609Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AssignmentsIcon({ size = 19, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="2.37 0.7 15.27 18.6" fill="none" className={className}>
      <path d="M7.5 14.1667H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 10.8333H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 7.5H8.33333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M4.1665 5C4.1665 3.61929 5.28579 2.5 6.6665 2.5H10.9761C11.4182 2.5 11.8421 2.67559 12.1547 2.98816L15.345 6.17851C15.6576 6.49107 15.8332 6.915 15.8332 7.35702V15C15.8332 16.3807 14.7139 17.5 13.3332 17.5H6.6665C5.28579 17.5 4.1665 16.3807 4.1665 15V5Z"
        stroke="currentColor" strokeWidth="2"
      />
      <path d="M10.8335 2.5V4.16667C10.8335 6.00762 12.3259 7.5 14.1668 7.5H15.8335" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
