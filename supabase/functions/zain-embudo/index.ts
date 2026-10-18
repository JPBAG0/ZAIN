// Lectura del embudo para el analista diario del corporativo.
// Solo devuelve agregados y folios. Token propio: la base guarda únicamente su huella SHA-256.
const URL_BASE = Deno.env.get("SUPABASE_URL")!;
const LLAVE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const fecha = /^\d{4}-\d{2}-\d{2}$/;

const json = (status: number, datos: unknown) =>
  new Response(JSON.stringify(datos), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

async function huella(texto: string) {
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(raw), (x) => x.toString(16).padStart(2, "0")).join("");
}

const rest = (ruta: string, init: RequestInit = {}) =>
  fetch(`${URL_BASE}/rest/v1/${ruta}`, {
    ...init,
    headers: {
      apikey: LLAVE,
      // Las llaves nuevas (sb_secret_…) no son JWT: solo van en apikey.
      ...(LLAVE.startsWith("eyJ") ? { Authorization: `Bearer ${LLAVE}` } : {}),
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "Usa POST." });
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!/^[a-f0-9]{64}$/.test(token)) return json(401, { error: "Token inválido." });
  const h = await huella(token);
  const ok = await rest(`zain_analistas?select=nombre&activo=eq.true&huella=eq.${h}`);
  if (!ok.ok) {
    console.error("zain_analistas", ok.status, await ok.text());
    return json(502, { error: "No se pudo validar el token." });
  }
  if (!(await ok.json()).length) return json(401, { error: "Token inválido." });

  let body: { desde?: string; hasta?: string; corte?: string };
  try { body = await req.json(); } catch { return json(400, { error: "JSON inválido." }); }
  const { desde, hasta, corte } = body;
  if (!fecha.test(desde || "") || !fecha.test(hasta || "") || (corte && !fecha.test(corte))) return json(400, { error: "Fechas AAAA-MM-DD." });
  const dias = (Date.parse(hasta!) - Date.parse(desde!)) / 86400000;
  if (!(dias >= 0 && dias <= 92)) return json(400, { error: "La ventana debe ser de 1 a 93 días." });

  const r = await rest("rpc/zain_embudo", {
    method: "POST",
    body: JSON.stringify({ p_desde: desde, p_hasta: hasta, ...(corte ? { p_corte: corte } : {}) }),
  });
  if (!r.ok) {
    console.error("zain_embudo", r.status, await r.text());
    return json(502, { error: "No se pudo leer el embudo." });
  }
  return json(200, await r.json());
});
