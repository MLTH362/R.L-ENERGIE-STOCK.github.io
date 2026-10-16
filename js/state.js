'use strict';
/* Le stock n'est PAS stocké : il est CALCULÉ à partir des mouvements (chaque mouvement a un id unique).
   Fusionner deux appareils = réunir leurs mouvements → plus jamais de perte quand deux personnes saisissent en même temps. */
const LS='RLS8';let S=JSON.parse(localStorage.getItem(LS)||'null');let admin=false;
if(!S){S={mv:[],refs:{},sync:0};for(const c in DEFAULTS)DEFAULTS[c].split('\n').forEach(l=>{const[r,n]=l.split('→');if(r)S.refs[c+'|'+r]={cat:c,ref:r,nom:n,upd:0,del:0}})}
if(!S.cats)S.cats={};
const persist=()=>localStorage.setItem(LS,JSON.stringify(S));
const key=(c,r)=>c+'|'+r;
function stockOf(){const o={};S.mv.forEach(m=>{const x=o[m.k]=o[m.k]||0;o[m.k]=x+(m.t==='+'?m.q:-m.q)});return o}
const cats=()=>[...new Set([...Object.values(S.refs).filter(r=>!r.del).map(r=>r.cat),...Object.keys(S.cats).filter(c=>!S.cats[c].del)])].sort((a,b)=>a.localeCompare(b,'fr'));
const refsOf=c=>Object.values(S.refs).filter(r=>!r.del&&r.cat===c).sort((a,b)=>a.nom.localeCompare(b.nom,'fr',{numeric:true}));
function move(k,q,t,note){const r=S.refs[k];if(!r||!(q>0))return false;if(t==='-'&&(stockOf()[k]||0)<q){toast('Pas assez en stock',1);return false}
 S.mv.push({id:uid(),ts:Date.now(),k,ref:r.ref,nom:r.nom,q,t,n:note||''});persist();cloud(true);return true}
function weekStats(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));const w=S.mv.filter(m=>m.ts>=d.getTime());
 return{n:w.length,in:w.filter(m=>m.t==='+').reduce((a,m)=>a+m.q,0),out:w.filter(m=>m.t==='-').reduce((a,m)=>a+m.q,0)}}
/* mot de passe admin (hash SHA-256 salé). Défaut : admin123 → à changer. */
async function pwOk(p){let h=JSON.parse(localStorage.getItem('RLS8_PW')||'null');if(!h){const salt=uid();h={salt,hash:await sha(salt+'admin123')};localStorage.setItem('RLS8_PW',JSON.stringify(h))}return await sha(h.salt+p)===h.hash}
async function pwSet(p){const salt=uid();localStorage.setItem('RLS8_PW',JSON.stringify({salt,hash:await sha(salt+p)}))}
/* ---- cloud (REST Firestore) ---- */
const URL_=()=>`https://firestore.googleapis.com/v1/projects/${CLOUD.project}/databases/(default)/documents/${CLOUD.doc}`;
function merge(c){if(!c)return;const ids=new Set(S.mv.map(m=>m.id));(c.mv||[]).forEach(m=>{if(!ids.has(m.id)){S.mv.push(m);ids.add(m.id)}});S.mv.sort((a,b)=>a.ts-b.ts);
 for(const k in c.cats||{}){const a=S.cats[k],b=c.cats[k];if(!a||b.upd>a.upd)S.cats[k]=b}
 for(const k in c.refs||{}){const a=S.refs[k],b=c.refs[k];if(!a||b.upd>a.upd)S.refs[k]=b}}
let busy=false,again=false;
async function cloud(quiet){if(!CLOUD.key)return;if(busy){again=true;return}busy=true;
 try{const g=await fetch(URL_()+'?key='+CLOUD.key);if(g.ok)merge(JSON.parse((await g.json()).fields.json.stringValue));else if(g.status!==404)throw Error('lecture '+g.status);
  const p=await fetch(URL_()+'?key='+CLOUD.key+'&updateMask.fieldPaths=json',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{json:{stringValue:JSON.stringify({mv:S.mv,refs:S.refs,cats:S.cats})}}})});
  if(!p.ok)throw Error('écriture '+p.status);S.sync=Date.now();persist();if(!quiet)toast('Synchronisé');render()}
 catch(e){if(!quiet)toast('Sync impossible ('+e.message+') — données gardées sur l\'appareil',1)}
 busy=false;if(again){again=false;cloud(true)}}

/* ---- droits : l'utilisateur ne fait que ce que l'admin autorise ---- */
const RIGHTS={in:'Faire une entrée',out:'Faire une sortie',count:'Corriger un stock (inventaire)',undo:'Annuler un mouvement',export:'Exporter (Excel, PDF, CSV)',backup:'Sauvegarder / restaurer',refs:'Gérer les références',min:'Régler les seuils d\'alerte',cats:'Gérer les catégories',hist:'Voir l\'historique',report:'Consulter les rapports'};
const PRESET={Restreint:{in:1,out:1,hist:1},Standard:{in:1,out:1,hist:1,export:1,count:1,min:1,report:1},'Tout autoriser':Object.fromEntries(Object.keys(RIGHTS).map(k=>[k,1]))};
let RT=JSON.parse(localStorage.getItem('RLS8_RT')||'null')||{...PRESET.Standard};
if(RT.report===undefined)RT.report=1;
const can=r=>admin||!!RT[r];const canGest=()=>admin||['refs','min','cats','backup'].some(r=>RT[r]);
const setRT=o=>{RT=o;localStorage.setItem('RLS8_RT',JSON.stringify(o))};
function undo(id){const m=S.mv.find(x=>x.id===id);if(!m)return;if(move(m.k,m.q,m.t==='+'?'-':'+','Annulation du '+new Date(m.ts).toLocaleString('fr-FR')))toast('Mouvement annulé')}
function count(k,target){const d=target-(stockOf()[k]||0);if(!d)return toast('Déjà à '+target);move(k,Math.abs(d),d>0?'+':'-','Inventaire : '+target)}
function renameCat(a,b){Object.keys(S.refs).forEach(k=>{if(S.refs[k].cat===a)S.refs[k]={...S.refs[k],cat:b,upd:Date.now()}});S.cats[a]={upd:Date.now(),del:1};S.cats[b]={upd:Date.now(),del:0};persist();cloud(true)}
function addCat(n){S.cats[n]={upd:Date.now(),del:0};persist();cloud(true)}
function delCat(n){S.cats[n]={upd:Date.now(),del:1};persist();cloud(true)}
function findBy(c){c=(c||'').trim();const l=c.toLowerCase();return c?Object.values(S.refs).filter(r=>!r.del&&(r.bc===c||r.ref.toLowerCase()===l)):[]}
function editRef(k,o){S.refs[k]={...S.refs[k],...o,upd:Date.now()};persist();cloud(true)}
const low=(k,q)=>{const m=(S.refs[k]||{}).min||0;return m>0&&q<=m};
