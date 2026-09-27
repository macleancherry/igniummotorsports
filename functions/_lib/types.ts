export type Env = {
  DB: D1Database;
  ADMIN_TOKEN?: string;
  GARAGE61_API_BASE_URL?: string;
  GARAGE61_API_KEY?: string;
};

export type Context = {
  request: Request;
  env: Env;
  params: Record<string, string>;
};
