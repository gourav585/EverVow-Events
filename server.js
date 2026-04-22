const fs = require("fs");
const path = require("path");
const http = require("http");

const host = "127.0.0.1";
const port = process.env.PORT ? Number(process.env.PORT) : 3100;
const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const leadsFile = path.join(dataDir, "leads.jsonl");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(leadsFile)) {
  fs.writeFileSync(leadsFile, "", "utf8");
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function validateLead(data) {
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const phone = String(data.phone || "").trim();
  const eventDate = data.eventDate ? String(data.eventDate).trim() : null;
  const eventType = data.eventType ? String(data.eventType).trim() : null;
  const message = data.message ? String(data.message).trim() : "";
  const sourcePage = data.sourcePage ? String(data.sourcePage).trim() : "contact";
  const createdAt = data.createdAt
    ? String(data.createdAt)
    : new Date().toISOString();

  if (!name || !email || !phone) {
    return { ok: false, message: "Name, email, and phone are required." };
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = /^[0-9+\-\s()]{8,20}$/.test(phone);
  if (!emailValid) return { ok: false, message: "Invalid email format." };
  if (!phoneValid) return { ok: false, message: "Invalid phone format." };

  return {
    ok: true,
    value: {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      phone,
      eventDate,
      eventType,
      message,
      sourcePage,
      createdAt,
    },
  };
}

function resolveFilePath(urlPath) {
  const safePath = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = safePath === "/" ? "/index.html" : safePath;
  const absolutePath = path.join(rootDir, relativePath);

  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }
  return absolutePath;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.url === "/api/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true, service: "evervow-api" });
    return;
  }

  if (req.url === "/api/contact" && req.method === "POST") {
    try {
      const rawBody = await parseBody(req);
      const parsed = JSON.parse(rawBody || "{}");
      const validation = validateLead(parsed);
      if (!validation.ok) {
        sendJson(res, 400, { ok: false, error: validation.message });
        return;
      }

      fs.appendFileSync(leadsFile, `${JSON.stringify(validation.value)}\n`, "utf8");
      sendJson(res, 201, { ok: true, id: validation.value.id });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: "Could not save lead." });
    }
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  const filePath = resolveFilePath(req.url || "/");
  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on("error", () => {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Server Error");
    });
  });
});

server.listen(port, host, () => {
  console.log(`EverVow server running at http://${host}:${port}`);
});
