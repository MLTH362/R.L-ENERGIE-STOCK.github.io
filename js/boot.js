'use strict';
window.addEventListener('error',e=>toast('Erreur : '+e.message,1));
render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
