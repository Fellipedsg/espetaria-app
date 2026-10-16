// ---------- PAINEL DE GESTÃO ----------
let tab="pedidos", mesaSel=null, edit=null;
function gestao(){
 const T=S.theme,nav=[["pedidos","Pedidos"],["mesas","Mesas"],["cardapio","Cardápio"],["aparencia","Aparência"]];
 let h=`<div class="adm"><aside class="side">${T.logo?`<img src="${T.logo}" alt="${T.nome}">`:`<b style="font-size:20px;margin-bottom:16px">${T.nome}</b>`}${nav.map(([k,n])=>`<button class="${tab===k?"on":""}" data-a="nav" data-k="${k}">${n}</button>`).join("")}</aside><main class="main">`;
 if(tab==="pedidos"){const nn=S.orders.filter(o=>o.st==="novo").length;
  h=h.replace('<main class="main">',`<main class="main"><header class="topbar"><input class="search" placeholder="🔍 Buscar por mesa, pedido ou item" value="${q}" data-a="search"><span class="bell" title="Novos pedidos">🔔${nn?`<i>${nn}</i>`:""}</span><span class="user"><b>Caixa</b><small>${T.nome}</small></span></header>`);
  h+=`<div id="board">${board()}</div>`}
 if(tab==="mesas"){h+=`<h2>Mesas</h2><div class="tiles">`+Array.from({length:T.mesas},(_,i)=>{const n=String(i+1),o=mkey(n),b=S.bills.includes(n);
  return `<button class="tile ${b?"bill":o.length?"oc1":""}" data-a="mesa" data-n="${n}">Mesa ${n}<small>${b?"🧾 Pediu a conta":o.length?"Ocupada":"Livre"}</small></button>`}).join("")+`</div>`;
  if(mesaSel){const its=mkey(mesaSel).flatMap(o=>o.itens),sub=its.reduce((a,i)=>a+i.p*i.q,0),tx=sub*T.taxaServico/100;
   h+=`<div class="panel"><h3>Checkout — Mesa ${mesaSel}</h3>${its.map(i=>`<div class="row"><span>${i.q}× ${i.nome}</span><span>${R(i.p*i.q)}</span></div>`).join("")||"<p>Sem consumo.</p>"}
   <div class="row"><span>Subtotal</span><span>${R(sub)}</span></div><div class="row"><span>Serviço ${T.taxaServico}%</span><span>${R(tx)}</span></div><div class="row"><b>Total</b><b>${R(sub+tx)}</b></div><br>
   <div style="display:flex;gap:8px">${["Pix","Crédito","Débito","Dinheiro"].map(f=>`<button class="chip" data-a="paymethod">${f}</button>`).join("")}</div><br><button class="btn full" data-a="close" ${its.length?"":"disabled"}>Fechar mesa</button></div>`}}
 if(tab==="cardapio"){const cn=id=>(S.menu.cats.find(c=>c.id===id)||{}).nome||id;
  h+=`<div class="r" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h2 style="margin:0">Cardápio</h2><button class="btn" data-a="novop">+ Novo item</button></div><table><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Disponível</th><th></th></tr>`+S.menu.prods.map(p=>`<tr><td><span class="th">${pic(p)}</span> <b>${p.nome}</b><br><small style="color:var(--muted)">${p.d||""}</small></td><td>${cn(p.cat)}</td><td><input type="number" step="0.5" value="${p.p}" data-a="price" data-i="${p.id}"></td><td><input type="checkbox" ${p.on?"checked":""} data-a="avail" data-i="${p.id}" style="width:22px;height:22px"></td><td style="white-space:nowrap"><button class="btn sm sec" data-a="editp" data-i="${p.id}">✏️ Editar</button> <button class="btn sm sec" data-a="delp" data-i="${p.id}" style="color:var(--danger)">🗑 Remover</button></td></tr>`).join("")+`</table>${S.menu.prods.length?"":"<p class='vz'>Nenhum item. Clique em “+ Novo item”.</p>"}`}
 if(tab==="aparencia"){const c=T.colors;h+=`<h2>Aparência</h2><div class="theme"><label>Nome<input value="${T.nome}" data-a="tnome"></label><label>Logo (PNG)<span style="display:flex;gap:8px;align-items:center">${T.logo?`<img src="${T.logo}" style="height:32px;max-width:90px;object-fit:contain"><button class="btn sm sec" data-a="rmlogo">Remover</button>`:""}<input type="file" accept="image/png,image/*" data-a="logofile" style="max-width:150px"></span></label>`+
  [["primary","Cor principal"],["accent","Destaque"],["background","Fundo"],["surface","Cards"],["text","Texto"]].map(([k,n])=>`<label>${n}<input type="color" value="${c[k]}" data-a="color" data-k="${k}"></label>`).join("")+
  `<label>Raio<input type="range" min="0" max="28" value="${T.radius}" data-a="radius"></label><label>Fonte<select data-a="font">${["Poppins","Inter","Montserrat","Oswald","Lora"].map(f=>`<option ${f===T.font?"selected":""}>${f}</option>`).join("")}</select></label></div>
  <p style="margin:16px 0;color:var(--muted)">Mudanças aplicam ao vivo (abra o app do cliente em outra aba). Cor do texto sobre o botão é calculada automaticamente. Para exportar: <button class="btn sm sec" data-a="export">copiar theme.json</button></p><button class="btn sm sec" data-a="reset">Restaurar demo</button>`}
 if(edit){const p=edit;h+=`<div class="modal-bg" data-a="cancelp"><div class="modal"><h3>${p.id?"Editar item":"Novo item"}</h3>
  <label>Nome<input id="f-nome" value="${(p.nome||"").replace(/"/g,"&quot;")}"></label>
  <label>Descrição<input id="f-d" value="${(p.d||"").replace(/"/g,"&quot;")}"></label>
  <div class="two"><label>Categoria<select id="f-cat">${S.menu.cats.map(c=>`<option value="${c.id}" ${c.id===p.cat?"selected":""}>${c.nome}</option>`).join("")}</select></label>
  <label>Preço (R$)<input id="f-p" type="number" step="0.5" min="0" value="${p.p??""}"></label></div>
  <label>Foto do item<span style="display:flex;gap:10px;align-items:center"><span id="f-prev" class="prev">${pic(p)}</span><input type="file" accept="image/*" data-a="imgfile" style="max-width:170px"><button type="button" class="btn sm sec" data-a="rmimg">Remover</button></span></label>
  <label>Selo (opcional)<input id="f-tag" value="${p.tag||""}" placeholder="Mais pedido"></label>
  <label class="chk"><input type="checkbox" id="f-ponto" ${p.ponto?"checked":""}> Perguntar ponto da carne</label>
  <label class="chk"><input type="checkbox" id="f-on" ${p.on!==0?"checked":""}> Disponível</label>
  <div class="r" style="display:flex;gap:8px;margin-top:16px"><button class="btn sec" style="flex:1" data-a="cancelp">Cancelar</button><button class="btn" style="flex:1" data-a="savep">Salvar</button></div></div></div>`}
 return h+"</main></div>"}
let q="", filtro="todos";
const COLS=[["novo","Na fila","📋","#6B2FA0"],["preparo","Preparando","🍳","#E07B00"],["pronto","Pronto","🔔","#1F9D55"]];
const hm=t=>new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
const cnt=s=>S.orders.filter(o=>o.st===s).length;
function oCard(o){
 const m=Math.floor((Date.now()-o.t)/60000),cor=m>20?"danger":m>10?"warning":"success",pr=Math.round(o.itens.filter(i=>i.ok).length/o.itens.length*100);
 const its=o.st==="preparo"?o.itens.map((i,ix)=>`<label class="it"><input type="checkbox" ${i.ok?"checked":""} data-a="chk" data-id="${o.id}" data-ix="${ix}"><span class="q">${i.q}x</span> ${i.nome}${i.ponto?` <small>(${i.ponto})</small>`:""}</label>`).join("")
  :o.itens.map(i=>`<div class="it ${o.st==="pronto"?"done":""}"><span class="q">${i.q}x</span> ${i.nome}${i.ponto?` <small>(${i.ponto})</small>`:""}</div>`).join("");
 const btn={novo:["Iniciar preparo","dark"],preparo:["Marcar como pronto","dark"],pronto:["Marcar como entregue","ok"]}[o.st];
 return `<div class="oc"><div class="r"><b>Pedido #${o.id}</b><b>Mesa ${o.mesa}</b></div>
 <div class="r"><span class="pill dine">Mesa</span><span class="pill t-${cor}">⏱ ${m} min</span></div>
 <small style="color:var(--muted)">Hora: ${hm(o.t)}</small>
 ${o.st==="preparo"?`<div class="r" style="margin-top:8px"><small>Progresso</small><small><b>${pr}%</b></small></div><div class="prog"><i style="width:${pr}%"></i></div>`:""}
 <div class="its">${its}</div>${o.obs?`<small>📝 ${o.obs}</small>`:""}
 ${o.st==="pronto"?`<div class="rd">Pronto às ${hm(o.tp||o.t)} ✔</div>`:""}
 <div class="r" style="gap:6px;margin-top:10px"><button class="btn sm ${btn[1]}" style="flex:1" data-a="adv" data-id="${o.id}">${btn[0]}</button><button class="btn sm sec" data-a="print" data-id="${o.id}" title="Imprimir comanda">🖨</button>${o.st==="novo"?`<button class="btn sm sec" data-a="cancel" data-id="${o.id}" title="Cancelar">✕</button>`:""}</div></div>`}
function board(){
 const ql=q.toLowerCase(),match=o=>!ql||`${o.mesa} ${o.id} ${o.itens.map(i=>i.nome).join(" ")}`.toLowerCase().includes(ql);
 const stats=[["Novos pedidos",cnt("novo"),"📋","var(--info)"],["Preparando",cnt("preparo"),"🍳","var(--warning)"],["Concluídos",cnt("entregue"),"✅","var(--success)"],["Cancelados",cnt("cancelado"),"🚫","var(--danger)"]];
 const cols=COLS.filter(c=>filtro==="todos"||filtro===c[0]);
 return `<div class="stats">${stats.map(([n,v,e,c])=>`<div class="stat"><span>${n}</span><b>${String(v).padStart(2,"0")}</b><i style="background:color-mix(in srgb,${c} 18%,transparent)">${e}</i></div>`).join("")}</div>
 <div class="filters">${[["todos","Todos os pedidos","☰"],...COLS.map(c=>[c[0],c[1],c[2]])].map(([k,n,e])=>`<button class="fp ${filtro===k?"on":""}" data-a="filtro" data-k="${k}">${e} ${n}</button>`).join("")}</div>
 <div class="kan" style="grid-template-columns:repeat(${cols.length},minmax(240px,1fr))">${cols.map(([s,n,e,c])=>`<div class="col"><h4 style="background:${c}">${e} ${n} <span>${cnt(s)}</span></h4><div class="cb">${S.orders.filter(o=>o.st===s&&!o.pago&&match(o)).map(oCard).join("")||'<p class="vz">Nenhum pedido</p>'}</div></div>`).join("")}</div>
 <p style="margin-top:12px;color:var(--muted);font-size:13px">🖨 abre a comanda em 80mm. Na versão com backend, imprime sozinha quando o pedido chega.</p>`}
function ticket(o){document.getElementById("ticket").innerHTML=`<h1>MESA ${o.mesa}</h1><div>${new Date(o.t).toLocaleTimeString("pt-BR")} · #${o.id}</div><hr>${o.itens.map(i=>`<div style="font-size:18px">${i.q}x ${i.nome}${i.ponto?" ("+i.ponto+")":""}</div>`).join("")}${o.obs?`<hr>OBS: ${o.obs}`:""}`;print()}
app.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a,d=b.dataset;
 if(a==="nav"){tab=d.k;mesaSel=null}
 else if(a==="adv"){const o=S.orders.find(o=>o.id==d.id),k=Object.keys(ST);o.st=k[k.indexOf(o.st)+1];if(o.st==="pronto")o.tp=Date.now();save()}
 else if(a==="rmimg"){edit.img=null;document.getElementById("f-prev").innerHTML=pic(edit);return}
 else if(a==="novop")edit={cat:S.menu.cats[0].id,on:1}
 else if(a==="editp")edit={...S.menu.prods.find(p=>p.id==d.i)}
 else if(a==="cancelp"){if(e.target!==b&&b.className==="modal-bg")return;edit=null}
 else if(a==="delp"){const p=S.menu.prods.find(p=>p.id==d.i);if(confirm(`Remover "${p.nome}" do cardápio?`)){S.menu.prods=S.menu.prods.filter(x=>x.id!=p.id);save()}}
 else if(a==="savep"){const v=id=>document.getElementById(id),nome=v("f-nome").value.trim(),pr=parseFloat(v("f-p").value);
  if(!nome||isNaN(pr)||pr<0){alert("Informe o nome e um preço válido.");return}
  const n={...edit,nome,d:v("f-d").value.trim(),cat:v("f-cat").value,p:pr,e:edit.e||"🍢",tag:v("f-tag").value.trim(),ponto:v("f-ponto").checked?1:0,on:v("f-on").checked?1:0};
  if(n.id)S.menu.prods=S.menu.prods.map(x=>x.id==n.id?n:x);else{n.id=Math.max(0,...S.menu.prods.map(x=>x.id))+1;S.menu.prods.push(n)}
  edit=null;save()}
 else if(a==="rmlogo"){S.theme.logo="";save()}
 else if(a==="cancel"){if(confirm("Cancelar este pedido?")){S.orders.find(o=>o.id==d.id).st="cancelado";save()}}
 else if(a==="chk"){const i=S.orders.find(o=>o.id==d.id).itens[d.ix];i.ok=!i.ok;save()}
 else if(a==="filtro")filtro=d.k;
 else if(a==="print")ticket(S.orders.find(o=>o.id==d.id));
 else if(a==="mesa")mesaSel=d.n;
 else if(a==="paymethod"){b.parentElement.querySelectorAll(".chip").forEach(c=>c.classList.remove("on"));b.classList.add("on");return}
 else if(a==="close"){S.orders.forEach(o=>{if(o.mesa==mesaSel)o.pago=1});S.bills=S.bills.filter(x=>x!==mesaSel);mesaSel=null;save()}
 else if(a==="export"){navigator.clipboard?.writeText(JSON.stringify(S.theme,null,2));b.textContent="copiado ✓";return}
 else if(a==="reset"){localStorage.clear();location.reload()}
 render()});
app.addEventListener("change",e=>{const t=e.target;
 if(t.dataset.a==="imgfile"&&t.files[0]){const im=new Image();im.onload=()=>{const k=Math.min(1,480/Math.max(im.width,im.height)),c=document.createElement("canvas"); // ponytail: data-URL no localStorage; com backend, subir o arquivo
  c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);edit.img=c.toDataURL("image/jpeg",.8);document.getElementById("f-prev").innerHTML=pic(edit)};im.src=URL.createObjectURL(t.files[0]);return}
 if(t.dataset.a!=="logofile"||!t.files[0])return;
 const img=new Image();img.onload=()=>{const k=Math.min(1,400/img.width,160/img.height),c=document.createElement("canvas"); // reduz p/ caber no localStorage; ponytail: com backend, subir o arquivo original
  c.width=img.width*k;c.height=img.height*k;c.getContext("2d").drawImage(img,0,0,c.width,c.height);S.theme.logo=c.toDataURL("image/png");save();render()};
 img.src=URL.createObjectURL(t.files[0])});
app.addEventListener("input",e=>{const t=e.target,a=t.dataset.a;if(!a)return;const p=id=>S.menu.prods.find(x=>x.id==id);
 if(a==="search"){q=t.value;document.getElementById("board").innerHTML=board();return}
 if(a==="price"){p(t.dataset.i).p=+t.value;save();return}
 if(a==="avail"){p(t.dataset.i).on=t.checked?1:0;save();return}
 if(a==="color")S.theme.colors[t.dataset.k]=t.value;
 else if(a==="radius")S.theme.radius=+t.value;
 else if(a==="font")S.theme.font=t.value;
 else if(a==="tnome"){S.theme.nome=t.value;save();document.title=t.value;return}
 else if(a==="tlogo"){S.theme.logo=t.value;save();return}
 else return;
 applyTheme(S.theme);save()});
function render(){
 const f=document.activeElement;if(f&&f.dataset&&["tnome","tlogo","price","search"].includes(f.dataset.a))return; // não perder foco ao digitar
 app.innerHTML=gestao()}
applyTheme(S.theme);render();setInterval(()=>tab==="pedidos"&&render(),30000);
