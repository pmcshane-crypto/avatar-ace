import { AvatarType } from '@/types/avatar';
import { getAvatarImage } from '@/lib/avatarImages';
import { cn } from '@/lib/utils';

interface BuddyAvatarProps {
  avatarType: AvatarType;
  avatarLevel: number;
  alt: string;
  className?: string;
  /** Extra classes on the wrapper div */
  wrapperClassName?: string;
}

/**
 * Reusable transparent-background buddy avatar.
 * Works on dark, light, gradient, and glassmorphism backgrounds.
 */
export function BuddyAvatar({
  avatarType,
  avatarLevel,
  alt,
  className,
  wrapperClassName,
}: BuddyAvatarProps) {
  const src = getAvatarImage(avatarType, avatarLevel);

  return (
    <div
      className={cn(
        'relative flex-shrink-0 bg-transparent border-0 shadow-none p-0 rounded-none',
        wrapperClassName,
      )}
      style={{ background: 'transparent' }}
    >
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-full object-contain', className)}
        style={{
          background: 'transparent',
          imageRendering: 'auto',
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.35))',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
}
