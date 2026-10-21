const PUBLIC_SITE_ORIGIN = "https://tnconsultoria19-creator.github.io/worthit/";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const adminSession = await readAdminSession(req, env);

    // Protect the internal dashboard. The public website remains accessible without login.
    if (url.pathname === "/dashboard.html" && !adminSession) {
      return Response.redirect(new URL("/admin.html", url).toString(), 302);
    }
    if (url.pathname === "/admin.html" && adminSession) {
      return Response.redirect(new URL("/dashboard.html?view=overview", url).toString(), 302);
    }

    // Serve public pages and their static files from the published GitHub Pages site.
    // Keep the API on this Worker so existing D1/R2 services remain available.
    if (!url.pathname.startsWith("/api/")) {
      if (req.method !== "GET" && req.method !== "HEAD") {
        return new Response("Method not allowed", {
          status: 405,
          headers: { "Allow": "GET, HEAD", "Cache-Control": "no-store" }
        });
      }

      const relativePath = url.pathname.replace(/^\/+/, "");
      const target = new URL(relativePath, PUBLIC_SITE_ORIGIN);
      target.search = url.search;

      const headers = new Headers();
      for (const name of ["Accept", "Accept-Language", "If-None-Match", "If-Modified-Since", "Range"]) {
        const value = req.headers.get(name);
        if (value) headers.set(name, value);
      }

      try {
        const upstream = await fetch(target.toString(), {
          method: req.method,
          headers,
          redirect: "follow"
        });
        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.set("Cache-Control", "no-store");
        responseHeaders.set("X-WorthIt-Static-Source", "github-pages");
        return new Response(upstream.body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: responseHeaders
        });
      } catch (error) {
        return new Response("Website source is temporarily unavailable.", {
          status: 502,
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
        });
      }
    }

    const origin = req.headers.get("Origin") || "*";
    const h = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Content-Type,CF-Access-Authenticated-User-Email",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: h });
    const email = adminSession?.email || req.headers.get("CF-Access-Authenticated-User-Email");
    const admin = (env.ADMIN_EMAILS || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
    const role = adminSession || admin.includes((email || "").toLowerCase()) ? "Master Admin" : "Staff";

    try {
      if (url.pathname === "/api/admin/login" && req.method === "POST") {
        if (!env.ADMIN_EMAILS || !env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
          return j({
            error: "O acesso administrativo ainda não foi configurado. Defina ADMIN_EMAILS, ADMIN_PASSWORD e ADMIN_SESSION_SECRET nos secrets do Worker."
          }, h, 503);
        }
        let credentials;
        try {
          credentials = await req.json();
        } catch {
          return j({ error: "Pedido de autenticação inválido." }, h, 400);
        }
        const allowedEmails = env.ADMIN_EMAILS.split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
        const loginEmail = String(credentials.email || "").trim().toLowerCase();
        const loginPassword = String(credentials.password || "");
        if (!loginEmail || !loginPassword ||
            !allowedEmails.includes(loginEmail) ||
            loginPassword !== env.ADMIN_PASSWORD) {
          return j({ error: "Email ou palavra-passe inválidos." }, h, 401);
        }
        const token = await createAdminSession(loginEmail, env);
        const loginHeaders = {
          ...h,
          "Set-Cookie": "worthit_admin_session=" + token + "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800",
          "Cache-Control": "no-store"
        };
        return j({ ok: true, email: loginEmail, role: "Master Admin" }, loginHeaders);
      }

      if (url.pathname === "/api/admin/session" && req.method === "GET") {
        if (!adminSession) return j({ authenticated: false }, { ...h, "Cache-Control": "no-store" }, 401);
        return j({ authenticated: true, email: adminSession.email, role: "Master Admin" }, { ...h, "Cache-Control": "no-store" });
      }

      if (url.pathname === "/api/admin/logout" && req.method === "POST") {
        return j({ ok: true }, {
          ...h,
          "Set-Cookie": "worthit_admin_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
          "Cache-Control": "no-store"
        });
      }

      if (url.pathname === "/api/service-requests" && req.method === "POST") {
        let requestData;
        try {
          requestData = await req.json();
        } catch {
          return j({ error: "Pedido inválido." }, h, 400);
        }

        const clean = (value, max = 500) => String(value || "").trim().slice(0, max);
        const service = clean(requestData.service, 180);
        const name = clean(requestData.name, 160);
        const company = clean(requestData.company, 180);
        const requestEmail = clean(requestData.email, 200).toLowerCase();
        const phone = clean(requestData.phone, 60);
        const location = clean(requestData.location, 180);
        const details = clean(requestData.details, 4000);
        if (!service || !name || (!requestEmail && !phone) || !details) {
          return j({ error: "Preencha o nome, o serviço, a descrição e pelo menos um contacto (email ou telefone)." }, h, 400);
        }
        if (requestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestEmail)) {
          return j({ error: "O email indicado não parece válido." }, h, 400);
        }

        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS worthit_service_requests (
          id TEXT PRIMARY KEY,
          service TEXT NOT NULL,
          name TEXT NOT NULL,
          company TEXT,
          email TEXT,
          phone TEXT,
          location TEXT,
          details TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Novo',
          created_at TEXT NOT NULL
        )`).run();

        const requestId = "WR-" + crypto.randomUUID().split("-")[0].toUpperCase();
        await env.DB.prepare("INSERT INTO worthit_service_requests (id, service, name, company, email, phone, location, details, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Novo', datetime('now'))")
          .bind(requestId, service, name, company || null, requestEmail || null, phone || null, location || null, details).run();
        return j({ ok: true, id: requestId }, { ...h, "Cache-Control": "no-store" }, 201);
      }

      if (url.pathname === "/api/service-requests" && req.method === "GET") {
        if (!adminSession) return j({ error: "Autenticação administrativa necessária." }, h, 401);
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS worthit_service_requests (
          id TEXT PRIMARY KEY,
          service TEXT NOT NULL,
          name TEXT NOT NULL,
          company TEXT,
          email TEXT,
          phone TEXT,
          location TEXT,
          details TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Novo',
          created_at TEXT NOT NULL
        )`).run();
        const requests = await env.DB.prepare("SELECT * FROM worthit_service_requests ORDER BY created_at DESC LIMIT 200").all();
        return j({ requests: requests.results || [] }, { ...h, "Cache-Control": "no-store" });
      }

      if (url.pathname === "/api/health") return j({ ok: true, role, email: email || null }, h);
      if (!email) return j({ error: "Authentication required" }, h, 401);

      if (url.pathname === "/api/bootstrap" && req.method === "GET") {
        const data = {};
        for (const t of ["clients", "leads", "requests", "projects", "sites", "tasks", "documents", "packages", "users", "audit"]) {
          const table = t === "requests" ? "site_requests" : t;
          const r = await env.DB.prepare("SELECT * FROM " + table + " ORDER BY created_at DESC").all();
          data[t] = r.results || [];
        }
        return j({ role, data }, h);
      }

      if (url.pathname === "/api/sync" && req.method === "POST") {
        const payload = await req.json();
        if (!payload || typeof payload !== "object") return j({ error: "Invalid payload" }, h, 400);
        if (!["Master Admin", "Admin", "Manager", "Staff"].includes(role)) return j({ error: "Forbidden" }, h, 403);
        await env.DB.prepare("INSERT INTO audit(id,action,user,module,created_at) VALUES(?,?,?,?,datetime('now'))")
          .bind(crypto.randomUUID(), "State sync via dashboard", email, "System").run();
        return j({ ok: true }, h);
      }

      if (url.pathname === "/api/site-requests" && req.method === "POST") {
        const x = await req.json();
        await env.DB.prepare("INSERT INTO site_requests(id,client,region,municipality,sites,status,assigned,created_at) VALUES(?,?,?,?,?,?,?,?)")
          .bind(x.id, x.client, x.region, x.municipality, x.sites, x.status, x.assigned, x.created || new Date().toISOString()).run();
        return j({ ok: true, id: x.id }, h);
      }

      if (url.pathname === "/api/me" && req.method === "GET") return j({ email, role }, h);
      return j({ error: "Route not found" }, h, 404);
    } catch (e) {
      return j({ error: e.message }, h, 500);
    }
  }
};

function j(x, h, status = 200) {
  return new Response(JSON.stringify(x), { status, headers: h });
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(value) {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  base64 += "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function sessionSigningKey(env) {
  if (!env.ADMIN_SESSION_SECRET) return null;
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.ADMIN_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function createAdminSession(email, env) {
  const key = await sessionSigningKey(env);
  if (!key) throw new Error("Admin session signing secret is not configured.");
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + 28800
  })));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  return payload + "." + base64UrlEncode(signature);
}

async function readAdminSession(req, env) {
  try {
    const key = await sessionSigningKey(env);
    if (!key) return null;
    const cookieHeader = req.headers.get("Cookie") || "";
    const cookie = cookieHeader.split(";").map(v => v.trim()).find(v => v.startsWith("worthit_admin_session="));
    if (!cookie) return null;
    const token = cookie.slice("worthit_admin_session=".length);
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const payloadBytes = base64UrlDecode(parts[0]);
    const signatureBytes = base64UrlDecode(parts[1]);
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(parts[0]));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (!payload.email || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    const allowedEmails = (env.ADMIN_EMAILS || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
    if (!allowedEmails.includes(String(payload.email).toLowerCase())) return null;
    return { email: String(payload.email).toLowerCase(), exp: payload.exp };
  } catch {
    return null;
  }
}
