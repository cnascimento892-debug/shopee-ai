import { useState, useEffect, useRef } from "react";

const OR = "#FF6633";
const DARK = "#1a0800";
const CARD = "#fff8f5";
const GREEN = "#22c55e";

async function callClaude(system, user) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    const d = await res.json();
    return d.content?.map(b => b.text || "").join("") || "Erro ao gerar.";
  } catch { return "Erro de conexão."; }
}
