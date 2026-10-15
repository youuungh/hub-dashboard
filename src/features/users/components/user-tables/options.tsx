import { User, Crown, Shield } from "lucide-react";

export const ROLE_OPTIONS = [
  {
    label: "일반",
    value: "USER",
    icon: User,
  },
  {
    label: "크리에이터",
    value: "CREATOR",
    icon: Crown,
  },
  {
    label: "관리자",
    value: "ADMIN",
    icon: Shield,
  },
];
