
async function readJSON(path){ const r = await fetch(path); return await r.json(); }

function setTheme(){
  const html = document.documentElement;
  const saved = localStorage.getItem('grid-theme');
  if(saved){ html.setAttribute('data-theme', saved); }
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', ()=>{
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('grid-theme', next);
  });
}

function initLang(){
  const sel = document.querySelector('[data-lang-select]');
  if(!sel) return;
  sel.addEventListener('change', ()=> location.href = sel.value);
}
function daysSince(dateStr){
  const start = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const diff = Math.floor((now - start) / 86400000);
  return Math.max(diff,0);
}
function formatEnergyWh(kwh){
  const wh = Math.round(kwh * 1000);
  if(wh >= 1_000_000_000){ return (wh/1_000_000_000).toFixed(2).replace(/\.00$/,'') + ' ГВт·ч'; }
  if(wh >= 1_000_000){ return (wh/1_000_000).toFixed(2).replace(/\.00$/,'') + ' МВт·ч'; }
  if(wh >= 1_000){ return (wh/1_000).toFixed(2).replace(/\.00$/,'') + ' кВт·ч'; }
  return wh.toLocaleString('ru-RU') + ' Вт·ч';
}
function labels(lang){
  const map = {
    uz:{clients:'Mijozlar',regions:'Hududlar',installed:'O‘rnatilgan quvvat',energy:'Taxminiy umumiy ishlab chiqarish',days:'Ishlagan kunlar',since:'Ishga tushgan',power:'Quvvat',type:'Tur',issuer:'Beruvchi',year:'Yil'},
    ru:{clients:'Клиенты',regions:'Регионы',installed:'Установленная мощность',energy:'Ориентировочная суммарная выработка',days:'Дней в работе',since:'Запуск',power:'Мощность',type:'Тип',issuer:'Выдал',year:'Год'},
    en:{clients:'Clients',regions:'Regions',installed:'Installed capacity',energy:'Estimated cumulative generation',days:'Days online',since:'Launch',power:'Capacity',type:'Type',issuer:'Issuer',year:'Year'}
  };
  return map[lang] || map.en;
}

async function renderHome(lang){
  const [projects, regions, team, certs] = await Promise.all([
    readJSON('../assets/data/projects.json'),
    readJSON('../assets/data/regions.json'),
    readJSON('../assets/data/team.json'),
    readJSON('../assets/data/certificates.json')
  ]);
  const L = labels(lang);

  const totalClients = regions.reduce((a,b)=>a+b.clients,0);
  const totalRegions = regions.length;
  const totalKw = projects.reduce((a,b)=>a+b.kw,0);
  const totalDays = projects.reduce((a,b)=>a+daysSince(b.date),0);
  const totalKwh = projects.reduce((a,b)=>a + (b.kw * 4 * daysSince(b.date)), 0);
  const statsNode = document.querySelector('[data-stats-grid]');
  if(statsNode){
    const stats = [
      [totalClients.toLocaleString('ru-RU'), L.clients],
      [totalRegions.toLocaleString('ru-RU'), L.regions],
      [totalKw.toLocaleString('ru-RU') + ' kW', L.installed],
      [formatEnergyWh(totalKwh), L.energy],
      [totalDays.toLocaleString('ru-RU'), L.days]
    ];
    statsNode.innerHTML = stats.map(([v,t])=>`<article class="stat-card card"><strong>${v}</strong><span>${t}</span></article>`).join('');
  }
  const regionsNode = document.querySelector('[data-regions-list]');
  if(regionsNode){
    regionsNode.innerHTML = regions.map(r=>`<div class="region-row"><strong>${r.name[lang] || r.name.en}</strong><span>${r.clients}</span></div>`).join('');
  }
  const projectNode = document.querySelector('[data-project-cards]');
  if(projectNode){
    projectNode.innerHTML = projects.map(p=>projectCard(p,lang,L)).join('');
  }
  const teamNode = document.querySelector('[data-team-cards]');
  if(teamNode){
    teamNode.innerHTML = team.map(p=>teamCard(p,lang)).join('');
  }
  const certNode = document.querySelector('[data-cert-cards]');
  if(certNode){
    certNode.innerHTML = certs.map(c=>certCard(c,lang,L)).join('');
  }
  bindGallery();
}

function projectCard(p,lang,L){
  return `<article class="project-card">
    <div class="inner">
      <h3>${p.title[lang] || p.title.en}</h3>
      <p>${p.summary[lang] || p.summary.en}</p>
      <div class="meta-line">
        <span class="chip">${L.type}: ${p.type[lang] || p.type.en}</span>
        <span class="chip">${L.power}: ${p.kw} kW</span>
        <span class="chip">${L.since}: ${p.date}</span>
      </div>
      <div class="project-gallery">
        ${p.gallery.map(src=>`<img src="../${src}" alt="" data-gallery-item>`).join('')}
      </div>
    </div>
  </article>`;
}
function teamCard(p,lang){
  return `<article class="team-card"><div class="team-photo"><img src="../${p.photo}" alt=""></div><div class="inner"><h3>${p.name}</h3><p><strong>${p.role[lang] || p.role.en}</strong></p><p>${p.bio[lang] || p.bio.en}</p></div></article>`;
}
function certCard(c,lang,L){
  return `<article class="cert-card"><div class="cert-thumb"><img src="../${c.file}" alt=""></div><div class="inner"><h3>${c.title[lang] || c.title.en}</h3><p>${L.issuer}: ${c.issuer[lang] || c.issuer.en}</p><div class="meta-line"><span class="chip">${L.year}: ${c.year}</span></div></div></article>`;
}
async function renderAbout(lang){
  const team = await readJSON('../assets/data/team.json');
  const node = document.querySelector('[data-about-page]');
  if(!node) return;
  const copy = {
    uz: {
      title1:'GRID',
      text1:'Muhandislikka tayangan quyosh energetikasi kompaniyasi. Bu bo‘lim kompaniya, jamoa va ish uslubi haqidagi real ma’lumotlarni joylashtirishga tayyor.',
      title2:'Tuzilma',
      text2:'Jamoa, sertifikatlar, loyihalar va statistikani sahifa kodiga tegmasdan JSON fayllar va rasm papkalari orqali yangilash mumkin.'
    },
    ru: {
      title1:'GRID',
      text1:'Инженерная компания в сфере солнечной энергетики. Раздел готов для размещения реальной информации о компании, команде и формате работы.',
      title2:'Структура',
      text2:'Команду, сертификаты, проекты и статистику можно обновлять через JSON-файлы и папки с изображениями без изменения разметки страниц.'
    },
    en: {
      title1:'GRID',
      text1:'An engineering-focused solar energy company. This section is ready for real information about the company, team, and operating model.',
      title2:'Structure',
      text2:'Team members, certificates, projects, and statistics can be updated from JSON files and image folders without editing the page markup.'
    }
  }[lang] || {
    title1:'GRID', text1:'An engineering-focused solar energy company.', title2:'Structure', text2:'Content can be updated without editing page markup.'
  };
  node.innerHTML = `<div class="about-grid">
    <article class="about-block"><div class="about-block"><h3>${copy.title1}</h3><p>${copy.text1}</p></div></article>
    <article class="about-block"><div class="about-block"><h3>${copy.title2}</h3><p>${copy.text2}</p></div></article>
  </div>
  <div class="team-grid" style="margin-top:16px">${team.map(p=>teamCard(p,lang)).join('')}</div>`;
}
async function renderServices(lang){
  const services = await readJSON('../assets/data/services.json');
  const node = document.querySelector('[data-services-page]');
  if(!node) return;
  node.innerHTML = `<div class="service-grid">${services.map(s=>`<article class="service-card"><div class="inner"><h3>${s.title[lang]||s.title.en}</h3><p>${s.text[lang]||s.text.en}</p></div></article>`).join('')}</div>`;
}
async function renderProjects(lang){
  const projects = await readJSON('../assets/data/projects.json');
  const node = document.querySelector('[data-projects-page]');
  if(!node) return;
  node.innerHTML = `<div class="project-grid">${projects.map(p=>projectCard(p,lang,labels(lang))).join('')}</div>`;
  bindGallery();
}
async function renderCertificates(lang){
  const certs = await readJSON('../assets/data/certificates.json');
  const node = document.querySelector('[data-certificates-page]');
  if(!node) return;
  node.innerHTML = `<div class="cert-grid">${certs.map(c=>certCard(c,lang,labels(lang))).join('')}</div>`;
}
function bindGallery(){
  document.querySelectorAll('[data-gallery-item]').forEach(img=>{
    img.addEventListener('click', ()=>{
      const modal = document.getElementById('galleryModal');
      const target = document.getElementById('modalImage');
      target.src = img.src;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const modal = document.getElementById('galleryModal');
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
    });
  });
}
document.addEventListener('DOMContentLoaded', async ()=>{
  setTheme();
  initLang();
  const lang = document.body.dataset.lang || 'en';
  const page = document.body.dataset.page || 'index';
  if(page === 'index') await renderHome(lang);
  if(page === 'about') await renderAbout(lang);
  if(page === 'services') await renderServices(lang);
  if(page === 'projects') await renderProjects(lang);
  if(page === 'certificates') await renderCertificates(lang);
});
