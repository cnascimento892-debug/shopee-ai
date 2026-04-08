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
const TIPOS = [
  { value: "legenda", label: "📸 Instagram" },
  { value: "whatsapp", label: "💬 WhatsApp" },
  { value: "stories", label: "⚡ Stories" },
  { value: "descricao", label: "📝 Descrição" },
];

const SYSTEM = {
  legenda: "Especialista em marketing no Instagram. Crie legendas persuasivas com emojis, hashtags e chamada para ação. Inclua o link. Linguagem brasileira animada.",
  whatsapp: "Vendedor expert em WhatsApp. Crie mensagens curtas e persuasivas com emojis estratégicos. Destaque o benefício e inclua o link. Máx 200 palavras.",
  stories: "Expert em stories Instagram. Crie textos ultra-curtos (máx 3 frases) impactantes com emojis grandes e chamada clara.",
  descricao: "Redator de e-commerce. Crie descrição completa: headline, benefícios, prova social, urgência e link. Formatação para WhatsApp/Instagram.",
};

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const categoryEmoji = { "Moda":"👗","Eletrônicos":"📱","Casa":"🏠","Beleza":"💄","Esporte":"⚽","Infantil":"🧸","Outros":"📦" };
const categories = Object.keys(categoryEmoji);

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

function Spinner() {
  return <div style={{ display:"flex", justifyContent:"center", padding:16 }}>
    <div style={{ width:26,height:26,border:"3px solid #ffd4c2",borderTop:"3px solid #FF6633",borderRadius:"50%",animation:"spin .7s linear infinite" }} />
  </div>;
}

function CopyBtn({ text, small }) {
  const [ok, setOk] = useState(false);
  return <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(()=>setOk(false),1800); }}
    style={{ background:ok?GREEN:OR,color:"#fff",border:"none",borderRadius:8,
      padding:small?"4px 10px":"6px 14px",fontSize:small?11:12,fontWeight:700,cursor:"pointer",transition:"background .3s",whiteSpace:"nowrap" }}>
    {ok?"✓ Copiado!":"Copiar"}
  </button>;
}

function Badge({ children, color }) {
  return <span style={{ background:color+"22",color,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700 }}>{children}</span>;
}

const inp = { width:"100%",boxSizing:"border-box",background:"#fff",border:"1.5px solid #ffd4c2",
  borderRadius:10,padding:"10px 12px",fontSize:14,color:DARK,outline:"none",fontFamily:"inherit" };
const lbl = { display:"block",fontSize:11,fontWeight:700,color:"#aaa",marginBottom:4,textTransform:"uppercase",letterSpacing:.5 };
