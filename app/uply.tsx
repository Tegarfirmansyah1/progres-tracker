const UplyIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="/public/uply.png"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Garis zigzag menanjak */}
    <polyline points="3 17 9 11 13 15 21 5" />
    {/* Ujung panah */}
    <polyline points="14 5 21 5 21 12" />
  </svg>
);

export default UplyIcon;