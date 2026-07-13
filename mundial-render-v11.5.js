/* MUNDIAL V11.5 PANTALLA GIGANTE */
function crearCardPartidoV115(p){
 const estado = obtenerTextoTiempoPartido(p);
 const score = obtenerMarcadorPartido(p) || "VS";
 return `<article class="stadium-match-card ${estado.estado.includes("EN VIVO")?"live":""}">
 <div class="stadium-status">${estado.estado}</div>
 <div class="stadium-teams">
 <div class="stadium-team">⚽<span>${p.local}</span></div>
 <div class="stadium-score"><strong>${score}</strong><small>${estado.detalle}</small></div>
 <div class="stadium-team">⚽<span>${p.visitante}</span></div>
 </div></article>`;
}
function iniciarTemporizadorMundial(){
 document.querySelectorAll("[data-partido-fecha]").forEach(el=>{
 const fecha=new Date(el.dataset.partidoFecha);
 const actualizar=()=>{
 const d=fecha-new Date();
 if(d<=0){el.textContent="🔴 EN VIVO";return;}
 const s=Math.floor(d/1000);
 el.textContent=`⏳ ${Math.floor(s/86400)}d ${Math.floor(s%86400/3600)}h ${Math.floor(s%3600/60)}m ${s%60}s`;
 };
 actualizar(); setInterval(actualizar,1000);
 });
}