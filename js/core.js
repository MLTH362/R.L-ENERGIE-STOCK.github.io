'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function toast(m,err){const t=$('#toast');[...t.children].forEach(x=>{if(x.textContent===m)x.remove()});const d=document.createElement('div');d.className='t'+(err?' e':'');d.textContent=m;t.appendChild(d);while(t.children.length>3)t.firstChild.remove();setTimeout(()=>d.remove(),2800)}
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function save(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
function dlg(html){const m=$('#modal');m.innerHTML='<div>'+html+'</div>';m.style.display='flex';m.onclick=e=>{if(e.target===m)closeDlg()}}
function closeDlg(){if(window.stopScan)stopScan();$('#modal').style.display='none'}
