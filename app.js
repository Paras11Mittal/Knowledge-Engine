document.addEventListener("DOMContentLoaded", () => {
  const articles = window.ARTICLES_DB || [];

  // State
  let state = {
    currentPortal: "ALL", // 'ALL', 'HealthyGamerGG', 'Naval Ravikant', 'Luminaries & Biopics'
    selectedPillar: "ALL",
    searchQuery: "",
    currentArticleId: null,
    // Restore theme from localStorage or default to dark
    theme: localStorage.getItem("nautilus-theme") || "dark",
  };

  // Elements
  const viewHome = document.getElementById("view-home");
  const viewReader = document.getElementById("view-reader");

  const heroArticle = document.getElementById("hero-article");
  const articlesGrid = document.getElementById("articles-grid");
  const articleCountBadge = document.getElementById("article-count-badge");
  const pillarFiltersContainer = document.getElementById("pillar-filters");
  const searchInput = document.getElementById("search-input");

  const readerId = document.getElementById("reader-id");
  const readerTitle = document.getElementById("reader-title");
  const readerAuthorBadge = document.getElementById("reader-author-badge");
  const readerPillarBadge = document.getElementById("reader-pillar-badge");
  const readerTime = document.getElementById("reader-time");
  const readerTargetStruggle = document.getElementById("reader-target-struggle");
  const readerAuthorName = document.getElementById("reader-author-name");
  const readerKbName = document.getElementById("reader-kb-name");
  const readerBody = document.getElementById("reader-body");
  const tocContainer = document.getElementById("toc-container");

  const btnBack = document.getElementById("btn-back");
  const btnRandom = document.getElementById("btn-random");
  const themeToggle = document.getElementById("theme-toggle");
  const brandLogo = document.getElementById("brand-logo");
  const readingProgress = document.getElementById("reading-progress");
  const archiveTitle = document.getElementById("archive-title");
  const archiveSubtitle = document.getElementById("archive-subtitle");

  // Pillars lists
  const DRK_PILLARS = [
    "Dopamine, Motivation & Addiction Dynamics",
    "Identity, Ego & The Gifted Kid Trap",
    "Emotional Processing, Alexithymia & Trauma Digestion",
    "Vedic Psychology, Mind Architecture & Meditation Science",
    "Dharma, Purpose, Career & Overcoming Stagnation",
    "Social Dynamics, Attachment & Relational Healing",
    "Executive Function, Sleep & Neurodivergent Health",
  ];

  const NAVAL_PILLARS = [
    "Wealth Creation, Specific Knowledge & Productizing Yourself",
    "Mind Mechanics, Mental Models & First Principles",
    "Happiness, Peace & Internal Sovereignty",
    "Meditation, Awareness & Zen Practice",
    "Health, Energy & Habit Architecture",
    "Relationships, Truth & Long-Term Games",
  ];

  const BIOPIC_PILLARS = ["Luminaries & Biopic Syntheses"];

  // Initialize Lucide Icons
  if (window.lucide) window.lucide.createIcons();

  // --- PORTAL SWITCHER HANDLERS ---
  const portalBtns = document.querySelectorAll(".portal-btn");
  function resetPortalBtns() {
    portalBtns.forEach((b) => {
      // "bg-background-secondary" aligns with Tailwind config
      b.classList.remove("bg-background-secondary", "text-primary", "border", "border-subtle", "active");
      b.classList.add("text-muted", "border-transparent", "hover:text-primary");
    });
  }

  portalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      resetPortalBtns();
      const portal = btn.getAttribute("data-portal");
      state.currentPortal = portal;
      state.selectedPillar = "ALL";

      // Highlight matching buttons
      document.querySelectorAll(`.portal-btn[data-portal="${portal}"]`).forEach((b) => {
        b.classList.remove("text-muted", "border-transparent", "hover:text-primary");
        b.classList.add("bg-background-secondary", "text-primary", "border", "border-subtle", "active");
      });

      renderPillarFilters();
      renderHomeView();
    });
  });

  // Initialize active state properly
  resetPortalBtns();
  document.querySelectorAll(`.portal-btn[data-portal="${state.currentPortal}"]`).forEach((b) => {
    b.classList.remove("text-muted", "border-transparent", "hover:text-primary");
    b.classList.add("bg-background-secondary", "text-primary", "border", "border-subtle", "active");
  });

  // --- RENDERING PILLAR FILTERS ---
  function renderPillarFilters() {
    pillarFiltersContainer.innerHTML = "";

    let activePillars = [];
    if (state.currentPortal === "HealthyGamerGG") activePillars = DRK_PILLARS;
    else if (state.currentPortal === "Naval Ravikant") activePillars = NAVAL_PILLARS;
    else if (state.currentPortal === "Luminaries & Biopics") activePillars = BIOPIC_PILLARS;
    else activePillars = [...DRK_PILLARS, ...NAVAL_PILLARS, ...BIOPIC_PILLARS];

    const allBtn = document.createElement("button");
    const isActiveAll = state.selectedPillar === "ALL";
    allBtn.className = `px-3 py-1.5 min-h-[44px] md:min-h-[32px] rounded-md transition-colors ${
      isActiveAll ? "bg-background-secondary text-primary border border-subtle" : "text-muted hover:text-primary transparent"
    }`;
    allBtn.textContent = "ALL";
    allBtn.addEventListener("click", () => {
      state.selectedPillar = "ALL";
      renderPillarFilters();
      renderHomeView();
    });
    pillarFiltersContainer.appendChild(allBtn);

    activePillars.forEach((pillar) => {
      const btn = document.createElement("button");
      const shortName = pillar.split("&")[0].trim();
      const isActive = state.selectedPillar === pillar;
      btn.className = `px-3 py-1.5 min-h-[44px] md:min-h-[32px] rounded-md transition-colors ${
        isActive ? "bg-background-secondary text-primary border border-subtle" : "text-muted hover:text-primary transparent"
      }`;
      btn.textContent = shortName;
      btn.addEventListener("click", () => {
        state.selectedPillar = pillar;
        renderPillarFilters();
        renderHomeView();
      });
      pillarFiltersContainer.appendChild(btn);
    });
  }

  // --- FILTER ARTICLES ---
  function getFilteredArticles() {
    return articles.filter((art) => {
      const matchesPortal = state.currentPortal === "ALL" || art.knowledge_base === state.currentPortal;
      const matchesPillar = state.selectedPillar === "ALL" || art.pillar === state.selectedPillar;
      const q = state.searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
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
    articleCountBadge.textContent = `${filtered.length} Indexed`;

    if (state.currentPortal === "HealthyGamerGG") {
      archiveTitle.textContent = "Dr. K Index";
      archiveSubtitle.textContent =
        "Frameworks for Neurobiology, Emotion, Vedic Psychology & Executive Function";
    } else if (state.currentPortal === "Naval Ravikant") {
      archiveTitle.textContent = "Naval Ravikant Index";
      archiveSubtitle.textContent =
        "Models for Wealth, Leverage, First Principles & Independence";
    } else if (state.currentPortal === "Luminaries & Biopics") {
      archiveTitle.textContent = "Biopics Index";
      archiveSubtitle.textContent =
        "Architectures of Historic Minds (Musk, Jobs, Marcus Aurelius, etc.)";
    } else {
      archiveTitle.textContent = "System Archive";
      archiveSubtitle.textContent =
        "Unified Syntheses across Psychology, Leverage, First Principles & Biopics";
    }

    // Render Hero (Lead Story)
    let featuredArt = null;
    if (state.currentPortal === "Naval Ravikant")
      featuredArt = articles.find((a) => a.id === "N1.1") || filtered[0];
    else if (state.currentPortal === "Luminaries & Biopics")
      featuredArt = articles.find((a) => a.id === "B1.1") || filtered[0];
    else featuredArt = articles.find((a) => a.id === "1.1") || filtered[0];

    if (featuredArt && state.selectedPillar === "ALL" && !state.searchQuery) {
      heroArticle.classList.remove("hidden");
      const isNaval = featuredArt.author.includes("Naval");
      const isBiopic = featuredArt.knowledge_base.includes("Biopic") || featuredArt.id.startsWith("B");

      let badgeLabel = "DR. K ESSAY";
      let icon = "brain";
      let tagTitle = "Integrative Triad";
      let tagSub = "Western Neuroscience + Vedic Psychology";

      if (isNaval) {
        badgeLabel = "NAVAL ESSAY";
        icon = "anchor";
        tagTitle = "First-Principles";
        tagSub = "Specific Knowledge + Leverage";
      } else if (isBiopic) {
        badgeLabel = "BIOPIC ESSAY";
        icon = "star";
        tagTitle = "Life Arc & Models";
        tagSub = "Historical Breakthroughs";
      }

      heroArticle.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-8 flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <span class="badge-neutral">${badgeLabel}</span>
              <span class="text-ui-micro uppercase tracking-widest">SYS ${featuredArt.id} • ${featuredArt.reading_time}</span>
            </div>
            <h2 class="text-section-heading pt-2 hero-title hover:opacity-80 transition-opacity">
              ${featuredArt.title}
            </h2>
            <p class="text-ui-body line-clamp-3">
              ${featuredArt.target_struggle}
            </p>
            <div class="flex items-center gap-6 mt-2">
              <button class="btn-primary hero-btn min-h-[44px] md:min-h-[36px]">
                <span>Access Entry</span>
                <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
              </button>
              <span class="text-ui-micro tracking-widest uppercase hidden sm:block">${featuredArt.author}</span>
            </div>
          </div>
          <div class="lg:col-span-4 flex flex-col items-center justify-center p-6 border border-subtle rounded-xl bg-background-secondary text-center h-full">
            <div class="space-y-4 w-full">
              <div class="w-12 h-12 rounded-lg border border-subtle bg-card flex items-center justify-center mx-auto text-primary">
                <i data-lucide="${icon}" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-sm font-medium text-primary">${tagTitle}</div>
                <div class="text-ui-micro mt-1 text-muted">
                  ${tagSub}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      heroArticle.querySelector(".hero-title").addEventListener("click", () => openArticle(featuredArt.id));
      heroArticle.querySelector(".hero-btn").addEventListener("click", () => openArticle(featuredArt.id));
    } else {
      heroArticle.classList.add("hidden");
    }

    // Render Grid
    articlesGrid.innerHTML = "";
    filtered.forEach((art) => {
      const isNaval = art.author.includes("Naval");
      const isBiopic = art.knowledge_base.includes("Biopic") || art.id.startsWith("B");

      let badgeText = "DR. K";
      if (isNaval) badgeText = "NAVAL";
      else if (isBiopic) badgeText = "BIOPIC";

      const card = document.createElement("div");
      card.className = "card-outer card-hover flex flex-col justify-between group cursor-pointer h-full gap-4 interactive";
      card.innerHTML = `
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-2">
            <span class="badge-neutral">${badgeText}</span>
            <span class="text-ui-micro">${art.id} • ${art.reading_time}</span>
          </div>
          <h3 class="text-lg font-medium text-primary leading-snug line-clamp-2 pt-1 group-hover:opacity-80 transition-opacity">
            ${art.title}
          </h3>
          <p class="text-ui-body line-clamp-3">
            ${art.target_struggle}
          </p>
        </div>
        <div class="pt-4 border-t border-subtle flex items-center justify-between text-ui-micro">
          <span class="truncate max-w-[180px]">${art.pillar.split("&")[0]}</span>
          <i data-lucide="arrow-right" class="w-3 h-3 group-hover:translate-x-1 transition-transform text-muted"></i>
        </div>
      `;
      card.addEventListener("click", () => openArticle(art.id));
      articlesGrid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // --- OPEN ARTICLE / READER VIEW ---
  function openArticle(id) {
    const cleanId = id.toUpperCase();
    const art = articles.find(
      (a) =>
        a.id === cleanId ||
        a.slug.toLowerCase() === id.toLowerCase() ||
        a.filename.toUpperCase().includes(cleanId)
    );
    if (!art) return;

    state.currentArticleId = art.id;
    viewHome.classList.add("hidden");
    viewReader.classList.remove("hidden");

    readerTitle.textContent = art.title;
    readerAuthorBadge.textContent = art.author;
    readerPillarBadge.textContent = art.pillar;
    readerTime.textContent = `${art.reading_time} READ`;
    readerTargetStruggle.textContent = `"${art.target_struggle}"`;
    readerAuthorName.textContent = art.author.toUpperCase();
    readerKbName.textContent = art.knowledge_base.toUpperCase();

    // Render Markdown
    let parsedHtml = "";
    if (window.marked) {
      parsedHtml = window.marked.parse(art.content);
    } else {
      parsedHtml = art.content.replace(/\n/g, "<br>");
    }

    // Style callouts (Strictly no emojis injected here)
    parsedHtml = parsedHtml
      .replace(/<blockquote\b[^>]*>/g, '<blockquote class="callout-box">')
      .replace(
        /<strong>Neurobiological Blueprint:<\/strong>/g,
        '<div class="callout-box"><strong>Western Neurobiology:</strong>'
      )
      .replace(
        /<strong>Yogic \/ Cognitive Perspective:<\/strong>/g,
        '<div class="callout-box"><strong>Vedic Psychology:</strong>'
      );

    readerBody.innerHTML = parsedHtml;

    // Intercept cross-links
    readerBody.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && (href.includes("articles") || href.includes(".md"))) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const targetIdMatch = href.match(/([BbNn]?\d+\.\d+)/);
          if (targetIdMatch) {
            openArticle(targetIdMatch[1]);
          }
        });
      }
    });

    // Generate TOC
    tocContainer.innerHTML = "";
    const headings = readerBody.querySelectorAll("h2, h3");
    headings.forEach((h, idx) => {
      const anchorId = `section-${idx}`;
      h.id = anchorId;
      const link = document.createElement("a");
      link.href = `#${anchorId}`;
      link.className = `block text-ui-body hover:text-primary transition-colors py-1 ${
        h.tagName === "H3" ? "pl-3 text-ui-micro" : "font-medium text-primary"
      }`;
      link.textContent = h.textContent.replace(/^[\d\.\s]+/, "");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: "smooth" });
      });
      tocContainer.appendChild(link);
    });

    if (window.lucide) window.lucide.createIcons();

    // Local Storage: Save current article session state
    localStorage.setItem("nautilus-current-article", art.id);

    // Scroll restorative logic
    const savedScroll = localStorage.getItem(`nautilus-scroll-${art.id}`);
    if (savedScroll) {
      // Small timeout allows DOM layout to paint prior to scrolling offset
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }

  let scrollThrottle = false;
  // --- READING PROGRESS & CACHE CACHE ---
  window.addEventListener("scroll", () => {
    if (viewReader.classList.contains("hidden")) {
      readingProgress.style.width = "0%";
      return;
    }
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    readingProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;

    // Persist active reader scroll state
    if (!scrollThrottle && state.currentArticleId) {
      scrollThrottle = true;
      setTimeout(() => {
        localStorage.setItem(`nautilus-scroll-${state.currentArticleId}`, Math.floor(window.scrollY));
        scrollThrottle = false;
      }, 300);
    }
  });

  // --- LISTENERS ---
  btnBack.addEventListener("click", () => {
    viewReader.classList.add("hidden");
    viewHome.classList.remove("hidden");
    localStorage.removeItem("nautilus-current-article");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  brandLogo.addEventListener("click", (e) => {
    e.preventDefault();
    state.currentPortal = "ALL";
    state.selectedPillar = "ALL";
    state.searchQuery = "";
    searchInput.value = "";
    resetPortalBtns();
    document.querySelectorAll('.portal-btn[data-portal="ALL"]').forEach((b) => {
      b.classList.remove("text-muted", "border-transparent", "hover:text-primary");
      b.classList.add("bg-background-secondary", "text-primary", "border", "border-subtle", "active");
    });
    renderPillarFilters();
    renderHomeView();
    viewReader.classList.add("hidden");
    viewHome.classList.remove("hidden");
    localStorage.removeItem("nautilus-current-article");
  });

  btnRandom.addEventListener("click", () => {
    const filtered = getFilteredArticles();
    if (!filtered.length) return;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    openArticle(filtered[randomIndex].id);
  });

  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    if (!viewReader.classList.contains("hidden")) {
      viewReader.classList.add("hidden");
      viewHome.classList.remove("hidden");
      localStorage.removeItem("nautilus-current-article");
    }
    renderHomeView();
  });

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("nautilus-theme", state.theme);
  }

  themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
  });

  // INITIALIZE
  applyTheme();
  renderPillarFilters();

  const savedArticle = localStorage.getItem("nautilus-current-article");
  if (savedArticle) {
    // Render home view in the background so back button works correctly
    renderHomeView();
    openArticle(savedArticle);
  } else {
    renderHomeView();
  }
});
