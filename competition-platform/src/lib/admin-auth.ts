const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "hackathon123";

export const ADMIN_SESSION_COOKIE = "hackathon_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export const ADMIN_USERNAME =
  process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME;
export const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

