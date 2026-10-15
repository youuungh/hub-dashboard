import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// 앱 ic_profile_placeholder와 같은 그림
function ProfilePlaceholder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" className={cn("size-full", className)}>
      <circle cx="250" cy="250" r="250" fill="#D9D9D9" />
      <path
        d="M92.31,444C105.84,377.42 171.29,326.92 250,326.92C328.71,326.92 394.16,377.42 407.69,444C364.67,479.01 309.79,500 250,500C190.21,500 135.33,479.01 92.31,444Z"
        fill="#ffffff"
      />
      <circle cx="248.4" cy="216.35" r="78.53" fill="#ffffff" />
    </svg>
  );
}

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

// 없거나 실패하면 앱과 같은 placeholder
export function UserAvatar({ src, alt, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("bg-muted", className)}>
      {src && <AvatarImage src={src} alt={alt ?? ""} />}
      <AvatarFallback className="bg-transparent p-0">
        <ProfilePlaceholder />
      </AvatarFallback>
    </Avatar>
  );
}
