import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const PORT = Number(process.env.WEB_PORT || 5173);
const API_PORT = Number(process.env.PORT || 8787);
const distDir = path.join(process.cwd(), "dist");

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
]);

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" });
  response.end(text);
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://127.0.0.1:${PORT}`);

    if (url.pathname.startsWith("/api/")) {
      const body = await readBody(request);
      const upstream = await fetch(`http://127.0.0.1:${API_PORT}${url.pathname}${url.search}`, {
        body: request.method === "GET" || request.method === "HEAD" ? undefined : body,
        headers: {
          "content-type": request.headers["content-type"] || "application/json",
        },
        method: request.method,
      });
      const buffer = Buffer.from(await upstream.arrayBuffer());
      response.writeHead(upstream.status, {
        "access-control-allow-origin": "*",
        "content-type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
      });
      response.end(buffer);
      return;
    }

    const safePath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    let filePath = path.normalize(path.join(distDir, safePath || "index.html"));
    if (!filePath.startsWith(distDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, "index.html");
    }

    if (!fs.existsSync(filePath)) {
      sendText(response, 404, "请先运行页面打包。");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, { "content-type": mimeTypes.get(ext) || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(response);
  } catch (error) {
    sendText(response, 500, error.message || "server error");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Art guidance web running at http://127.0.0.1:${PORT}`);
});
