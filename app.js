document.addEventListener('DOMContentLoaded', () => {
  const articles = window.ARTICLES_DB || [];
  
  // State
  let state = {
    currentPortal: 'ALL', // 'ALL', 'HealthyGamerGG', 'Naval Ravikant'
    selectedPillar: 'ALL',
    searchQuery: '',
    currentArticleId: null,
    theme: 'dark'
  };

  // Elements
  const viewHome = document.getElementById('view-home');
  const viewReader = document.getElementById('view-reader');
  
  const heroArticle = document.getElementById('hero-article');
  const articlesGrid = document.getElementById('articles-grid');
  const articleCountBadge = document.getElementById('article-count-badge');
  const pillarFiltersContainer = document.getElementById('pillar-filters');
  const searchInput = document.getElementById('search-input');
  
  const readerId = document.getElementById('reader-id');
  const readerTitle = document.getElementById('reader-title');
  const readerAuthorBadge = document.getElementById('reader-author-badge');
  const readerPillarBadge = document.getElementById('reader-pillar-badge');
  const readerTime = document.getElementById('reader-time');
  const readerTargetStruggle = document.getElementById('reader-target-struggle');
  const readerAuthorName = document.getElementById('reader-author-name');
  const readerKbName = document.getElementById('reader-kb-name');
  const readerBody = document.getElementById('reader-body');
  const tocContainer = document.getElementById('toc-container');
  
  const btnBack = document.getElementById('btn-back');
  const btnRandom = document.getElementById('btn-random');
  const themeToggle = document.getElementById('theme-toggle');
  const brandLogo = document.getElementById('brand-logo');
  const readingProgress = document.getElementById('reading-progress');
  const archiveTitle = document.getElementById('archive-title');
  const archiveSubtitle = document.getElementById('archive-subtitle');

  // Pillars list
  const DRK_PILLARS = [
    'Dopamine, Motivation & Addiction Dynamics',
    'Identity, Ego & The Gifted Kid Trap',
    'Emotional Processing, Alexithymia & Trauma Digestion',
    'Vedic Psychology, Mind Architecture & Meditation Science',
    'Dharma, Purpose, Career & Overcoming Stagnation',
    'Social Dynamics, Attachment & Relational Healing',
    'Executive Function, Sleep & Neurodivergent Health'
  ];

  const NAVAL_PILLARS = [
    'Wealth Creation, Specific Knowledge & Productizing Yourself',
    'Mind Mechanics, Mental Models & First Principles',
    'Happiness, Peace & Internal Sovereignty',
    'Meditation, Awareness & Zen Practice',
    'Health, Energy & Habit Architecture',
    'Relationships, Truth & Long-Term Games'
  ];

  // Initialize Lucide Icons
  if (window.lucide) window.lucide.createIcons();

  // --- PORTAL SWITCHER HANDLERS ---
  const portalBtns = document.querySelectorAll('.portal-btn');
  portalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      portalBtns.forEach(b => b.classList.remove('bg-amber-500', 'text-black', 'active'));
      const portal = btn.getAttribute('data-portal');
      state.currentPortal = portal;
      state.selectedPillar = 'ALL';
      
      // Highlight matching buttons
      document.querySelectorAll(`.portal-btn[data-portal="${portal}"]`).forEach(b => {
        b.classList.add('bg-amber-500', 'text-black', 'active');
      });

      renderPillarFilters();
      renderHomeView();
    });
  });

  // --- RENDERING PILLAR FILTERS ---
  function renderPillarFilters() {
    pillarFiltersContainer.innerHTML = '';
    
    let activePillars = [];
    if (state.currentPortal === 'HealthyGamerGG') activePillars = DRK_PILLARS;
    else if (state.currentPortal === 'Naval Ravikant') activePillars = NAVAL_PILLARS;
    else activePillars = [...DRK_PILLARS, ...NAVAL_PILLARS];

    const allBtn = document.createElement('button');
    allBtn.className = `px-3 py-1.5 rounded-full transition-colors ${state.selectedPillar === 'ALL' ? 'bg-amber-500 text-black font-semibold' : 'text-muted hover:text-primary'}`;
    allBtn.textContent = 'ALL PILLARS';
    allBtn.addEventListener('click', () => {
      state.selectedPillar = 'ALL';
      renderPillarFilters();
      renderHomeView();
    });
    pillarFiltersContainer.appendChild(allBtn);

    activePillars.forEach(pillar => {
      const btn = document.createElement('button');
      const shortName = pillar.split('&')[0].trim();
      btn.className = `px-3 py-1.5 rounded-full transition-colors ${state.selectedPillar === pillar ? 'bg-amber-500 text-black font-semibold' : 'text-muted hover:text-primary'}`;
      btn.textContent = shortName;
      btn.addEventListener('click', () => {
        state.selectedPillar = pillar;
        renderPillarFilters();
        renderHomeView();
      });
      pillarFiltersContainer.appendChild(btn);
    });
  }

  // --- FILTER ARTICLES ---
  function getFilteredArticles() {
    return articles.filter(art => {
      const matchesPortal = state.currentPortal === 'ALL' || art.knowledge_base === state.currentPortal;
      const matchesPillar = state.selectedPillar === 'ALL' || art.pillar === state.selectedPillar;
      const q = state.searchQuery.toLowerCase();
      const matchesSearch = !q || 
        art.title.toLowerCase().includes(q) || 
        art.target_struggle.toLowerCase().includes(q) ||
        art.pillar.toLowerCase().includes(q) ||
        art.author.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q);
      return matchesPortal && matchesPillar && matchesSearch;
    });
  }

  // --- RENDERING HOME / ISSUE VIEW ---
  function renderHomeView() {
    const filtered = getFilteredArticles();
    articleCountBadge.textContent = `${filtered.length} Essays`;

    if (state.currentPortal === 'HealthyGamerGG') {
      archiveTitle.textContent = 'Dr. K / HealthyGamerGG Archive';
      archiveSubtitle.textContent = '34 Master Syntheses on Neurobiology, Emotion, Vedic Psychology & Executive Function';
    } else if (state.currentPortal === 'Naval Ravikant') {
      archiveTitle.textContent = 'Naval Ravikant Archive';
      archiveSubtitle.textContent = '22 Master Syntheses on Wealth, Leverage, Mental Models, First Principles & Peace';
    } else {
      archiveTitle.textContent = 'The Unified Issue Archive';
      archiveSubtitle.textContent = '56 Master Syntheses across Psychology, Leverage, First Principles & Peace';
    }

    // Render Hero (Lead Story)
    let featuredArt = null;
    if (state.currentPortal === 'Naval Ravikant') featuredArt = articles.find(a => a.id === 'N1.1') || filtered[0];
    else featuredArt = articles.find(a => a.id === '1.1') || filtered[0];

    if (featuredArt && state.selectedPillar === 'ALL' && !state.searchQuery) {
      heroArticle.classList.remove('hidden');
      const isNaval = featuredArt.author.includes('Naval');
      heroArticle.innerHTML = `
        <div class="p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-8 space-y-6">
            <div class="flex items-center gap-3">
              <span class="badge-amber">${isNaval ? '⚓ NAVAL RAVIKANT ESSAY' : '🧘 DR. K MASTER ESSAY'}</span>
              <span class="text-xs font-mono text-muted uppercase">ESSAY ${featuredArt.id} • ${featuredArt.reading_time}</span>
            </div>
            <h2 class="font-serif text-3xl sm:text-5xl font-bold leading-tight text-primary cursor-pointer hover:text-amber-500 transition-colors hero-title">
              ${featuredArt.title}
            </h2>
            <p class="text-secondary text-sm sm:text-base leading-relaxed line-clamp-3">
              ${featuredArt.target_struggle}
            </p>
            <div class="flex items-center gap-6 pt-2">
              <button class="btn-secondary text-xs uppercase font-semibold tracking-wider flex items-center gap-2 bg-amber-500 text-black border-amber-500 hover:bg-amber-600 hero-btn">
                <span>Read Master Essay</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
              <span class="text-xs font-mono text-muted uppercase">${featuredArt.author}</span>
            </div>
          </div>
          <div class="lg:col-span-4 flex items-center justify-center p-6 border border-subtle rounded-xl bg-secondary/40 text-center">
            <div class="space-y-3">
              <div class="w-16 h-16 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl font-serif font-bold">
                ${isNaval ? '⚓' : '🧘'}
              </div>
              <div class="font-serif text-sm font-semibold text-primary">${isNaval ? 'First-Principles & Leverage' : 'Integrative Triad'}</div>
              <p class="text-[11px] text-muted leading-normal">
                ${isNaval ? 'Specific Knowledge + Zero Marginal Cost Leverage + Peace of Mind' : 'Western Neuroscience + Vedic Psychology + Concrete Protocols'}
              </p>
            </div>
          </div>
        </div>
      `;

      heroArticle.querySelector('.hero-title').addEventListener('click', () => openArticle(featuredArt.id));
      heroArticle.querySelector('.hero-btn').addEventListener('click', () => openArticle(featuredArt.id));
    } else {
      heroArticle.classList.add('hidden');
    }

    // Render Grid
    articlesGrid.innerHTML = '';
    filtered.forEach(art => {
      const isNaval = art.author.includes('Naval');
      const card = document.createElement('div');
      card.className = 'p-6 rounded-xl border border-subtle bg-card hover:border-amber-500/40 transition-all flex flex-col justify-between group cursor-pointer space-y-4';
      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="badge-amber">${isNaval ? '⚓ NAVAL' : '🧘 DR. K'}</span>
            <span class="text-[11px] font-mono text-muted">${art.id} • ${art.reading_time}</span>
          </div>
          <h3 class="font-serif text-xl font-semibold text-primary group-hover:text-amber-500 transition-colors line-clamp-2">
            ${art.title}
          </h3>
          <p class="text-xs text-muted leading-relaxed line-clamp-3">
            ${art.target_struggle}
          </p>
        </div>
        <div class="pt-4 border-t border-subtle flex items-center justify-between text-xs text-muted font-mono">
          <span class="truncate max-w-[180px]">${art.pillar.split('&')[0]}</span>
          <span class="group-hover:translate-x-1 transition-transform text-amber-500">→</span>
        </div>
      `;
      card.addEventListener('click', () => openArticle(art.id));
      articlesGrid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // --- OPEN ARTICLE / READER VIEW ---
  function openArticle(id) {
    const cleanId = id.toUpperCase();
    const art = articles.find(a => a.id === cleanId || a.slug.toLowerCase() === id.toLowerCase() || a.filename.toUpperCase().includes(cleanId));
    if (!art) return;

    state.currentArticleId = art.id;
    viewHome.classList.add('hidden');
    viewReader.classList.remove('hidden');

    readerId.textContent = `MASTER ESSAY NO. ${art.id}`;
    readerTitle.textContent = art.title;
    readerAuthorBadge.textContent = art.author;
    readerPillarBadge.textContent = art.pillar;
    readerTime.textContent = `${art.reading_time} READ`;
    readerTargetStruggle.textContent = `"${art.target_struggle}"`;
    readerAuthorName.textContent = `BY ${art.author.toUpperCase()}`;
    readerKbName.textContent = `${art.knowledge_base.toUpperCase()} MASTER ESSAY`;

    // Render Markdown
    let parsedHtml = '';
    if (window.marked) {
      parsedHtml = window.marked.parse(art.content);
    } else {
      parsedHtml = art.content.replace(/\n/g, '<br>');
    }
    
    // Style callouts
    parsedHtml = parsedHtml
      .replace(/<blockquote\b[^>]*>/g, '<blockquote class="callout-box">')
      .replace(/<strong>Neurobiological Blueprint:<\/strong>/g, '<div class="callout-box callout-neuro"><strong>🧠 Western Neurobiology:</strong>')
      .replace(/<strong>Yogic \/ Cognitive Perspective:<\/strong>/g, '<div class="callout-box callout-vedic"><strong>🧘 Vedic Psychology:</strong>');

    readerBody.innerHTML = parsedHtml;

    // Intercept cross-links
    readerBody.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.includes('articles') || href.includes('.md'))) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetIdMatch = href.match(/([Nn]?\d+\.\d+)/);
          if (targetIdMatch) {
            openArticle(targetIdMatch[1]);
          }
        });
      }
    });

    // Generate TOC
    tocContainer.innerHTML = '';
    const headings = readerBody.querySelectorAll('h2, h3');
    headings.forEach((h, idx) => {
      const anchorId = `section-${idx}`;
      h.id = anchorId;
      const link = document.createElement('a');
      link.href = `#${anchorId}`;
      link.className = `block text-xs hover:text-amber-500 transition-colors ${h.tagName === 'H3' ? 'pl-3' : 'font-medium text-primary'}`;
      link.textContent = h.textContent.replace(/^[\d\.\s]+/, '');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth' });
      });
      tocContainer.appendChild(link);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  }

  // --- READING PROGRESS ---
  window.addEventListener('scroll', () => {
    if (viewReader.classList.contains('hidden')) {
      readingProgress.style.width = '0%';
      return;
    }
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    readingProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  });

  // --- LISTENERS ---
  btnBack.addEventListener('click', () => {
    viewReader.classList.add('hidden');
    viewHome.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  brandLogo.addEventListener('click', (e) => {
    e.preventDefault();
    state.currentPortal = 'ALL';
    state.selectedPillar = 'ALL';
    state.searchQuery = '';
    searchInput.value = '';
    document.querySelectorAll('.portal-btn').forEach(b => {
      if (b.getAttribute('data-portal') === 'ALL') b.classList.add('bg-amber-500', 'text-black', 'active');
      else b.classList.remove('bg-amber-500', 'text-black', 'active');
    });
    renderPillarFilters();
    renderHomeView();
    viewReader.classList.add('hidden');
    viewHome.classList.remove('hidden');
  });

  btnRandom.addEventListener('click', () => {
    const filtered = getFilteredArticles();
    if (!filtered.length) return;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    openArticle(filtered[randomIndex].id);
  });

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (!viewReader.classList.contains('hidden')) {
      viewReader.classList.add('hidden');
      viewHome.classList.remove('hidden');
    }
    renderHomeView();
  });

  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
  });

  // INITIALIZE
  renderPillarFilters();
  renderHomeView();
});
