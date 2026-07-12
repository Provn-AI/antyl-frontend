import { Flame, Trophy, Medal, Crown, LucideIcon } from "lucide-react";

export const BADGE_ICON_MAP: Record<string, LucideIcon> = {
  flame: Flame,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
};

export function BadgeIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = BADGE_ICON_MAP[icon] ?? Trophy;
  return <Icon className={className} />;
}