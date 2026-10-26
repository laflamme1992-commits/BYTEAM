import Image from "next/image";
export function BrandMark({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      className={`brand-symbol ${className}`}
      src="/brand/byteam-byt.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
