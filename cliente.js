// ---------- APP DO CLIENTE (PWA, sem login) ----------
let mesa=new URLSearchParams(location.search).get("mesa")||"", mesaTmp="", cat="espetos", cart=[], sheet=null, view="menu", confirmBill=false;
function cliente(){
 const T=S.theme,total=cart.reduce((a,i)=>a+i.p*i.q,0),qtd=cart.reduce((a,i)=>a+i.q,0);
 const logo=T.logo?`<img src="${T.logo}" onerror="this.outerHTML='<b>${T.nome}</b>'">`:`<b>${T.nome}</b>`;
 let h=`<div class="phone"><div class="top">${logo}<button class="mesa" data-a="trocamesa">${mesa?"Mesa "+mesa:"Informar mesa"}</button></div>`;
 if(!mesa||view==="mesa"){
  h+=`<div class="pad"><h2>Em qual mesa você está?</h2><p style="color:var(--muted)">Ou encoste o celular na tag NFC / leia o QR da mesa.</p><div class="big">${mesaTmp}</div><div class="keys">${[1,2,3,4,5,6,7,8,9,"⌫",0,"OK"].map(k=>`<button data-a="key" data-k="${k}">${k}</button>`).join("")}</div></div>`
 }else if(view==="cart"){
  h+=`<div class="pad"><button data-a="back" class="btn sec sm">← Cardápio</button><h2 style="margin:12px 0">Seu pedido</h2>${cart.map((i,ix)=>`<div class="row"><span>${i.q}× ${i.nome}${i.ponto?` <small>(${i.ponto})</small>`:""}</span><span>${R(i.p*i.q)} <button data-a="rm" data-i="${ix}">✕</button></span></div>`).join("")||"<p>Carrinho vazio.</p>"}
  <div class="row"><b>Total</b><b>${R(total)}</b></div><br><textarea id="obs" placeholder="Observação (ex.: sem cebola)" style="width:100%;padding:10px;border-radius:12px;border:1px solid var(--border);font:inherit"></textarea><br><br><button class="btn full" data-a="send" ${qtd?"":"disabled"}>Enviar pedido para a cozinha</button></div>`
 }else if(view==="status"){
  h+=`<div class="pad"><h2>Pedido enviado ✅</h2><p style="color:var(--muted);margin-bottom:12px">Acompanhe aqui.</p>${mkey(mesa).map(o=>`<div class="card" style="display:block"><span class="chipst s-${o.st}">${ST[o.st]}</span> <small>#${o.id}</small>${o.itens.map(i=>`<div>${i.q}× ${i.nome}</div>`).join("")}</div>`).join("")}<button class="btn full" data-a="back">Pedir mais</button></div>`
 }else{
  h+=`<div class="tabs">${S.menu.cats.map(c=>`<button class="tab ${c.id===cat?"on":""}" data-a="cat" data-c="${c.id}">${c.nome}</button>`).join("")}</div><div class="scroll">`+
  S.menu.prods.filter(p=>p.cat===cat).map(p=>{const q=cart.filter(i=>i.id===p.id).reduce((a,i)=>a+i.q,0);
   return `<button class="card ${p.on?"":"off"}" ${p.on?`data-a="item" data-i="${p.id}"`:"disabled"}><div class="em">${pic(p)}</div><div><h3>${p.nome} ${p.tag?`<span class="tag">${p.tag}</span>`:""}</h3><p>${p.on?p.d:"Esgotado"}</p><div class="price">${R(p.p)}</div></div>${q?`<span class="qb">${q}</span>`:""}</button>`}).join("")+`</div>
  <div class="bar">${qtd?`<button class="btn" data-a="cart"><span>Ver pedido (${qtd})</span><span>${R(total)}</span></button>`:""}
  ${mkey(mesa).length?`<button class="btn sec sm" data-a="status">Acompanhar pedidos</button>`:""}
  <button class="btn sec" data-a="bill" ${S.bills.includes(mesa)?"disabled":""}>${S.bills.includes(mesa)?"✔ Conta solicitada — já vamos até você":"🧾 Pedir a conta"}</button></div>`
 }
 if(sheet){const p=sheet;h+=`<div class="sheet-bg" data-a="closesheet"><div class="sheet"><div class="em big-em">${pic(p)}</div><h2>${p.nome}</h2><p style="color:var(--muted)">${p.d}</p>
  ${p.ponto?`<div class="opts">${["Mal passado","Ao ponto","Bem passado"].map(x=>`<button class="chip ${sheet.sel===x?"on":""}" data-a="ponto" data-x="${x}">${x}</button>`).join("")}</div>`:""}
  <div class="step" style="justify-content:center;margin:12px 0"><button data-a="dec">–</button><b style="font-size:24px">${sheet.q}</b><button data-a="inc">+</button></div>
  <button class="btn full" data-a="add">Adicionar · ${R(p.p*sheet.q)}</button></div></div>`}
 if(confirmBill)h+=`<div class="sheet-bg"><div class="sheet"><h2>Pedir a conta da mesa ${mesa}?</h2><p style="color:var(--muted);margin:8px 0 16px">O garçom será avisado. O pagamento é feito com ele.</p><button class="btn full" data-a="billok">Sim, pedir a conta</button><br><br><button class="btn sec full" data-a="billno">Cancelar</button></div></div>`;
 return h+"</div>"}
app.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a,d=b.dataset;
 const P=id=>S.menu.prods.find(p=>p.id==id);
 if(a==="trocamesa"){mesaTmp="";view="mesa"}
 else if(a==="key"){if(d.k==="⌫")mesaTmp=mesaTmp.slice(0,-1);else if(d.k==="OK"){if(mesaTmp){mesa=mesaTmp;view="menu"}}else if(mesaTmp.length<3)mesaTmp+=d.k}
 else if(a==="cat")cat=d.c;
 else if(a==="item")sheet={...P(d.i),q:1,sel:P(d.i).ponto?"Ao ponto":""};
 else if(a==="closesheet"&&e.target===b)sheet=null;
 else if(a==="ponto")sheet.sel=d.x;
 else if(a==="inc")sheet.q++;
 else if(a==="dec")sheet.q=Math.max(1,sheet.q-1);
 else if(a==="add"){cart.push({id:sheet.id,nome:sheet.nome,p:sheet.p,q:sheet.q,ponto:sheet.sel});sheet=null}
 else if(a==="cart")view="cart";
 else if(a==="back")view="menu";
 else if(a==="rm")cart.splice(d.i,1);
 else if(a==="send"){S.orders.push({id:S.orders.length+101,mesa,itens:cart,st:"novo",t:Date.now(),obs:document.getElementById("obs").value});cart=[];view="status";save()}
 else if(a==="status")view="status";
 else if(a==="bill")confirmBill=true;
 else if(a==="billno")confirmBill=false;
 else if(a==="billok"){S.bills.push(mesa);confirmBill=false;save()}
 render()});
function render(){app.innerHTML=cliente()}
applyTheme(S.theme);render();
