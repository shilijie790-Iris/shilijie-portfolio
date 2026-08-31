/* ===== 作品集渲染与交互 ===== */
(function(){
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

  const TYPE_CLASS = {"平面":"t-plan","视频":"t-video","AIGC":"t-aigc","运营":"t-op","图文":"t-wen"};
  const projects = PORTFOLIO.projects;

  function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  /* ---------- 渲染项目 ---------- */

  /* ---------- 作品导览 ---------- */
  function renderGuide(){
    const host = $("#guideGrid");
    if(!host) return;
    host.innerHTML = projects.map((p,i)=>`
      <a class="guide-card protect card-anim" href="#proj-${p.id}" style="animation-delay:${(i%8)*50}ms">
        <span class="guide-no">0${p.no}</span>
        <h3>${p.title}</h3>
        <p>${esc(p.role)}</p>
        <span class="guide-go">查看作品 <i>→</i></span>
      </a>`).join("");
  }

  function renderProjects(){
    const host = $("#projectList");
    projects.forEach(p=>{
      const sec = document.createElement("div");
      sec.className = "project reveal";
      sec.id = "proj-" + p.id;
      sec.innerHTML = `
        <aside class="pj-rail">
          <div class="pj-no">PROJECT ${p.no}</div>
          <h3 class="pj-title">${p.title}</h3>
          <div class="pj-period">${p.period}</div>
          <div class="pj-role">${p.role}</div>
          <div class="pj-tags">${p.tags.map(t=>`<span>${t}</span>`).join("")}</div>
          <p class="pj-summary">${p.summary}</p>
        </aside>
        <div class="pj-body">${p.groups.map(g=>renderGroup(g, p)).join("")}</div>`;
      host.appendChild(sec);
    });
  }

  function renderGroup(g, project){
    const isVidGrid = g.items.some(i=>i.kind==="video");
    let k = 0;
    const inner = g.items.map(it=>{
      const delay = (k++ % 12) * 45;
      if(it.kind==="img") return `
        <div class="img-card protect card-anim" data-kind="img" data-src="${it.src}" data-title="${esc(it.title)}" data-project="${esc(project.title)}"
             style="background-image:url('${it.src}');animation-delay:${delay}ms" role="img" aria-label="${esc(it.title)}"></div>`;
      if(it.kind==="video") return `
        <div class="vid-card protect card-anim${project.videoAspect ? "" : (it.ratio<1?" vertical":"")}" data-kind="video" data-src="${it.src}" data-poster="${it.poster}" data-title="${esc(it.title)}" data-project="${esc(project.title)}"
             style="background-image:url('${it.poster}');aspect-ratio:${project.videoAspect || (it.ratio<1?"9/16":"16/10")};animation-delay:${delay}ms">
          <div class="vid-play"><span class="play-btn"></span></div>
          <div class="vid-cap">${esc(it.title)}</div>
        </div>`;
      if(it.kind==="pdf") return `
        <a class="pdf-card protect" href="${it.src}" target="_blank" rel="noopener">
          <div class="pdf-thumb">📄</div>
          <div class="pdf-cap">${esc(it.title)}</div>
          <div class="pdf-sub">打开文档 ↗</div>
        </a>`;
      return "";
    }).join("");
    return `<div class="pj-group">
      <div class="pj-group-name"><b>${esc(g.name)}</b><span>${esc(g.note||"")}</span></div>
      <div class="${isVidGrid ? "vid-grid" : "img-grid"}">${inner}</div>
    </div>`;
  }

  /* ---------- 全部作品：按项目筛选 ---------- */
  let allItems = [];
  const FILTERS = ["全部"].concat(projects.map(p=>p.title));
  function buildAll(){
    allItems = [];
    projects.forEach(p=>{
      p.groups.forEach(g=>{
        g.items.forEach(it=>{
          allItems.push(Object.assign({}, it, {type:g.type, group:g.name, project:p.title, pno:p.no}));
        });
      });
    });
    const bar = $("#filterBar");
    bar.innerHTML = FILTERS.map(f=>`<button class="filter-btn${f==="全部"?" active":""}" data-f="${f}">${f}</button>`).join("");
    bar.addEventListener("click", e=>{
      const btn = e.target.closest(".filter-btn"); if(!btn) return;
      $$(".filter-btn", bar).forEach(b=>b.classList.toggle("active", b===btn));
      renderAll(btn.dataset.f);
    });
    renderAll("全部");
  }

  function renderAll(filter){
    const grid = $("#allGrid");
    const list = allItems.filter(it=> filter==="全部" || it.project===filter);
    grid.innerHTML = "";
    list.forEach((it,i)=>{
      const delay = (i % 12) * 45;
      let card;
      if(it.kind==="img"){
        card = document.createElement("div");
        card.className = "all-card protect card-anim";
        card.dataset.kind = "img"; card.dataset.idx = i;
        card.style.animationDelay = delay + "ms";
        card.innerHTML = `
          <div class="all-thumb" style="background-image:url('${it.src}')"></div>
          <span class="all-type ${TYPE_CLASS[it.type]||"t-plan"}">${it.type}</span>
          <div class="all-cap"><b>${esc(it.title)}</b><span>${esc(it.group)} · ${it.pno}${esc(it.project)}</span><span class="go">↗</span></div>`;
      } else if(it.kind==="video"){
        card = document.createElement("div");
        card.className = "all-card protect card-anim";
        card.dataset.kind = "video"; card.dataset.idx = i;
        card.style.animationDelay = delay + "ms";
        card.innerHTML = `
          <div class="all-thumb" style="background-image:url('${it.poster}')"><div class="thumb-play">▶</div></div>
          <span class="all-type ${TYPE_CLASS[it.type]||"t-video"}">${it.type}</span>
          <div class="all-cap"><b>${esc(it.title)}</b><span>${esc(it.group)} · ${it.pno}${esc(it.project)}</span><span class="go">↗</span></div>`;
      } else if(it.kind==="pdf"){
        card = document.createElement("a");
        card.className = "all-card protect";
        card.href = it.src; card.target = "_blank"; card.rel = "noopener";
        card.innerHTML = `
          <div class="all-thumb pdf-thumb-big">📄</div>
          <span class="all-type ${TYPE_CLASS[it.type]||"t-wen"}">${it.type}</span>
          <div class="all-cap"><b>${esc(it.title)}</b><span>${esc(it.group)} · ${it.pno}${esc(it.project)}</span></div>`;
      }
      if(card) grid.appendChild(card);
    });
    $$(".all-card", grid).forEach(card=>{
      card.addEventListener("click", e=>{
        if(card.tagName==="A") return;
        const kind = card.dataset.kind;
        if(kind==="img") openLightbox(Number(card.dataset.idx));
        else if(kind==="video") openVideo(allItems[Number(card.dataset.idx)]);
      });
    });
  }

  /* ---------- 图片灯箱 ---------- */
  const lb = $("#lightbox"), lbBox = $("#lbBox"), lbCap = $("#lbCap");
  let imgIndex = -1, imgList = [];
  function openLightbox(i){
    imgList = allItems.filter(it=>it.kind==="img");
    imgIndex = imgList.findIndex(it=>it===allItems[i]);
    showImage();
    lb.classList.remove("hidden");
  }
  function showImage(){
    const it = imgList[imgIndex];
    lbBox.style.backgroundImage = `url('${it.src}')`;
    lbCap.textContent = `${it.title} · ${it.group} · ${it.project}（仅供预览）`;
  }
  $("#lbClose").addEventListener("click", ()=>lb.classList.add("hidden"));
  $("#lbPrev").addEventListener("click", e=>{e.stopPropagation(); imgIndex=(imgIndex-1+imgList.length)%imgList.length; showImage();});
  $("#lbNext").addEventListener("click", e=>{e.stopPropagation(); imgIndex=(imgIndex+1)%imgList.length; showImage();});
  lb.addEventListener("click", e=>{ if(e.target===lb) lb.classList.add("hidden"); });
  document.addEventListener("keydown", e=>{
    if(lb.classList.contains("hidden")) return;
    if(e.key==="Escape") lb.classList.add("hidden");
    if(e.key==="ArrowLeft") $("#lbPrev").click();
    if(e.key==="ArrowRight") $("#lbNext").click();
  });

  /* ---------- 视频弹窗 ---------- */
  const vm = $("#videoModal"), vv = $("#vmVideo"), vmCap = $("#vmCap");
  function openVideo(it){
    vv.src = it.src; vmCap.textContent = `${it.title} · ${it.group} · ${it.project}`;
    vm.classList.remove("hidden");
    vv.play().catch(()=>{});
  }
  function closeVideo(){
    vm.classList.add("hidden"); vv.pause(); vv.removeAttribute("src"); vv.load();
  }
  $("#vmClose").addEventListener("click", closeVideo);
  vm.addEventListener("click", e=>{ if(e.target===vm) closeVideo(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !vm.classList.contains("hidden")) closeVideo(); });

  /* ---------- 项目区点击（事件委托） ---------- */
  $("#projectList").addEventListener("click", e=>{
    const imgCard = e.target.closest(".img-card");
    if(imgCard){
      const idx = allItems.findIndex(it=>it.kind==="img" && it.src===imgCard.dataset.src);
      if(idx>=0){ openLightbox(idx); }
      return;
    }
    const vidCard = e.target.closest(".vid-card");
    if(vidCard){
      const it = allItems.find(x=>x.kind==="video" && x.src===vidCard.dataset.src);
      if(it) openVideo(it);
    }
  });

  /* ---------- 防下载 ---------- */
  document.addEventListener("contextmenu", e=>{
    if(e.target.closest(".protect") || e.target.closest(".modal")) e.preventDefault();
  });
  document.addEventListener("dragstart", e=>{
    if(e.target.closest(".protect") || e.target.closest(".modal")) e.preventDefault();
  });
  document.addEventListener("gesturestart", e=>{ if(e.target.closest(".protect")) e.preventDefault(); });

  /* ---------- 导航 ---------- */
  const navToggle = $("#navToggle"), navLinks = $("#navLinks");
  navToggle.addEventListener("click", ()=>navLinks.classList.toggle("open"));
  $$("a", navLinks).forEach(a=>a.addEventListener("click", ()=>navLinks.classList.remove("open")));

  /* ---------- 数字滚动 ---------- */
  function animateCount(el){
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const dur = 1400, t0 = performance.now();
    function tick(t){
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e) + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const statIO = new IntersectionObserver(es=>{
    es.forEach(en=>{ if(en.isIntersecting){ $$("[data-count]", en.target).forEach(animateCount); statIO.unobserve(en.target); } });
  }, {threshold:.5});
  $$(".hero-stats").forEach(s=>statIO.observe(s));

  /* ---------- 入场动画 ---------- */
  const io = new IntersectionObserver(es=>{
    es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
  }, {threshold:.12});
  function observeReveals(root){ $$(".reveal:not(.in)", root).forEach(el=>io.observe(el)); }

  /* ---------- 视差 ---------- */
  const blobs = $$(".blob");
  window.addEventListener("scroll", ()=>{
    const y = window.scrollY || 0;
    blobs.forEach(b=>{
      const f = parseFloat(b.dataset.parallax || "1");
      b.style.transform = `translateY(${y * .12 * f}px)`;
    });
  }, {passive:true});

  /* ---------- 回到顶部 + 导航阴影 ---------- */
  const toTop = $("#toTop"), nav = $("#nav");
  window.addEventListener("scroll", ()=>{
    const y = window.scrollY || document.documentElement.scrollTop;
    if(toTop) toTop.classList.toggle("show", y > 600);
    if(nav) nav.classList.toggle("scrolled", y > 10);
  }, {passive:true});
  if(toTop) toTop.addEventListener("click", ()=>window.scrollTo({top:0, behavior:"smooth"}));

  /* ---------- 初始化 ---------- */
  renderProjects();
  renderGuide();
  buildAll();
  observeReveals(document);
})();
