document.addEventListener("DOMContentLoaded", () => {
  const articles = window.ARTICLES_DB || [];

  // State
  let state = {
    currentPortal: "ALL",
    selectedPillar: "ALL",
    searchQuery: "",
    currentArticleId: null,
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
  const readerPillarBadge = document.getElementById("reader-pillar-badge");
  const readerTime = document.getElementById("reader-time");
  const readerTargetStruggle = document.getElementById(
    "reader-target-struggle",
  );
  const readerAuthorName = document.getElementById("reader-author-name");
  const readerKbName = document.getElementById("reader-kb-name");
  const readerBody = document.getElementById("reader-body");
  const tocContainer = document.getElementById("toc-container");

  const btnBack = document.getElementById("btn-back");
  const btnRandom = document.getElementById("btn-random");
  const themeToggle = document.getElementById("theme-toggle");
  const readingProgress = document.getElementById("reading-progress");
  const archiveTitle = document.getElementById("archive-title");
  const archiveSubtitle = document.getElementById("archive-subtitle");
  const scrollContainer = document.getElementById("scroll-container");

  // Sidebar / Mobile
  const sidebar = document.getElementById("sidebar-nav");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileOverlay = document.getElementById("mobile-overlay");

  // Brand links (all of them)
  const brandLinks = document.querySelectorAll(".brand-link");

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

  if (window.lucide) window.lucide.createIcons();

  // --- MOBILE SIDEBAR ---
  function openSidebar() {
    sidebar.classList.add("open");
    mobileOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openSidebar);
  if (mobileOverlay) mobileOverlay.addEventListener("click", closeSidebar);

  // --- PORTAL SWITCHER ---
  const portalBtns = document.querySelectorAll(".portal-btn");

  function resetPortalBtns() {
    portalBtns.forEach((b) => {
      b.classList.remove("active");
    });
  }

  portalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      resetPortalBtns();
      const portal = btn.getAttribute("data-portal");
      state.currentPortal = portal;
      state.selectedPillar = "ALL";

      document
        .querySelectorAll(`.portal-btn[data-portal="${portal}"]`)
        .forEach((b) => {
          b.classList.add("active");
        });

      renderPillarFilters();
      renderHomeView();
      closeSidebar();
    });
  });

  // Init active portal
  resetPortalBtns();
  document
    .querySelectorAll(`.portal-btn[data-portal="${state.currentPortal}"]`)
    .forEach((b) => {
      b.classList.add("active");
    });

  // --- PILLAR FILTERS ---
  function renderPillarFilters() {
    pillarFiltersContainer.innerHTML = "";

    let activePillars = [];
    if (state.currentPortal === "HealthyGamerGG") activePillars = DRK_PILLARS;
    else if (state.currentPortal === "Naval Ravikant")
      activePillars = NAVAL_PILLARS;
    else if (state.currentPortal === "Luminaries & Biopics")
      activePillars = BIOPIC_PILLARS;
    else activePillars = [...DRK_PILLARS, ...NAVAL_PILLARS, ...BIOPIC_PILLARS];

    const allBtn = document.createElement("button");
    allBtn.className = `sidebar-item ${state.selectedPillar === "ALL" ? "active" : ""}`;
    allBtn.textContent = "All Pillars";
    allBtn.addEventListener("click", () => {
      state.selectedPillar = "ALL";
      renderPillarFilters();
      renderHomeView();
    });
    pillarFiltersContainer.appendChild(allBtn);

    activePillars.forEach((pillar) => {
      const btn = document.createElement("button");
      const shortName = pillar.split("&")[0].trim();
      btn.className = `sidebar-item ${state.selectedPillar === pillar ? "active" : ""}`;
      btn.textContent = shortName;
      btn.addEventListener("click", () => {
        state.selectedPillar = pillar;
        renderPillarFilters();
        renderHomeView();
        closeSidebar();
      });
      pillarFiltersContainer.appendChild(btn);
    });
  }

  // --- FILTER ARTICLES ---
  function getFilteredArticles() {
    return articles.filter((art) => {
      const matchesPortal =
        state.currentPortal === "ALL" ||
        art.knowledge_base === state.currentPortal;
      const matchesPillar =
        state.selectedPillar === "ALL" || art.pillar === state.selectedPillar;
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

  // --- RENDER HOME VIEW ---
  function renderHomeView() {
    const filtered = getFilteredArticles();
    articleCountBadge.textContent = `${filtered.length} entries`;

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
        "Architectures of Historic Minds — Musk, Jobs, Marcus Aurelius & more";
    } else {
      archiveTitle.textContent = "NAUTILUS";
      archiveSubtitle.textContent =
        "Unified Syntheses across Psychology, Leverage, First Principles & Biopics";
    }

    // Hero (lead story)
    let featuredArt = null;
    if (state.currentPortal === "Naval Ravikant")
      featuredArt = articles.find((a) => a.id === "N1.1") || filtered[0];
    else if (state.currentPortal === "Luminaries & Biopics")
      featuredArt = articles.find((a) => a.id === "B1.1") || filtered[0];
    else featuredArt = articles.find((a) => a.id === "1.1") || filtered[0];

    if (featuredArt && state.selectedPillar === "ALL" && !state.searchQuery) {
      heroArticle.classList.remove("hidden");

      heroArticle.innerHTML = `
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3 text-ui-micro">
            <span class="badge-neutral">${featuredArt.knowledge_base === "HealthyGamerGG" ? "DR. K" : featuredArt.knowledge_base.includes("Biopic") ? "BIOPIC" : "NAVAL"}</span>
            <span class="tracking-widest uppercase">${featuredArt.id} · ${featuredArt.reading_time}</span>
          </div>
          <h2 class="text-section-heading hero-title hover:opacity-80 transition-opacity cursor-pointer">
            ${featuredArt.title}
          </h2>
          <p class="text-ui-body max-w-2xl">${featuredArt.target_struggle}</p>
          <div class="pt-2">
            <button class="btn-primary hero-btn">Read Entry</button>
          </div>
        </div>
      `;

      heroArticle
        .querySelector(".hero-title")
        .addEventListener("click", () => openArticle(featuredArt.id));
      heroArticle
        .querySelector(".hero-btn")
        .addEventListener("click", () => openArticle(featuredArt.id));
    } else {
      heroArticle.classList.add("hidden");
    }

    // Article list (clean rows, not card grid)
    articlesGrid.innerHTML = "";
    filtered.forEach((art) => {
      const row = document.createElement("div");
      row.className = "article-row interactive";
      row.innerHTML = `
        <span class="article-row-id">${art.id}</span>
        <span class="article-row-title">${art.title}</span>
        <span class="article-row-meta">${art.pillar.split("&")[0].trim()}</span>
        <span class="article-row-time">${art.reading_time}</span>
      `;
      row.addEventListener("click", () => openArticle(art.id));
      articlesGrid.appendChild(row);
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
        a.filename.toUpperCase().includes(cleanId),
    );
    if (!art) return;

    state.currentArticleId = art.id;
    viewHome.classList.add("hidden");
    viewReader.classList.remove("hidden");

    readerTitle.textContent = art.title;
    readerPillarBadge.textContent = art.pillar;
    readerTime.textContent = `${art.reading_time} read`;
    readerTargetStruggle.textContent = `"${art.target_struggle}"`;
    readerAuthorName.textContent = art.author.toUpperCase();
    readerKbName.textContent = art.knowledge_base.toUpperCase();

    // Parse markdown
    let parsedHtml = "";
    if (window.marked) {
      parsedHtml = window.marked.parse(art.content);
    } else {
      parsedHtml = art.content.replace(/\n/g, "<br>");
    }

    // Style callouts
    parsedHtml = parsedHtml
      .replace(/<blockquote\b[^>]*>/g, '<blockquote class="callout-box">')
      .replace(
        /<strong>Neurobiological Blueprint:<\/strong>/g,
        '<div class="callout-box"><strong>Western Neurobiology:</strong>',
      )
      .replace(
        /<strong>Yogic \/ Cognitive Perspective:<\/strong>/g,
        '<div class="callout-box"><strong>Vedic Psychology:</strong>',
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

    localStorage.setItem("nautilus-current-article", art.id);

    const savedScroll = localStorage.getItem(`nautilus-scroll-${art.id}`);
    if (savedScroll && scrollContainer) {
      setTimeout(() => {
        scrollContainer.scrollTop = parseInt(savedScroll, 10);
      }, 50);
    } else if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }

  // --- READING PROGRESS & SCROLL CACHE ---
  let scrollThrottle = false;
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", () => {
      if (viewReader.classList.contains("hidden")) {
        readingProgress.style.width = "0%";
        return;
      }
      const totalHeight =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const progress = (scrollContainer.scrollTop / totalHeight) * 100;
      readingProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;

      if (!scrollThrottle && state.currentArticleId) {
        scrollThrottle = true;
        setTimeout(() => {
          localStorage.setItem(
            `nautilus-scroll-${state.currentArticleId}`,
            Math.floor(scrollContainer.scrollTop),
          );
          scrollThrottle = false;
        }, 300);
      }
    });
  }

  // --- BACK BUTTON ---
  btnBack.addEventListener("click", () => {
    viewReader.classList.add("hidden");
    viewHome.classList.remove("hidden");
    localStorage.removeItem("nautilus-current-article");
    if (scrollContainer) scrollContainer.scrollTop = 0;
  });

  // --- BRAND LOGO (return home) ---
  brandLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      state.currentPortal = "ALL";
      state.selectedPillar = "ALL";
      state.searchQuery = "";
      searchInput.value = "";
      resetPortalBtns();
      document
        .querySelectorAll('.portal-btn[data-portal="ALL"]')
        .forEach((b) => {
          b.classList.add("active");
        });
      renderPillarFilters();
      renderHomeView();
      viewReader.classList.add("hidden");
      viewHome.classList.remove("hidden");
      localStorage.removeItem("nautilus-current-article");
      closeSidebar();
    });
  });

  // --- RANDOM ---
  btnRandom.addEventListener("click", () => {
    const filtered = getFilteredArticles();
    if (!filtered.length) return;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    openArticle(filtered[randomIndex].id);
    closeSidebar();
  });

  // --- SEARCH ---
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    if (!viewReader.classList.contains("hidden")) {
      viewReader.classList.add("hidden");
      viewHome.classList.remove("hidden");
      localStorage.removeItem("nautilus-current-article");
    }
    renderHomeView();
  });

  // --- THEME ---
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("nautilus-theme", state.theme);
  }

  themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
  });

  // --- KEYBOARD SHORTCUT ---
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      searchInput.focus();
      if (window.innerWidth < 768) openSidebar();
    }
  });

  // INITIALIZE
  applyTheme();
  renderPillarFilters();

  const savedArticle = localStorage.getItem("nautilus-current-article");
  if (savedArticle) {
    renderHomeView();
    openArticle(savedArticle);
  } else {
    renderHomeView();
  }
});
