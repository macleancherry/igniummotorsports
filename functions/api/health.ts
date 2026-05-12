import { json } from "../_lib/http";

export async function onRequestGet() {
  return json({ ok: true, service: "ignium-motorsport", timestamp: new Date().toISOString() });
}
