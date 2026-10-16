// ---------- tema (fonte: theme.example.json; fallback embutido p/ abrir via file://) ----------
const THEME0={slug:"espeto-do-ze",nome:"Espeto do Zé",logo:"",colors:{primary:"#C8321E",accent:"#F2A900",background:"#FFF8F0",surface:"#FFFFFF",text:"#2A1A14"},font:"Poppins",radius:16,taxaServico:10,mesas:30};
const lum=h=>{const [r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b};
const onColor=h=>lum(h)>.18?"#000":"#fff"; // trava de contraste (§2.3)
function applyTheme(t){const s=document.documentElement.style,c=t.colors;
 s.setProperty("--c-primary",c.primary);s.setProperty("--c-on-primary",onColor(c.primary));s.setProperty("--c-accent",c.accent);
 s.setProperty("--c-bg",c.background);s.setProperty("--c-surface",c.surface);s.setProperty("--c-text",c.text);
 s.setProperty("--radius",t.radius+"px");s.setProperty("--font",`'${t.font}',system-ui,sans-serif`);
 if(!document.getElementById("gf")){const l=document.createElement("link");l.id="gf";l.rel="stylesheet";document.head.append(l)}
 document.getElementById("gf").href=`https://fonts.googleapis.com/css2?family=${t.font.replace(/ /g,"+")}:wght@400;600;700;800&display=swap`;
 document.title=t.nome}
// ---------- dados + estado compartilhado (localStorage → cliente e gestão em abas diferentes sincronizam) ----------
const MENU0={cats:[{id:"espetos",nome:"Espetos"},{id:"petiscos",nome:"Petiscos"},{id:"bebidas",nome:"Bebidas"}],
 prods:[
 {id:1,cat:"espetos",nome:"Espeto de Picanha",d:"Picanha na brasa, 150g",p:16,e:"🥩",tag:"Mais pedido",ponto:1,on:1},
 {id:2,cat:"espetos",nome:"Espeto de Frango",d:"Peito com bacon",p:11,e:"🍗",ponto:0,on:1},
 {id:3,cat:"espetos",nome:"Espeto de Coração",d:"Coraçãozinho temperado",p:10,e:"🍢",on:1},
 {id:4,cat:"espetos",nome:"Queijo Coalho",d:"Com melaço",p:9,e:"🧀",on:1},
 {id:5,cat:"espetos",nome:"Linguiça Toscana",d:"Artesanal",p:10,e:"🌭",on:0},
 {id:6,cat:"petiscos",nome:"Mandioca Frita",d:"Porção 400g",p:24,e:"🍟",on:1},
 {id:7,cat:"petiscos",nome:"Torresmo",d:"Crocante, porção 300g",p:28,e:"🥓",on:1},
 {id:8,cat:"bebidas",nome:"Cerveja Long Neck",d:"Gelada",p:9,e:"🍺",on:1},
 {id:9,cat:"bebidas",nome:"Refrigerante Lata",d:"350ml",p:6,e:"🥤",on:1},
 {id:10,cat:"bebidas",nome:"Caipirinha",d:"Limão",p:18,e:"🍹",on:1}]};
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
let S={theme:load("theme",THEME0),menu:load("menu",MENU0),orders:load("orders",[]),bills:load("bills",[]),paid:load("paid",0)};
const save=()=>{for(const k in S)localStorage.setItem(k,JSON.stringify(S[k]))};
addEventListener("storage",()=>{S={theme:load("theme",THEME0),menu:load("menu",MENU0),orders:load("orders",[]),bills:load("bills",[]),paid:load("paid",0)};applyTheme(S.theme);render()});
const R=v=>"R$ "+v.toFixed(2).replace(".",",");
const $=(h)=>{const t=document.createElement("template");t.innerHTML=h.trim();return t.content.firstChild};
const app=document.getElementById("app");
const pic=p=>p.img?`<img src="${p.img}" alt="">`:p.e||"🍢";
const mkey=mesa=>S.orders.filter(o=>o.mesa==mesa&&!o.pago&&o.st!=="cancelado");
const ST={novo:"Novo",preparo:"Em preparo",pronto:"Pronto",entregue:"Entregue",cancelado:"Cancelado"};
// tenta ler theme.example.json (servido por http); senão usa o embutido
if(!localStorage.getItem("theme"))fetch("theme.example.json").then(r=>r.json()).then(j=>{S.theme={...THEME0,...j};applyTheme(S.theme);render()}).catch(()=>{});
