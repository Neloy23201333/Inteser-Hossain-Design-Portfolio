(() => {
  'use strict';
  const data = window.PORTFOLIO_DATA || {works:[],videos:[]};
  const cfg = window.SITE_CONFIG || {};
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const bySrc = Object.fromEntries(data.works.map(w=>[w.src,w]));
  const byVideo = Object.fromEntries(data.videos.map(v=>[v.id,v]));

  const A = n => `assets/work/campaign/campaign-a-${String(n).padStart(3,'0')}.webp`;
  const B = n => `assets/work/campaign/campaign-b-${String(n).padStart(3,'0')}.webp`;
  const P = n => `assets/work/personal/personal-${String(n).padStart(3,'0')}.webp`;
  const C = name => `assets/work/cyber/${name}.webp`;

  const galleries = {
    hsbc2025:[A(33),A(41),A(43),A(44),A(45),A(47),A(58),A(60),B(5)],
    hsbc2026:[A(91),A(96),A(98),A(99),A(101),B(38),B(39),B(41)],
    bizverse:[A(3),A(70),A(72),A(74),A(75),A(76),A(80),A(85),A(86),A(95),A(109),B(23),B(24),B(25),B(26),B(29),B(30)],
    brainiacs:[A(12),A(13),A(14),A(15),A(16),A(17),A(22),A(23),A(25),A(27),B(17),B(18)],
    beehunt:[A(2),A(5),A(7),A(8),A(10),B(31),B(45)],
    bizbuzz:[A(39),A(40),A(57),A(61)],
    stormers:[A(4),A(62),A(63),A(64),A(65),A(67),A(68)],
    seasonal:[A(29),A(30),A(31),A(36),A(37),A(38),A(42),A(104),B(2),B(15),B(22),B(33),B(34),B(36),B(42)],
    cyber:[C('cyber-identity'),C('cyber-invitation'),C('cyber-speakers'),C('cyber-guest')],
    dodge:[P(2),P(3),P(4),P(5)],
    entertainment:[P(1),P(9),P(10)],
    experimental:[P(7),P(8),P(12),P(6),P(11)]
  };

  const contexts = {
    hsbc:[
      [B(12),'HSBC Business Case Competition — Round workshop'],
      [B(16),'HSBC Business Case Competition — Grand Finale'],
      [B(40),'HSBC Business Case Competition — Live round'],
      [B(43),'HSBC Business Case Competition — Participant context'],
      [B(44),'HSBC Business Case Competition — Closing group']
    ],
    bizverse:[
      [B(7),'BIZVERSE — Competition community'],
      [B(28),'BIZVERSE — Round 2 in session'],
      [B(32),'BIZVERSE — Event environment']
    ],
    brainiacs:[[B(19),'BRAINIACS — Live event environment']],
    beehunt:[['assets/context/exp-5.webp','BEEHUNT — Evaluation environment']],
    practice:[
      ['assets/context/exp1.webp','Director recognition / presentation'],
      ['assets/context/exp-6.webp','Workshop / mentoring environment'],
      ['assets/context/exp-11.webp','Technical and event operations'],
      ['assets/context/exp-8.webp','Personal design showcase']
    ]
  };

  const motionSets = {
    experimental:['motion-04','motion-07','motion-08'],
    studies:['motion-01','motion-02','motion-03','motion-09','motion-10','motion-11','motion-12']
  };

  // Observers are initialized before any gallery/video rendering.
  // This keeps media visible and prevents temporal-dead-zone errors during startup.
  const videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => {
    const v = entry.target;
    if (entry.isIntersecting) {
      const playPromise = v.play();
      playPromise?.catch?.(() => {});
    } else {
      v.pause();
    }
  }), { rootMargin: '180px', threshold: .08 }) : null;

  let revealObserver = null;
  function observeReveals(){
    if(!('IntersectionObserver' in window)){
      $$('.reveal').forEach(el=>el.classList.add('is-visible'));
      return;
    }
    revealObserver = revealObserver || new IntersectionObserver(entries => entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    }), {threshold:.05, rootMargin:'0px 0px -40px'});
    $$('.reveal:not(.is-visible)').forEach(el=>revealObserver.observe(el));
  }

  // Safety fallback: portfolio media must never stay hidden if an animation API fails.
  setTimeout(() => $$('.reveal').forEach(el=>el.classList.add('is-visible')), 1200);

  window.addEventListener('load',()=>setTimeout(()=>$('#preloader')?.classList.add('is-hidden'),140));
  setTimeout(()=>$('#preloader')?.classList.add('is-hidden'),1800);

  const toggle=$('.portfolio-menu-toggle'), nav=$('.portfolio-nav');
  toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});
  $$('.portfolio-nav a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');}));
  // Project index: reliable exact-section navigation (works on local file:// and deployed hosting).
  $$('.project-directory a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const hash=a.getAttribute('href');
    const target=hash ? document.querySelector(hash) : null;
    if(!target) return;
    e.preventDefault();
    target.scrollIntoView({behavior:'smooth',block:'start'});
    try{history.replaceState(null,'',hash);}catch(_){}
  }));

  // Lightbox that always contains the complete artwork.
  const dialog=$('#portfolio-lightbox'), lightImg=$('#lightbox-image'), lightTitle=$('#lightbox-title'), lightMeta=$('#lightbox-meta');
  let lightItems=[], lightIndex=0;
  const normalize = item => ({src:item.src,title:item.title||'Portfolio work',meta:item.meta||item.project||item.discipline||''});
  function openLightbox(item,collection){
    if(!dialog||!item)return;
    lightItems=(collection||[item]).map(normalize);
    const target=normalize(item); lightIndex=Math.max(0,lightItems.findIndex(x=>x.src===target.src));
    updateLightbox();
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    document.body.style.overflow='hidden';
  }
  function updateLightbox(){const it=lightItems[lightIndex];if(!it)return;lightImg.src=it.src;lightImg.alt=it.title;lightTitle.textContent=it.title;lightMeta.textContent=it.meta||'';}
  function closeLightbox(){if(dialog?.open)dialog.close();else dialog?.removeAttribute('open');document.body.style.overflow='';}
  $('.lightbox-close')?.addEventListener('click',closeLightbox);
  $('.lightbox-prev')?.addEventListener('click',()=>{lightIndex=(lightIndex-1+lightItems.length)%lightItems.length;updateLightbox();});
  $('.lightbox-next')?.addEventListener('click',()=>{lightIndex=(lightIndex+1)%lightItems.length;updateLightbox();});
  dialog?.addEventListener('click',e=>{if(e.target===dialog)closeLightbox();});
  dialog?.addEventListener('close',()=>document.body.style.overflow='');
  addEventListener('keydown',e=>{if(!dialog?.open)return;if(e.key==='ArrowRight')$('.lightbox-next')?.click();if(e.key==='ArrowLeft')$('.lightbox-prev')?.click();if(e.key==='Escape')closeLightbox();});

  function makeMedia(item,collection,showCaption=true){
    const fig=document.createElement('figure');fig.className='media-card reveal';
    const img=document.createElement('img');img.src=item.src;img.alt=item.title||item.project||'Portfolio work';img.loading='lazy';img.decoding='async';
    fig.appendChild(img);
    if(showCaption){const cap=document.createElement('figcaption');cap.innerHTML=`<span>${item.project||'Selected work'}</span><span>${item.discipline||''}</span>`;fig.appendChild(cap);}
    fig.addEventListener('click',()=>openLightbox(item,collection));return fig;
  }
  function renderGallery(el,key){
    const items=(galleries[key]||[]).map(s=>bySrc[s]).filter(Boolean);
    items.forEach(it=>el.appendChild(makeMedia(it,items,true)));
  }
  $$('[data-gallery]').forEach(el=>renderGallery(el,el.dataset.gallery));

  // Intro wall: six deliberately different signals of capability.
  const capabilityItems=[A(91),A(74),A(39),P(3),P(8)].map(s=>bySrc[s]).filter(Boolean);
  const wall=$('#capability-wall');
  capabilityItems.forEach((it,i)=>{
    const fig=makeMedia(it,capabilityItems,false);fig.className='reveal';
    const labels=['Campaign systems','Event identity','Editorial design','UI / Web design','Experimental poster'];
    const cap=document.createElement('figcaption');cap.textContent=labels[i]||'Selected work';fig.appendChild(cap);wall?.appendChild(fig);
  });
  if(wall && byVideo['motion-05']){
    const wrap=document.createElement('div');wrap.className='capability-motion reveal';
    const v=makeVideo(byVideo['motion-05'],false);wrap.appendChild(v);const cap=document.createElement('figcaption');cap.textContent='Motion / digital experience';wrap.appendChild(cap);wall.appendChild(wrap);
  }

  // Context photography.
  $$('[data-context]').forEach(el=>{
    const items=(contexts[el.dataset.context]||[]).map(([src,title])=>({src,title,meta:'Applied experience / event context'}));
    items.forEach(it=>{const fig=document.createElement('figure');fig.className='reveal';const img=document.createElement('img');img.src=it.src;img.alt=it.title;img.loading='lazy';fig.appendChild(img);fig.addEventListener('click',()=>openLightbox(it,items));el.appendChild(fig);});
  });

  // Motion: play only while close to the viewport.
  function makeVideo(item,withMeta=true){
    const v=document.createElement('video');v.src=item.src;v.poster=item.poster;v.muted=true;v.loop=true;v.playsInline=true;v.autoplay=true;v.preload='metadata';v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('aria-label',item.title);videoObserver?.observe(v);return v;
  }
  function makeMotionCard(item){const card=document.createElement('article');card.className='motion-card reveal';card.appendChild(makeVideo(item));const meta=document.createElement('div');meta.className='motion-card__meta';meta.innerHTML=`<strong>${item.title}</strong><span>${Number(item.duration).toFixed(1)}s · loop</span>`;card.appendChild(meta);return card;}
  $$('[data-video]').forEach(el=>{const item=byVideo[el.dataset.video];if(!item)return;el.appendChild(makeMotionCard(item));});
  $$('[data-video-set]').forEach(el=>{const ids=motionSets[el.dataset.videoSet]||[];ids.map(id=>byVideo[id]).filter(Boolean).forEach(v=>el.appendChild(makeMotionCard(v)));});
  const motionGrid=$('#motion-grid');motionSets.studies.map(id=>byVideo[id]).filter(Boolean).forEach(v=>motionGrid?.appendChild(makeMotionCard(v)));

  // Archive: edited main narrative, complete finished archive below. Exact duplicated visual already removed from data.
  const archiveGrid=$('#archive-grid'), status=$('#archive-status'), more=$('#load-more');
  let active='all',limit=32;
  const archiveItems=data.works;
  $('#all-count') && ($('#all-count').textContent=`(${archiveItems.length})`);
  function filtered(){return active==='all'?archiveItems:archiveItems.filter(w=>(w.discipline||w.category)===active);}
  function renderArchive(reset=false){
    if(reset)limit=32;const items=filtered(),showing=items.slice(0,limit);archiveGrid.innerHTML='';
    showing.forEach(item=>{const fig=document.createElement('figure');fig.className='archive-item reveal';const img=document.createElement('img');img.src=item.src;img.alt=item.title||item.project;img.loading='lazy';img.decoding='async';const cap=document.createElement('figcaption');cap.innerHTML=`<strong>${item.project||'Portfolio work'}</strong><span>${item.discipline||item.category||''}</span>`;fig.append(img,cap);fig.addEventListener('click',()=>openLightbox(item,items));archiveGrid.appendChild(fig);});
    status.textContent=`Showing ${showing.length} of ${items.length}`;more.style.display=showing.length<items.length?'inline-flex':'none';observeReveals();
  }
  $$('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter-btn').forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');active=btn.dataset.filter;renderArchive(true);}));
  more?.addEventListener('click',()=>{limit+=32;renderArchive(false);});renderArchive(true);



  // True compact waterfall / "Tetris" layout. Every media item keeps its full
  // native aspect ratio; only its display width changes. Items are always sent
  // to the currently shortest column, eliminating the large vertical holes
  // that CSS grid rows and balanced multi-columns can create.
  const tetrisContainers = new Set();
  const tetrisObservedChildren = new WeakSet();
  let tetrisFrame = 0;

  function tetrisColumnCount(el){
    const vw = window.innerWidth;
    if(vw <= 650) return 1;

    if(el.classList.contains('archive-grid') || el.classList.contains('portfolio-masonry--four')){
      return vw <= 1100 ? 3 : 4;
    }
    if(el.classList.contains('portfolio-masonry--two') || el.classList.contains('proof-gallery')){
      return vw <= 900 ? 1 : 2;
    }
    if(el.classList.contains('portfolio-masonry--three') || el.classList.contains('motion-grid') || el.classList.contains('practice-grid')){
      return vw <= 1100 ? 2 : 3;
    }
    if(el.classList.contains('ui-showcase--entertainment')){
      return vw <= 900 ? 2 : 3;
    }
    if(el.classList.contains('ui-showcase')){
      return vw <= 900 ? 1 : 2;
    }
    if(el.classList.contains('motion-triptych')){
      return vw <= 900 ? 2 : 3;
    }
    if(el.classList.contains('capability-wall')){
      return vw <= 900 ? 2 : 3;
    }
    return vw <= 1100 ? 2 : 3;
  }

  function layoutTetris(el){
    if(!el || !el.isConnected) return;
    const items = [...el.children].filter(ch => getComputedStyle(ch).display !== 'none');
    if(!items.length){ el.style.height = '0px'; return; }

    const styles = getComputedStyle(document.documentElement);
    const gap = parseFloat(styles.getPropertyValue('--gap')) || 10;
    const cols = Math.max(1, Math.min(tetrisColumnCount(el), items.length));
    const totalWidth = el.clientWidth;
    if(totalWidth <= 0) return;
    const colWidth = (totalWidth - gap * (cols - 1)) / cols;
    const heights = new Array(cols).fill(0);

    // First lock every item to the final column width so its complete image/video
    // can calculate its natural height at that width.
    items.forEach(item => {
      item.style.width = `${colWidth}px`;
      item.style.left = '0px';
      item.style.top = '0px';
    });

    items.forEach(item => {
      let target = 0;
      for(let i=1;i<cols;i++) if(heights[i] < heights[target]) target = i;
      const left = target * (colWidth + gap);
      const top = heights[target];
      item.style.left = `${left}px`;
      item.style.top = `${top}px`;
      heights[target] = top + item.offsetHeight + gap;
    });

    el.style.height = `${Math.max(...heights) - gap}px`;
  }

  function queueAllTetris(){
    cancelAnimationFrame(tetrisFrame);
    tetrisFrame = requestAnimationFrame(() => tetrisContainers.forEach(layoutTetris));
  }

  const childResizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => queueAllTetris()) : null;

  function observeTetrisChildren(el){
    [...el.children].forEach(child => {
      if(!tetrisObservedChildren.has(child)){
        tetrisObservedChildren.add(child);
        childResizeObserver?.observe(child);
        child.querySelectorAll?.('img,video').forEach(media => {
          media.addEventListener('load', queueAllTetris, {once:true});
          media.addEventListener('loadedmetadata', queueAllTetris, {once:true});
        });
      }
    });
  }

  function initTetris(el){
    if(!el || tetrisContainers.has(el)) return;
    tetrisContainers.add(el);
    el.classList.add('tetris-layout');
    observeTetrisChildren(el);
    new MutationObserver(() => { observeTetrisChildren(el); queueAllTetris(); })
      .observe(el,{childList:true});
    layoutTetris(el);
  }

  function initAllTetris(){
    $$('.portfolio-masonry,.proof-gallery,.practice-grid,.motion-grid,.archive-grid,.ui-showcase,.motion-triptych,.capability-wall')
      .forEach(initTetris);
    queueAllTetris();
  }

  // Contact board: information supported by the supplied CV / portfolio PDF.
  const contacts=$('#contact-links');
  const contactData=[
    cfg.portfolio&&{label:'Portfolio',value:'inteser-hossain.vercel.app',href:cfg.portfolio,featured:true},
    cfg.email&&{label:'Email',value:cfg.email,href:`mailto:${cfg.email}`},
    cfg.linkedin&&{label:'LinkedIn',value:'inteser-hossain',href:cfg.linkedin},
    cfg.github&&{label:'GitHub',value:'Neloy23201333',href:cfg.github},
    cfg.cv&&{label:'CV',value:'Download PDF',href:cfg.cv}
  ].filter(Boolean);
  contactData.forEach((l,i)=>{const a=document.createElement('a');a.href=l.href;if(!l.href.startsWith('mailto:')){a.target='_blank';a.rel='noopener'}if(l.featured)a.classList.add('contact-featured');a.innerHTML=`<span>${String(i+1).padStart(2,'0')} / ${l.label}</span><strong>${l.value}</strong><em>${l.featured?'Visit portfolio ↗':'Open ↗'}</em>`;contacts?.appendChild(a);});
  $('#year') && ($('#year').textContent=new Date().getFullYear());

  // Reveal section headings after all dynamic media has been mounted.
  $$('.section-heading,.chapter-title,.project-case__header,.project-intro,.content-project__header,.split-project__copy,.about-board__grid,.contact-board__head,.practice-note').forEach(el=>el.classList.add('reveal'));
  observeReveals();
  initAllTetris();
  window.addEventListener('resize', queueAllTetris, {passive:true});
  window.addEventListener('load', () => { initAllTetris(); queueAllTetris(); });
})();
