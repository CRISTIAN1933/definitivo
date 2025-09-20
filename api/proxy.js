// /api/proxy.js

/** Helper: lee el body crudo (Buffer) */
async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Solo se permite POST" });
  }

  try {
    // Determinamos el servidor destino
    const { server } = req.query;
    let targetUrl;
    if (server === "live") {
      targetUrl = "https://live.saohgdasregions.fun/activar.php";
    } else if (server === "deportes") {
      targetUrl = "https://deportes.ksdjugfsddeports.com/activar.php";
    } else {
      return res.status(400).json({ error: "Servidor no válido, usa ?server=live o ?server=deportes" });
    }

    // Leemos body crudo
    const rawBody = await readRawBody(req);

    // Construimos headers para el servidor destino
    const headers = {
      "Content-Type": req.headers["content-type"] || "application/x-www-form-urlencoded",
      "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
      "Referer": targetUrl,
      "Origin": new URL(targetUrl).origin,
      "Accept": "*/*",
      "Accept-Language": req.headers["accept-language"] || "es-ES,es;q=0.9",
    };

    // Reenviamos al servidor original
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: rawBody,
    });

    // Obtenemos la respuesta (texto/HTML)
    const text = await response.text();

    // Respondemos al cliente con el mismo status y body
    res.status(response.status).send(text);

  } catch (error) {
    console.error("Error en el proxy:", error);
    res.status(500).json({ error: "Error en el proxy", details: error.message });
  }
}
