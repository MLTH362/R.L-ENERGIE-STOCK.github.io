'use strict';
/* Scan code-barres : caméra (BarcodeDetector : Chrome / Android) ou saisie / douchette USB. */
let stream=null,scanOn=false,SCB=null;
function stopScan(){scanOn=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function scanDone(v){v=(v||'').trim();if(!v)return;stopScan();closeDlg();SCB&&SCB(v)}
async function scan(cb){SCB=cb;
 dlg(`<h2>Scanner un code-barres</h2><video id="vd" playsinline muted style="width:100%;border-radius:12px;background:#111;aspect-ratio:4/3;object-fit:cover"></video><p id="sm">Place le code dans le cadre.</p>
 <label>Ou saisis / scanne avec une douchette</label><input id="mc" placeholder="Code-barres ou référence" onkeydown="if(event.key==='Enter')scanDone(this.value)"><div class="row"><button class="s" onclick="closeDlg()">Fermer</button><button class="p" onclick="scanDone($('#mc').value)">Valider</button></div>`);
 const no=m=>{$('#vd').style.display='none';$('#sm').textContent=m};
 if(!('BarcodeDetector'in window)||!navigator.mediaDevices)return no('Scan par caméra indisponible sur ce navigateur (Chrome Android conseillé) : saisis le code ci-dessous.');
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});const v=$('#vd');v.srcObject=stream;await v.play();const det=new BarcodeDetector();scanOn=true;
  while(scanOn){try{const r=await det.detect(v);if(r.length)return scanDone(r[0].rawValue)}catch(e){}await new Promise(r=>setTimeout(r,250))}}
 catch(e){no('Caméra refusée ou introuvable : autorise-la dans le navigateur, ou saisis le code.')}}
