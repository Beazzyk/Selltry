interface Props { size?: number; }

export function SelltryLogo({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#163D6E"/>
      <path d="M9 8 L14 8 L14 10 L11.6 10 L15.2 13.6 L13.8 15 L10.2 11.4 L10.2 13.8 L9 13.8 Z" fill="#FF6A1A"/>
      <path d="M23 24 L18 24 L18 22 L20.4 22 L16.8 18.4 L18.2 17 L21.8 20.6 L21.8 18.2 L23 18.2 Z" fill="#FFFFFF"/>
    </svg>
  );
}
