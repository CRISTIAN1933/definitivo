import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo se permite POST" });
  }

  try {
    const targetUrl = "https://live.saohgdasregions.fun/activar.php";

    // reenviamos el body tal cual al servidor original
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": req.headers["content-type"] || "application/x-www-form-urlencoded",
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
      },
      body: req.body
    });

    const text = await response.text();

    res.status(response.status).send(text);

  } catch (error) {
    res.status(500).json({ error: "Error en el proxy", details: error.message });
  }
}
