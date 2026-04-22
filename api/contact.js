function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9+\-\s()]{8,20}$/.test(phone);
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  try {
    const {
      name = "",
      email = "",
      phone = "",
      eventDate = null,
      eventType = null,
      message = "",
      sourcePage = "contact",
    } = req.body || {};

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanPhone = String(phone).trim();

    if (!cleanName || !cleanEmail || !cleanPhone) {
      return res
        .status(400)
        .json({ ok: false, error: "Name, email, and phone are required." });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ ok: false, error: "Invalid email format." });
    }

    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ ok: false, error: "Invalid phone format." });
    }

    const lead = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      eventDate: eventDate || null,
      eventType: eventType || null,
      message: String(message || "").trim(),
      sourcePage: String(sourcePage || "contact"),
      createdAt: new Date().toISOString(),
    };

    console.log("EverVow lead:", JSON.stringify(lead));

    return res.status(201).json({ ok: true, id: lead.id });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Could not process lead." });
  }
};
