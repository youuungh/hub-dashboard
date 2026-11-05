import {
  IconActivity,
  IconAlertTriangle,
  IconCalendarTime,
  IconCommand,
  IconDeviceLaptop,
  IconFileText,
  IconLayoutDashboard,
  IconLoader2,
  IconLogin2,
  IconMoon,
  IconProps,
  IconSun,
  IconUser,
  IconUserEdit,
} from "@tabler/icons-react";

export type Icon = React.ComponentType<IconProps>;

export const Icons = {
  dashboard: IconLayoutDashboard,
  activity: IconActivity,
  logo: IconCommand,
  login2: IconLogin2,
  spinner: IconLoader2,
  post: IconFileText,
  userPen: IconUserEdit,
  schedule: IconCalendarTime,
  warning: IconAlertTriangle,
  user: IconUser,
  sun: IconSun,
  moon: IconMoon,
  laptop: IconDeviceLaptop,
};
