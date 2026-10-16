'use strict';
const now0=new Date(),iso=d=>new Date(d).toISOString().slice(0,10);
let RP={mode:'month',y:now0.getFullYear(),m:now0.getMonth(),from:iso(Date.now()-29*864e5),to:iso(Date.now()),prod:''},RPD=null;
const MODES={month:'Un mois',year:'Une année','7':'7 derniers jours','30':'30 derniers jours',range:'Dates à choisir'};
function rpRange(){const R=RP;let f,t;if(R.mode==='month'){f=+new Date(R.y,R.m,1);t=+new Date(R.y,R.m+1,1)-1}else if(R.mode==='year'){f=+new Date(R.y,0,1);t=+new Date(R.y+1,0,1)-1}
 else if(R.mode==='7'||R.mode==='30'){t=Date.now();const d=new Date();d.setHours(0,0,0,0);f=+d-(R.mode-1)*864e5}else{f=+new Date((R.from||iso(Date.now()))+'T00:00:00');t=+new Date((R.to||iso(Date.now()))+'T23:59:59')}return[f,Math.max(t,f)]}
function rpLabel(){const[f,t]=rpRange(),R=RP;return R.mode==='month'?new Date(R.y,R.m,1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'}):R.mode==='year'?'Année '+R.y:new Date(f).toLocaleDateString('fr-FR')+' → '+new Date(t).toLocaleDateString('fr-FR')}
function rpData(){const[f,t]=rpRange(),pk=RP.prod,all=S.mv.filter(m=>!pk||m.k===pk),sg=m=>m.t==='+'?m.q:-m.q;
 const daily=(t-f)<=63*864e5,id=d=>daily?d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate():d.getFullYear()+'-'+d.getMonth(),
 lab=d=>daily?d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}):d.toLocaleDateString('fr-FR',{month:'short',year:'2-digit'});
 let lvl=all.filter(m=>m.ts<f).reduce((a,m)=>a+sg(m),0);const open=lvl,mv=all.filter(m=>m.ts>=f&&m.ts<=t),B=[],M={};
 const end=Math.max(Math.min(t,Date.now()),f);let cur=new Date(f);if(!daily)cur.setDate(1);
 while(+cur<=end){const b={lab:lab(cur),in:0,out:0,lv:0};B.push(b);M[id(cur)]=b;daily?cur.setDate(cur.getDate()+1):cur.setMonth(cur.getMonth()+1)}
 mv.forEach(m=>{const b=M[id(new Date(m.ts))];if(b){m.t==='+'?b.in+=m.q:b.out+=m.q}});B.forEach(b=>{lvl+=b.in-b.out;b.lv=lvl});
 const P={},C={},N={};mv.forEach(m=>{const r=S.refs[m.k]||{},p=P[m.k]=P[m.k]||{nom:m.nom,ref:m.ref,in:0,out:0},c=C[r.cat||'?']=C[r.cat||'?']||{in:0,out:0};
  if(m.t==='+'){p.in+=m.q;c.in+=m.q}else{p.out+=m.q;c.out+=m.q;const n=(m.n||'').trim();if(n&&!/^(Annulation|Inventaire)/.test(n))N[n]=(N[n]||0)+m.q}});
 const tin=mv.filter(m=>m.t==='+').reduce((a,m)=>a+m.q,0),tout=mv.filter(m=>m.t==='-').reduce((a,m)=>a+m.q,0);
 return{B,mv,P:Object.values(P).sort((a,b)=>b.out-a.out||b.in-a.in),C,N:Object.entries(N).sort((a,b)=>b[1]-a[1]),tin,tout,open,close:B.length?B[B.length-1].lv:open}}
/* ---- graphiques SVG (couleurs en dur : servent aussi au PDF) ---- */
const W=720,Hh=260,PD={l:60,r:14,t:16,b:38},nice=v=>{if(v<=0)return 1;const e=10**Math.floor(Math.log10(v)),f=v/e;return(f<=1?1:f<=2?2:f<=5?5:10)*e};
function frame(B,mn,mx,inner){const X0=PD.l,X1=W-PD.r,Y0=PD.t,Y1=Hh-PD.b;let g='';for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4,y=Y1-(Y1-Y0)*i/4;g+=`<line x1="${X0}" x2="${X1}" y1="${y}" y2="${y}" stroke="#e3e0d6"/><text x="${X0-6}" y="${y+4}" text-anchor="end" font-size="17" fill="#6b6f76">${Math.round(v)}</text>`}
 const st=Math.ceil(B.length/6);B.forEach((b,i)=>{if(i%st===0)g+=`<text x="${X(B,i)}" y="${Hh-10}" text-anchor="middle" font-size="17" fill="#6b6f76">${b.lab}</text>`});
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" font-family="Arial,sans-serif" style="width:100%;height:auto"><rect width="${W}" height="${Hh}" fill="#fff"/>${g}${inner}</svg>`}
const X=(B,i)=>PD.l+(B.length<2?(W-PD.l-PD.r)/2:i*(W-PD.l-PD.r)/(B.length-1));
function lineSvg(B){const vs=B.map(b=>b.lv),mx=nice(Math.max(...vs,1)),mn=Math.min(0,...vs),Y=v=>Hh-PD.b-(Hh-PD.b-PD.t)*(v-mn)/(mx-mn||1);
 const pts=B.map((b,i)=>X(B,i)+','+Y(b.lv)).join(' '),area=`${X(B,0)},${Y(mn)} ${pts} ${X(B,B.length-1)},${Y(mn)}`;
 return frame(B,mn,mx,`<polygon points="${area}" fill="#F2B705" fill-opacity=".28"/><polyline points="${pts}" fill="none" stroke="#c98f00" stroke-width="2.5" stroke-linejoin="round"/>${B.length<=40?B.map((b,i)=>`<circle cx="${X(B,i)}" cy="${Y(b.lv)}" r="3" fill="#c98f00"/>`).join(''):''}`)}
function barsSvg(B){const mx=nice(Math.max(...B.map(b=>Math.max(b.in,b.out)),1)),Y=v=>Hh-PD.b-(Hh-PD.b-PD.t)*v/mx,sw=(W-PD.l-PD.r)/B.length,bw=Math.max(2,Math.min(18,sw*.38));
 return frame(B.map((b,i)=>({lab:b.lab})),0,mx,B.map((b,i)=>{const cx=PD.l+sw*(i+.5);return`<rect x="${cx-bw-1}" y="${Y(b.in)}" width="${bw}" height="${Hh-PD.b-Y(b.in)}" fill="#1e8e4e" rx="2"/><rect x="${cx+1}" y="${Y(b.out)}" width="${bw}" height="${Hh-PD.b-Y(b.out)}" fill="#c93a3a" rx="2"/>`}).join('')).replace(/<text x="[\d.]+" y="220"/g,m=>m)}
function rapV(){const D=RPD=rpData(),ys=[...new Set([now0.getFullYear(),...S.mv.map(m=>new Date(m.ts).getFullYear())])].sort((a,b)=>b-a),
 pk=[...new Set(S.mv.map(m=>m.k))].filter(k=>S.refs[k]).sort((a,b)=>S.refs[a].nom.localeCompare(S.refs[b].nom,'fr',{numeric:true})),R=RP,sel=(on,l,o)=>`<div class="f"><label>${l}</label><select onchange="${on}">${o}</select></div>`;
 const mo=[...Array(12)].map((_,i)=>`<option value="${i}" ${R.m===i?'selected':''}>${new Date(2000,i,1).toLocaleDateString('fr-FR',{month:'long'})}</option>`).join(''),yo=ys.map(y=>`<option ${R.y===y?'selected':''}>${y}</option>`).join('');
 const mx=D.P[0]?Math.max(...D.P.map(p=>p.out),1):1;
 return `<section><h2>Rapports</h2><div class="grid">${sel('RP.mode=this.value;render()','Période',Object.keys(MODES).map(k=>`<option value="${k}" ${R.mode===k?'selected':''}>${MODES[k]}</option>`).join(''))}
 ${R.mode==='month'?sel('RP.m=+this.value;render()','Mois',mo)+sel('RP.y=+this.value;render()','Année',yo):''}${R.mode==='year'?sel('RP.y=+this.value;render()','Année',yo):''}
 ${R.mode==='range'?`<div class="f"><label>Du</label><input type="date" value="${R.from}" onchange="RP.from=this.value;render()"></div><div class="f"><label>Au</label><input type="date" value="${R.to}" onchange="RP.to=this.value;render()"></div>`:''}
 ${sel('RP.prod=this.value;render()','Produit',`<option value="">Tous les produits</option>`+pk.map(k=>`<option value="${esc(k)}" ${R.prod===k?'selected':''}>${esc(S.refs[k].nom)}</option>`).join(''))}</div>
 ${can('export')?'<div class="acts"><button class="p" onclick="rapPdf()">Rapport PDF</button><button onclick="rapXls()">Rapport Excel</button></div>':''}</section>
 <div class="tiles"><div><b>${D.tin}</b><span>entrées</span></div><div><b>${D.tout}</b><span>sorties</span></div><div><b>${D.tin-D.tout>0?'+':''}${D.tin-D.tout}</b><span>solde</span></div><div><b>${D.close}</b><span>stock fin de période</span></div></div>
 <section><h2>${R.prod?esc(S.refs[R.prod].nom)+' — courbe du stock':'Courbe du stock total'} <small class="ref">${rpLabel()}</small></h2>${D.mv.length||D.open?lineSvg(D.B):'<div class="empty">Aucun mouvement sur cette période.</div>'}</section>
 <section><h2>Entrées <i class="lg1"></i> et sorties <i class="lg2"></i></h2>${D.mv.length?barsSvg(D.B):'<div class="empty">Aucun mouvement sur cette période.</div>'}</section>
 ${R.prod?`<section><h2>Mouvements du produit</h2><div class="tw"><table><tr><th>Date</th><th>Qté</th><th>Motif</th></tr>${D.mv.slice().reverse().slice(0,40).map(m=>`<tr><td>${new Date(m.ts).toLocaleString('fr-FR')}</td><td><b class="${m.t==='-'?'out':''}">${m.t==='+'?'+':'−'}${m.q}</b></td><td>${esc(m.n||'')}</td></tr>`).join('')}</table></div></section>`:
 `<section><h2>Produits les plus sortis</h2>${D.P.filter(p=>p.out).length?D.P.filter(p=>p.out).slice(0,10).map(p=>`<div class="hb2"><div><b>${esc(p.nom)}</b><span class="ref"> ${esc(p.ref)}</span></div><div class="bar"><i style="width:${p.out/mx*100}%"></i><em>${p.out}</em></div></div>`).join(''):'<div class="empty">Aucune sortie.</div>'}</section>
 <section><h2>Par catégorie</h2><div class="tw"><table><tr><th>Catégorie</th><th>Entrées</th><th>Sorties</th></tr>${Object.keys(D.C).sort().map(c=>`<tr><td>${esc(c)}</td><td>${D.C[c].in}</td><td>${D.C[c].out}</td></tr>`).join('')||'<tr><td colspan="3" class="empty">—</td></tr>'}</table></div></section>
 ${D.N.length?`<section><h2>Sorties par chantier / client</h2><div class="tw"><table><tr><th>Chantier / motif</th><th>Pièces sorties</th></tr>${D.N.slice(0,15).map(n=>`<tr><td>${esc(n[0])}</td><td>${n[1]}</td></tr>`).join('')}</table></div></section>`:''}`}`}
function svgPng(svg){return new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=W*2;c.height=Hh*2;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/png'))};i.onerror=()=>r(null);i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)})}
async function rapPdf(){const D=rpData(),d=new jspdf.jsPDF('p','mm','a4'),pn=RP.prod?S.refs[RP.prod].nom:'Tous les produits';d.setFontSize(17);d.text('R.L ENERGIE — Rapport de stock',14,16);d.setFontSize(11);d.text(rpLabel()+' · '+pn,14,23);
 d.text(`Entrées ${D.tin}   Sorties ${D.tout}   Solde ${D.tin-D.tout}   Stock fin de période ${D.close}`,14,30);let y=36;
 for(const s of[lineSvg(D.B),barsSvg(D.B)]){const p=await svgPng(s);if(p){d.addImage(p,'PNG',14,y,182,182*Hh/W);y+=182*Hh/W+4}}
 const T=(h,b)=>{if(!b.length)return;d.autoTable({head:[h],body:b,startY:y,styles:{fontSize:9},headStyles:{fillColor:[38,40,43]},margin:{left:14,right:14}});y=d.lastAutoTable.finalY+6};
 if(y>230){d.addPage();y=16}T(['Produit','Réf','Entrées','Sorties'],D.P.slice(0,15).map(p=>[p.nom,p.ref,p.in,p.out]));T(['Catégorie','Entrées','Sorties'],Object.keys(D.C).sort().map(c=>[c,D.C[c].in,D.C[c].out]));T(['Chantier / motif','Pièces sorties'],D.N.slice(0,15));
 d.save(`RL_RAPPORT_${day()}.pdf`);toast('Rapport PDF enregistré')}
async function rapXls(){const D=rpData(),wb=new ExcelJS.Workbook(),add=(n,h,rows,wd)=>{const w=wb.addWorksheet(n);w.columns=h.map((x,i)=>({header:x,width:wd[i]||14}));w.addRows(rows);w.getRow(1).font={bold:true}};
 add('Résumé',['Indicateur','Valeur'],[['Période',rpLabel()],['Produit',RP.prod?S.refs[RP.prod].nom:'Tous'],['Entrées',D.tin],['Sorties',D.tout],['Solde',D.tin-D.tout],['Stock début',D.open],['Stock fin',D.close]],[22,36]);
 add('Évolution',['Date','Entrées','Sorties','Stock'],D.B.map(b=>[b.lab,b.in,b.out,b.lv]),[14,12,12,12]);add('Par produit',['Produit','Réf','Entrées','Sorties'],D.P.map(p=>[p.nom,p.ref,p.in,p.out]),[40,22,12,12]);
 add('Par catégorie',['Catégorie','Entrées','Sorties'],Object.keys(D.C).map(c=>[c,D.C[c].in,D.C[c].out]),[28,12,12]);add('Chantiers',['Chantier / motif','Pièces sorties'],D.N,[40,16]);
 add('Mouvements',['Date','Réf','Produit','Type','Qté','Motif'],D.mv.map(m=>[new Date(m.ts).toLocaleString('fr-FR'),m.ref,m.nom,m.t==='+'?'Entrée':'Sortie',m.q,m.n||'']),[20,22,36,10,8,34]);
 save(`RL_RAPPORT_${day()}.xlsx`,new Blob([await wb.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));toast('Rapport Excel enregistré')}
