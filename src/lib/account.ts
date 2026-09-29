type AccountState = {
  status: string;
  banned: boolean;
  banExpires: Date | null;
};

// Same rule as the API: an account is blocked when an admin deactivated it
// or banned it, until the ban's expiry date (if it has one) has passed.
export function isAccountBlocked(user: AccountState) {
  if (user.status !== "active") return true;
  if (!user.banned) return false;
  return !user.banExpires || user.banExpires > new Date();
}

export const BLOCKED_ACCOUNT_MESSAGE =
  "Your account has been suspended. Please contact support if you think this is a mistake.";
