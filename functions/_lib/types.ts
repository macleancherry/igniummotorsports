export type Env = {
  DB: D1Database;
  ADMIN_TOKEN?: string;
  TIMING_INGEST_TOKEN?: string;
  GRIDREP_API_BASE_URL?: string;
  GRIDREP_API_TOKEN?: string;
  GRIDREP_TEAM_DRIVER_CUSTOMER_IDS?: string;
};

export type Context = {
  request: Request;
  env: Env;
  params: Record<string, string>;
};
