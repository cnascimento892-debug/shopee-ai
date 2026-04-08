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
function TabProdutos({ products, setProducts }) {
  const add = () => setProducts(p=>[...p,{id:Date.now(),name:"",link:"",category:"Outros",emoji:"📦"}]);
  const rm  = id => setProducts(p=>p.filter(x=>x.id!==id));
  const upd = (id,f,v) => setProducts(p=>p.map(x=>x.id===id?{...x,[f]:v,...(f==="category"?{emoji:categoryEmoji[v]}:{})}:x));
  return <div>
    <p style={{color:"#888",fontSize:13,marginBottom:12}}>Cadastre seus produtos com os links de afiliado da Shopee.</p>
    {products.map(p=>(
      <div key={p.id} style={{background:CARD,border:"1.5px solid #ffd4c2",borderRadius:14,padding:"14px 14px 10px",marginBottom:12}}>
        <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
          <span style={{fontSize:22}}>{p.emoji}</span>
          <input placeholder="Nome do produto" value={p.name} onChange={e=>upd(p.id,"name",e.target.value)} style={inp} />
        </div>
        <input placeholder="Link de afiliado Shopee (https://...)" value={p.link} onChange={e=>upd(p.id,"link",e.target.value)}
          style={{...inp,marginBottom:8,fontSize:12}} />
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={p.category} onChange={e=>upd(p.id,"category",e.target.value)} style={{...inp,flex:1,fontSize:12}}>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          {products.length>1&&<button onClick={()=>rm(p.id)} style={{background:"#fee2e2",border:"none",borderRadius:8,
            padding:"6px 12px",color:"#ef4444",fontWeight:700,cursor:"pointer"}}>✕</button>}
        </div>
      </div>
    ))}
    <button onClick={add} style={{width:"100%",background:OR,color:"#fff",border:"none",borderRadius:12,
      padding:12,fontWeight:800,fontSize:15,cursor:"pointer"}}>+ Adicionar Produto</button>
  </div>;
}

function TabGerar({ products, setQueue }) {
  const [tipo, setTipo] = useState("legenda");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const prods = products.filter(p=>p.name);

  const gerarTodos = async () => {
    if (!prods.length) return alert("Cadastre produtos primeiro!");
    setLoading(true); setProgress(0);
    const novos = [];
    for (let i=0;i<prods.length;i++) {
      const p = prods[i];
      const texto = await callClaude(SYSTEM[tipo],`Produto: ${p.name}\nCategoria: ${p.category}\nLink: ${p.link||"[link aqui]"}\n\nCrie o conteúdo.`);
      novos.push({id:Date.now()+i,produto:p.name,emoji:p.emoji,tipo,texto,link:p.link,criadoEm:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})});
      setProgress(i+1);
    }
    setQueue(q=>[...novos,...q]);
    setLoading(false);
  };

  const gerarUm = async (prod) => {
    setLoading(true);
    const texto = await callClaude(SYSTEM[tipo],`Produto: ${prod.name}\nCategoria: ${prod.category}\nLink: ${prod.link||"[link aqui]"}\n\nCrie o conteúdo.`);
    setQueue(q=>[{id:Date.now(),produto:prod.name,emoji:prod.emoji,tipo,texto,link:prod.link,
      criadoEm:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}, ...q]);
    setLoading(false);
  };

  return <div>
    <label style={lbl}>Tipo de conteúdo</label>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
      {TIPOS.map(t=>(
        <button key={t.value} onClick={()=>setTipo(t.value)} style={{
          background:tipo===t.value?OR:"#fff",color:tipo===t.value?"#fff":DARK,
          border:"2px solid "+(tipo===t.value?OR:"#ffd4c2"),borderRadius:10,padding:"10px 6px",
          fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>
          {t.label}
        </button>
      ))}
    </div>
    <button onClick={gerarTodos} disabled={loading} style={{width:"100%",background:loading?"#ffb399":OR,color:"#fff",
      border:"none",borderRadius:12,padding:14,fontWeight:900,fontSize:15,cursor:loading?"not-allowed":"pointer",marginBottom:8}}>
      {loading?`⏳ Gerando ${progress}/${prods.length}...`:`🚀 GERAR TUDO (${prods.length} produto${prods.length!==1?"s":""})`}
    </button>
    {loading&&<div style={{background:"#fff3f0",borderRadius:10,padding:"8px 12px",marginBottom:12}}>
      <div style={{background:"#ffd4c2",borderRadius:10,height:8,overflow:"hidden"}}>
        <div style={{background:OR,height:"100%",width:`${prods.length?(progress/prods.length)*100:0}%`,transition:"width .4s",borderRadius:10}} />
      </div>
      <p style={{margin:"6px 0 0",fontSize:12,color:"#888",textAlign:"center"}}>{progress} de {prods.length} concluídos</p>
    </div>}
    <p style={{color:"#aaa",fontSize:11,textAlign:"center",margin:"8px 0 4px",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>ou gerar individualmente</p>
    {prods.map(p=>(
      <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        background:CARD,border:"1.5px solid #ffd4c2",borderRadius:12,padding:"10px 12px",marginBottom:8}}>
        <span style={{fontSize:14,fontWeight:600}}>{p.emoji} {p.name}</span>
        <button onClick={()=>gerarUm(p)} disabled={loading} style={{background:OR,color:"#fff",border:"none",
          borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Gerar ✨</button>
      </div>
    ))}
  </div>;
}
