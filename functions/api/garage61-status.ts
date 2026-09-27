import { json } from "../_lib/http";
import type { Context } from "../_lib/types";

// TODO: confirm the real Garage61 endpoint path, auth header format, and
// response shape once API docs/keys are available. This is a placeholder
// implementation that fails safe (returns "nobody active") until then.
export async function onRequestGet(context: Context) {
  const baseUrl = context.env.GARAGE61_API_BASE_URL;
  const apiKey = context.env.GARAGE61_API_KEY;

  if (!baseUrl || !apiKey) {
    return json({ activeDrivers: [] });
  }

  try {
    // TODO: replace with the real Garage61 endpoint for "drivers currently
    // in an active session".
    const response = await fetch(`${baseUrl}/api/v1/sessions/active`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    });

    if (!response.ok) {
      return json({ activeDrivers: [] });
    }

    // TODO: map Garage61's real response shape to { activeDrivers: [{ name }] }.
    const data = (await response.json()) as { activeDrivers?: Array<{ name: string }> };
    return json({ activeDrivers: data.activeDrivers ?? [] });
  } catch {
    return json({ activeDrivers: [] });
  }
}
