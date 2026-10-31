import * as AvatarPrimitive from "@radix-ui/react-avatar";

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
}

// Radix Avatar keeps the initials while the image is missing, loading or broken, unlike a plain <img>
const Avatar = ({ name, src, size = 40 }: AvatarProps) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <AvatarPrimitive.Root
      className="rounded-full flex items-center justify-center text-white font-semibold overflow-hidden shrink-0"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: `hsl(${(name.length * 10) % 360}, 70%, 50%)`,
      }}
    >
      {src && <AvatarPrimitive.Image src={src} alt={name} className="w-full h-full object-cover" />}
      <AvatarPrimitive.Fallback className="flex items-center justify-center w-full h-full" delayMs={src ? 300 : 0}>
        <span style={{ fontSize: `${size / 2}px`, lineHeight: 1 }}>{initials}</span>
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};

export default Avatar;
