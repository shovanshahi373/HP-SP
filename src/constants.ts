export const ICON_URL = {
  POCKET:
    "https://ik.imagekit.io/0j9zv6zma/1d65518798721ce70b8df31b228a87d3d43f91bc73fdf0dfe11742a15802c719.png?updatedAt=1753161107790",
  HEALTH:
    "https://ik.imagekit.io/0j9zv6zma/health-medical-heartbeat-pulse-vector.jpg?updatedAt=1753164674624",
  SERVER:
    "https://ik.imagekit.io/0j9zv6zma/7069924-removebg-preview.png?updatedAt=1753182733293",
  SERVER_ERROR:
    "https://ik.imagekit.io/0j9zv6zma/server-maintenance-icon-support-maintenance-icon-11553493082yajoicsyk9-removebg-preview.png?updatedAt=1753182601121",
} as const;

export const PACK_PROPS = {
  ID: "godpack_id",
  NICKNAME: "nickname",
  SHARES_IN: "shares_in",
  PEOPLE_JOINED: "people_joined",
} as const;

export const COLORS = {
  SUCCESS: "#00FA9A",
  ERROR: "#ED2939",
  WARNING: "#ED2939",
  MUTED: "#E5E4E2",
} as const;

export const ALERTS = {
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  SUCCESS: "success",
} as const;

export const alertToTagMap = {
  [ALERTS.ERROR]: "bangbang",
  [ALERTS.WARNING]: "warning",
  [ALERTS.INFO]: "information_source",
  [ALERTS.SUCCESS]: "white_check_mark",
} as const;

export const NODE_ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TESTING: "testing",
};

export const INFISICAL_ENV = {
  [NODE_ENV.DEVELOPMENT]: "dev",
  [NODE_ENV.TESTING]: "stg",
  [NODE_ENV.PRODUCTION]: "prod",
};

export const SECRET = {};
