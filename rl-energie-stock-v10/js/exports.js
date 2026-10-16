'use strict';
const rows=()=>{const q=stockOf();return Object.keys(q).filter(k=>q[k]>0&&S.refs[k]).map(k=>[S.refs[k].ref,S.refs[k].nom,q[k],S.refs[k].cat]).sort((a,b)=>a[3].localeCompare(b[3],'fr')||a[1].localeCompare(b[1],'fr'))};
const day=()=>new Date().toISOString().slice(0,10),H=['Réf','Produit','Qté','Catégorie'];
function exCsv(){save(`RL_STOCK_${day()}.csv`,new Blob(['\uFEFF'+[H,...rows()].map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(';')).join('\n')],{type:'text/csv'}));toast('CSV enregistré')}
async function exXls(){const wb=new ExcelJS.Workbook(),w=wb.addWorksheet('Stock');w.columns=[{header:H[0],width:22},{header:H[1],width:40},{header:H[2],width:8},{header:H[3],width:26}];w.addRows(rows());w.getRow(1).font={bold:true};
 save(`RL_STOCK_${day()}.xlsx`,new Blob([await wb.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));toast('Excel enregistré')}
function exPdf(){const d=new jspdf.jsPDF('l','mm','a4');d.setFontSize(16);d.text('R.L ENERGIE — Stock au '+new Date().toLocaleDateString('fr-FR'),14,14);d.autoTable({head:[H],body:rows(),startY:22,styles:{fontSize:9},headStyles:{fillColor:[38,40,43]}});d.save(`RL_STOCK_${day()}.pdf`);toast('PDF enregistré')}
function backup(){save(`RL_SAUVEGARDE_${day()}.json`,new Blob([JSON.stringify(S)],{type:'application/json'}))}
function restore(f){const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!Array.isArray(o.mv)||!o.refs)throw 0;merge(o);persist();render();toast('Sauvegarde fusionnée')}catch(e){toast('Fichier invalide',1)}};r.readAsText(f)}

function todo(){const q=stockOf();return Object.values(S.refs).filter(r=>!r.del&&r.min>0&&(q[key(r.cat,r.ref)]||0)<=r.min).map(r=>{const k=key(r.cat,r.ref),n=q[k]||0;return[r.ref,r.nom,n,r.min,Math.max(r.min-n,1),r.cat]})}
function exTodo(){const t=todo();if(!t.length)return toast('Rien à commander');const d=new jspdf.jsPDF('l','mm','a4');d.setFontSize(16);d.text('À commander — '+new Date().toLocaleDateString('fr-FR'),14,14);d.autoTable({head:[['Réf','Produit','En stock','Seuil','Manque','Catégorie']],body:t,startY:22,styles:{fontSize:9},headStyles:{fillColor:[38,40,43]}});d.save(`RL_A_COMMANDER_${day()}.pdf`)}
