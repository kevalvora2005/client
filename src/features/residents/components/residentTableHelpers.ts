import { formatDateOnly } from "../../../utils/formatDate";

const AVATAR_COLORS = [
  { bg: "#e8eaf6", color: "#3949ab" },
  { bg: "#e3f2fd", color: "#1565c0" },
  { bg: "#fce4ec", color: "#c62828" },
  { bg: "#e8f5e9", color: "#2e7d32" },
  { bg: "#fff3e0", color: "#e65100" },
  { bg: "#f3e5f5", color: "#6a1b9a" },
  { bg: "#e0f2f1", color: "#00695c" },
];

export const getAvatarColor = (name: string) => {
  const index =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export const formatDate = (date: string | null | undefined) =>
  date ? formatDateOnly(date) : "—";