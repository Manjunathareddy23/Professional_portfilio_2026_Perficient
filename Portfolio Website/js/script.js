(function () {
  "use strict";

  var doc = document;
  var rootEl = doc.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  rootEl.classList.add("js");
  rootEl.classList.add("anim");

  window.addEventListener("error", function () {
    rootEl.classList.remove("js");
    rootEl.classList.remove("anim");
    rootEl.classList.add("no-js");
    doc.body.classList.add("loaded");
  });

  window.addEventListener("error", function (dbgEv) {
    var dbgEl = doc.createElement("div");
    dbgEl.id = "REALERR";
    dbgEl.textContent = (dbgEv && dbgEv.error && dbgEv.error.stack) || dbgEv.message || "?";
    doc.body.appendChild(dbgEl);
  });

  function onLoad(cb) {
    if (doc.readyState === "complete") {
      cb();
    } else {
      window.addEventListener("load", cb, { once: true });
    }
  }

  /* ----- 1. Body fade-in on load ----- */
  onLoad(function () {
    setTimeout(function () {
      doc.body.classList.add("loaded");
    }, 60);
  });

  /* ----- 2. Active nav section ids & anchors ----- */
  var sectionIds = ["hero", "about", "expertise", "projects", "education", "experience", "contact"];
  var navAnchors = Array.prototype.slice.call(
    doc.querySelectorAll(".nav-links a[href^='#']")
  );

  /* ----- 3. Scroll progress bar ----- */
  var progressEl = doc.getElementById("scrollProgress");
  var backToTop = doc.getElementById("backToTop");
  var navbarEl = doc.getElementById("siteNavbar");

  function onScroll() {
    var scrollTop = window.scrollY || doc.documentElement.scrollTop;
    var docHeight = doc.documentElement.scrollHeight - window.innerHeight;
    if (progressEl) {
      progressEl.style.width = docHeight > 0 ? (scrollTop / docHeight) * 100 + "%" : "0%";
    }
    if (navbarEl) {
      navbarEl.classList.toggle("scrolled", scrollTop > 12);
    }
    if (backToTop) {
      backToTop.classList.toggle("visible", scrollTop > 520);
    }
    updateActiveNav(scrollTop);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ----- 3. Mobile nav toggle ----- */
  var navToggle = doc.getElementById("navToggle");
  var navLinks = doc.getElementById("navLinks");

  function closeMenu() {
    if (!navToggle || !navLinks) return;
    navToggle.classList.remove("open");
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    doc.body.classList.remove("menu-open");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      doc.body.classList.toggle("menu-open", open);
    });

    navLinks.addEventListener("click", function (e) {
      if (e.target && e.target.tagName === "A") closeMenu();
    });

    doc.addEventListener("click", function (e) {
      if (
        navLinks.classList.contains("open") &&
        !navLinks.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  /* ----- 5. Active nav link on scroll ----- */
  function updateActiveNav(scrollTop) {
    var offset = 120;
    var current = "hero";
    for (var i = 0; i < sectionIds.length; i++) {
      var el = doc.getElementById(sectionIds[i]);
      if (el && el.offsetTop - offset <= scrollTop) {
        current = sectionIds[i];
      }
    }
    for (var j = 0; j < navAnchors.length; j++) {
      var href = navAnchors[j].getAttribute("href").replace("#", "");
      navAnchors[j].classList.toggle("active", href === current);
    }
  }

  /* ----- 5. Reveal-on-scroll with stagger ----- */
  var fadeEls = Array.prototype.slice.call(doc.querySelectorAll(".fade-up"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    fadeEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  } else {
    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (!entry.isIntersecting) return;
          var siblingIndex = 0;
          var sib = el.previousElementSibling;
          while (sib) {
            if (sib.classList && sib.classList.contains("fade-up")) siblingIndex++;
            sib = sib.previousElementSibling;
          }
          el.style.transitionDelay = siblingIndex * 80 + "ms";
          el.classList.add("in-view");
          fadeObserver.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    fadeEls.forEach(function (el) {
      fadeObserver.observe(el);
    });
  }

  /* ----- 6. Count-up animation for stat numbers ----- */
  var statNumbers = Array.prototype.slice.call(doc.querySelectorAll(".stat-number"));

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    if (reducedMotion) {
      el.textContent = String(target);
      return;
    }
    var start = null;
    var duration = 1600;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    }

    requestAnimationFrame(step);
  }

  if (statNumbers.length && "IntersectionObserver" in window) {
    var statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (!entry.isIntersecting) return;
          animateCount(el);
          statsObserver.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    statNumbers.forEach(function (el) {
      statsObserver.observe(el);
    });
  } else {
    statNumbers.forEach(animateCount);
  }

  /* ----- 7. Hero cursor glow (desktop only) ----- */
  var heroEl = doc.getElementById("hero");
  var glowEl = doc.getElementById("heroGlow");

  if (heroEl && glowEl && finePointer && !reducedMotion) {
    heroEl.addEventListener("mousemove", function (e) {
      var rect = heroEl.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      glowEl.style.setProperty("--gx", x + "px");
      glowEl.style.setProperty("--gy", y + "px");
      glowEl.style.left = x + "px";
      glowEl.style.top = y + "px";
    });
  }

  /* ----- 9. Blob parallax (desktop only) ----- */
  var blobs = Array.prototype.slice.call(doc.querySelectorAll(".organic-blob"));

  if (heroEl && blobs.length && finePointer && !reducedMotion) {
    heroEl.addEventListener("mousemove", function (e) {
      var rect = heroEl.getBoundingClientRect();
      var dx = (e.clientX - rect.left) / rect.width - 0.5;
      var dy = (e.clientY - rect.top) / rect.height - 0.5;

      blobs.forEach(function (blob, idx) {
        var depth = (idx + 1) * 14;
        blob.style.transform =
          "translate(" + dx * depth + "px, " + dy * depth + "px)";
      });
    });
    heroEl.addEventListener("mouseleave", function () {
      blobs.forEach(function (blob) {
        blob.style.transform = "";
      });
    });
  }

  /* ----- 10. Smooth anchor scrolling (offset aware) ----- */
  doc.querySelectorAll("a[href^='#']").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var targetEl = doc.querySelector(id);
      if (!targetEl) return;
      e.preventDefault();
      var top = targetEl.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });

  /* ----- 11. Project details modal ----- */
  var PROJECTS = {
    gadgetfs: {
      tag: "Full Stack · AI",
      title: "GadgetGrid — Full-Stack E-Commerce Platform",
      overview: "A full-stack e-commerce application for smartphones, laptops, smartwatches, cameras and accessories. React 19 and Vite power the frontend, while Spring Boot 3.5 and PostgreSQL power the backend, with secure authentication, payment integration, role-based access and an AI shopping assistant.",
      features: [
        "Product discovery with advanced search, filtering, sorting, reviews and recently viewed tracking",
        "Email/password and Google Sign-In with JWT sessions and role-based access for Customers and Admins",
        "Server-synchronized cart and wishlist with stock and price validation before checkout",
        "Multi-step checkout with COD, Cashfree UPI/Card payments and server-side payment verification",
        "Order history, status tracking and downloadable, printable invoices",
        "Admin dashboard for product CRUD, image uploads, order status and payment tracking",
        "GridBot, a Gemini-powered assistant for product recommendations and customer queries",
        "Swagger UI for interactive API documentation"
      ],
      flow: [
        "React frontend calls Spring Boot REST APIs",
        "JWT secures routes and admin endpoints",
        "PostgreSQL stores products, users, orders and payments, versioned with Flyway",
        "Cashfree handles payments, verified server-side",
        "Gemini AI powers the GridBot shopping assistant"
      ],
      stack: ["React 19", "Vite", "Java 17", "Spring Boot 3.5", "Spring Security", "JWT", "PostgreSQL", "Flyway", "Google OAuth", "Cashfree", "Gemini AI", "Swagger", "Maven"],
      outcomes: [
        "Built a scalable full-stack e-commerce platform with complete product, cart, order and payment workflows",
        "Implemented secure JWT authentication, RBAC and Google OAuth",
        "Integrated Cashfree payments and Gemini-based AI assistance",
        "Managed secrets through environment variables and schema changes through Flyway migrations"
      ],
      github: "https://github.com/Perficient-Corporate/GGTP_BLR_PD_SEP_26/tree/main/Projects/Individual/M-Kummathi/Week%204/Capstone%204"
    },
    lendwise: {
      tag: "FinTech · Microservices",
      title: "LendWise — AI-Powered Loan Management Platform",
      overview: "A full-stack digital lending platform covering loan application, approval, disbursement, repayment and collections. It combines secure authentication, KYC, risk assessment, EMI management and AI-powered credit intelligence to help loan officers make informed decisions.",
      features: [
        "JWT and Google OAuth login with RBAC, HttpOnly cookies, lockout protection and rate limiting",
        "Digital KYC submission with review and approval workflow",
        "Loan applications with eligibility checks, review workflow and audited approvals",
        "AI credit scoring, fraud and duplicate-identity detection, risk bands and officer recommendations",
        "Human-in-the-loop approval to keep decisions compliant",
        "Automatic EMI schedules, sequential payment validation, repayment tracking and overdue identification",
        "Collections tracking with notes, follow-ups and email notifications",
        "Admin dashboard, audit logs, financial reporting and ledger management"
      ],
      flow: [
        "React frontend talks to the Spring Boot Core Service",
        "Core Service handles business logic, auth and workflows",
        "FastAPI Intelligence Service scores credit, detects fraud and validates KYC",
        "PostgreSQL holds transactional and audit data",
        "Nginx reverse proxy and Docker Compose run the stack, with GitHub Actions CI/CD"
      ],
      stack: ["React", "Vite", "Java 21", "Spring Boot 3.5", "Spring Security", "JWT", "FastAPI", "Python 3.12", "PostgreSQL", "Flyway", "Docker", "Nginx", "GitHub Actions", "Google OAuth"],
      outcomes: [
        "Built a complete digital lending platform on a microservices architecture",
        "Developed AI-assisted credit scoring and fraud detection services",
        "Automated KYC, loan approval, EMI and collections workflows",
        "Hardened security with CSRF protection, BCrypt, SameSite Strict cookies and full audit trails"
      ],
      github: "https://github.com/Perficient-Corporate/GGTP_BLR_PD_SEP_26/tree/main/Projects/Individual/M-Kummathi/Week%205/Capstone%205"
    },
    onewealth: {
      tag: "Wealth · KYC & Compliance",
      title: "OneWealth — Digital Wealth Management & Client Onboarding",
      overview: "A digital wealth management and onboarding platform that streamlines customer acquisition, KYC verification, compliance review and portfolio access. A secure multi-stage workflow connects clients, operations teams and compliance officers across three modules: ClientFirst onboarding, Operations Management and the Client Portal.",
      features: [
        "Secure registration with email activation and 6-digit two-factor authentication",
        "11-section KYC onboarding with document upload, status tracking and downloadable KYC PDF",
        "FATCA/CRS checks, PEP screening, and Source of Wealth and Funds verification",
        "Five-role pipeline: Operations Executive, KYC Officer, Compliance Checker (risk score 0 to 100), Senior Operations and Operations Manager",
        "Mandatory review comments, structured approvals and automated hand-offs between departments",
        "Client Portal with unique Client ID login, dashboard, notifications and profile management",
        "Automated emails for welcome, submission, approval or rejection, and Client ID issuance",
        "Complete audit trail of every action"
      ],
      flow: [
        "Client registers and completes email and 2FA verification",
        "Client submits KYC details and documents",
        "Operations Executive, then KYC Officer, then Compliance Checker review",
        "Senior Operations approves or rejects",
        "Approved clients receive a Client ID and access the portal",
        "Every step is recorded in the audit system"
      ],
      stack: ["React", "Spring Boot", "Spring Security", "JWT", "PostgreSQL", "Flyway", "Java", "REST APIs", "2FA", "RBAC", "Email Integration", "Audit Logging"],
      outcomes: [
        "Automated multi-stage KYC and compliance workflows with role-based reviews",
        "Enabled secure onboarding with two-factor authentication",
        "Established full audit logging and workflow transparency",
        "Reduced manual onboarding effort while improving compliance adherence"
      ],
      github: "https://github.com/Perficient-Corporate/GGTP_BLR_PD_SEP_26/tree/main/Projects/Individual/M-Kummathi/Week%207/Capstone%207"
    },
    asist: {
      tag: "AI + Full Stack",
      title: "AI-Based Student Assistance Platform",
      problem: "Students juggle career planning, resume building, interview preparation, learning and documentation across disconnected tools — with heavy manual effort and no single source of truth.",
      solution: "A unified full-stack AI platform with 12+ AI modules that handles analysis, guidance and document generation — from resume building and ATS analysis to interview practice, learning roadmaps and PDF document chat.",
      stack: ["React.js", "Python", "Django REST APIs", "MySQL", "Vector DB", "LLMs", "RAG", "Prompt Engineering"],
      github: "https://github.com/Manjunathareddy23/AI_Student_Assistance_2026/tree/master",
      flow: [
        "User opens the platform",
        "React.js frontend calls Django REST API",
        "API queries MySQL and the vector store",
        "GenAI APIs process and generate output",
        "Resume, roadmap, PDF chat and interview prep are served"
      ]
    },
    portfoliogen: {
      tag: "Productivity",
      title: "Resume to Portfolio Generator",
      problem: "Manually converting a resume into a clean, professional portfolio website takes time and design effort.",
      solution: "Upload a resume and instantly get a parsed, ready-to-host basic portfolio page generated from its content.",
      stack: ["Python", "Resume Parsing", "HTML/CSS Generation", "File Handling"],
      github: "https://lnkd.in/p/g_zVE_74",
      flow: [
        "Upload resume",
        "Parse and extract sections",
        "Map content into a portfolio template",
        "Generate the portfolio page",
        "Download or deploy it"
      ]
    },
    qrcode: {
      tag: "Utility",
      title: "Image to QR Generator",
      problem: "Standard QR codes look plain and carry no branding or personality.",
      solution: "Upload an image and generate a customized QR code that embeds the image/branding into a styled, downloadable QR.",
      stack: ["Python", "qrcode", "Pillow (PIL)", "Image Processing"],
      github: "https://github.com/Manjunathareddy23/QR-Image",
      flow: [
        "Upload an image",
        "Configure the QR payload",
        "Render a styled QR code",
        "Preview and download it"
      ]
    }
  };

  var modal = doc.getElementById("projectModal");
  var projectCards = Array.prototype.slice.call(doc.querySelectorAll(".project-card"));
  var lastFocused = null;

  function fillList(id, items, tagName) {
    var host = doc.getElementById(id);
    if (!host) return;
    host.innerHTML = "";
    (items || []).forEach(function (text) {
      var node = doc.createElement(tagName);
      node.textContent = text;
      host.appendChild(node);
    });
  }

  function openModal(key) {
    var data = PROJECTS[key];
    if (!modal || !data) return;

    doc.getElementById("modalTag").textContent = data.tag;
    doc.getElementById("modalTitle").textContent = data.title;
    doc.getElementById("modalOverview").textContent = data.overview || ((data.problem ? "Problem: " + data.problem + " " : "") + (data.solution ? "Solution: " + data.solution : ""));

    fillList("modalFeatures", data.features, "li");
    fillList("modalFlow", data.flow, "li");
    fillList("modalTech", data.stack, "span");
    fillList("modalOutcomes", data.outcomes, "li");
    ["modalFeatures", "modalOutcomes"].forEach(function (id) {
      var sec = doc.getElementById(id).closest(".modal-section");
      if (sec) sec.hidden = !(data[id === "modalFeatures" ? "features" : "outcomes"] || []).length;
    });

    var actions = doc.getElementById("modalActions");
    var gh = doc.getElementById("modalGithub");
    if (data.github) {
      gh.setAttribute("href", data.github);
      actions.hidden = false;
    } else {
      gh.setAttribute("href", "#");
      actions.hidden = true;
    }

    doc.querySelector(".modal-scroll").scrollTop = 0;

    lastFocused = doc.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    doc.body.classList.add("modal-open");
    modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    doc.body.classList.remove("modal-open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  projectCards.forEach(function (card) {
    card.addEventListener("click", function () {
      openModal(card.getAttribute("data-project"));
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card.getAttribute("data-project"));
      }
    });
  });

  if (modal) {
    Array.prototype.slice.call(modal.querySelectorAll("[data-modal-close]")).forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }
})();