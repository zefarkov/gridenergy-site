
document.addEventListener('DOMContentLoaded',()=>{
const saved=localStorage.getItem('theme')||'light';
document.documentElement.setAttribute('data-theme',saved);
document.querySelectorAll('.theme-toggle').forEach(b=>b.onclick=()=>{
 const t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
 document.documentElement.setAttribute('data-theme',t); localStorage.setItem('theme',t);
});
});
