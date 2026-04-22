const config = window.EVERVOW_CONFIG || {};
const bodyPage = document.body.dataset.page;
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = document.querySelectorAll(".nav-links a");
const whatsappNumber = config.whatsappNumber || "919876543210";
const whatsappDefaultMessage =
  "Hi EverVow Events, I want to plan my event.";
const contactApiUrl = config.contactApiUrl || "/api/contact";
const ga4MeasurementId = config.ga4MeasurementId || "";
const metaPixelId = config.metaPixelId || "";

function initAnalytics() {
  if (ga4MeasurementId && ga4MeasurementId !== "G-XXXXXXXXXX") {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ga4MeasurementId, {
      anonymize_ip: true,
      send_page_view: true,
    });

    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`;
    document.head.appendChild(gaScript);
  }

  if (metaPixelId && metaPixelId !== "000000000000000") {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );
    window.fbq("init", metaPixelId);
    window.fbq("track", "PageView");
  }
}

function trackEvent(eventName, params = {}) {
  if (window.gtag) {
    window.gtag("event", eventName, params);
  }
  if (window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }
}

window.trackEvent = trackEvent;
initAnalytics();

// SPA Routing
const spaPages = {
  "": "home",
  "/": "home",
  "/services": "services",
  "/about": "about",
  "/testimonials": "testimonials",
  "/contact": "contact",
};

function getRouteFromHash() {
  const hash = window.location.hash || "#/";
  return hash.substring(1); // Remove the '#'
}

function showPage(page) {
  // Hide all SPA pages
  document.querySelectorAll(".spa-page").forEach((el) => {
    el.style.display = "none";
  });

  // Hide all sections except home (home sections are visible by default)
  const mainContent = document.getElementById("main-content");
  const sections = mainContent.querySelectorAll(
    ":scope > section:not(.spa-page)"
  );

  if (page === "home") {
    sections.forEach((el) => {
      el.style.display = "";
    });
  } else {
    sections.forEach((el) => {
      el.style.display = "none";
    });
    const pageEl = document.getElementById(`spa-${page}`);
    if (pageEl) {
      pageEl.style.display = "";
    }
  }

  // Update active nav link
  navAnchors.forEach((link) => {
    link.classList.remove("active");
  });
  const navAttr = page === "home" ? "home" : page;
  const activeLink = document.querySelector(`[data-nav="${navAttr}"]`);
  if (activeLink) activeLink.classList.add("active");

  // Scroll to top
  window.scrollTo(0, 0);
}

function handleRouteChange() {
  const hash = getRouteFromHash();
  const page = spaPages[hash] || "home";
  showPage(page);
}

window.addEventListener("hashchange", handleRouteChange);
window.addEventListener("load", handleRouteChange);

// Initialize on page load
handleRouteChange();

function setActiveNavByDataNav(navKey) {
  const navItems = document.querySelectorAll(".nav-links a[data-nav]");
  navItems.forEach((item) => item.classList.remove("active"));
  const activeLink = document.querySelector(`.nav-links a[data-nav="${navKey}"]`);
  if (activeLink) activeLink.classList.add("active");
}

if (bodyPage && bodyPage !== "home") {
  setActiveNavByDataNav(bodyPage);
}

if (bodyPage === "home") {
  const sectionIds = ["home", "services", "about", "testimonials", "contact"];
  const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function setHomeActiveSection(id) {
    sectionLinks.forEach((link) => link.classList.remove("active"));
    const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (activeLink) activeLink.classList.add("active");
  }

  function updateFromHash() {
    const hash = window.location.hash.replace("#", "");
    if (sectionIds.includes(hash)) {
      setHomeActiveSection(hash);
    } else {
      setHomeActiveSection("home");
    }
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      let topVisible = null;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!topVisible || entry.intersectionRatio > topVisible.intersectionRatio) {
            topVisible = entry;
          }
        }
      });

      if (topVisible?.target?.id) {
        setHomeActiveSection(topVisible.target.id);
      }
    },
    { threshold: 0.45 }
  );

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });

  window.addEventListener("hashchange", updateFromHash);
  updateFromHash();
}

if (!document.querySelector(".whatsapp-float")) {
  const whatsappFloat = document.createElement("a");
  whatsappFloat.className = "whatsapp-float";
  whatsappFloat.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappDefaultMessage)}`;
  whatsappFloat.target = "_blank";
  whatsappFloat.rel = "noopener";
  whatsappFloat.setAttribute("aria-label", "Chat on WhatsApp");
  whatsappFloat.setAttribute("data-track", "whatsapp_floating");
  whatsappFloat.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.45 0 .08 5.37.08 12c0 2.11.55 4.18 1.59 6.02L0 24l6.17-1.61A11.94 11.94 0 0 0 12.07 24c6.62 0 11.99-5.37 11.99-12a11.9 11.9 0 0 0-3.54-8.52Zm-8.45 18.5a9.97 9.97 0 0 1-5.08-1.39l-.36-.21-3.66.96.98-3.57-.24-.37a9.96 9.96 0 1 1 8.36 4.58Zm5.46-7.47c-.3-.15-1.79-.88-2.07-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.46-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.57-.49-.49-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.08 2.89 1.23 3.09c.15.2 2.13 3.25 5.17 4.56.72.31 1.29.5 1.73.64.73.23 1.39.2 1.91.12.58-.09 1.79-.73 2.04-1.43.25-.7.25-1.3.17-1.43-.08-.13-.27-.2-.57-.35Z"
      />
    </svg>`;
  document.body.appendChild(whatsappFloat);
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    const clickInsideMenu =
      navLinks.contains(event.target) || menuToggle.contains(event.target);
    if (!clickInsideMenu && navLinks.classList.contains("open")) {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

navAnchors.forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinks) navLinks.classList.remove("open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (event) => {
  const clickedLink = event.target.closest("a");
  if (!clickedLink) return;

  const href = clickedLink.getAttribute("href") || "";
  const trackLabel =
    clickedLink.dataset.track || clickedLink.textContent.trim().toLowerCase();

  if (href.includes("wa.me")) {
    trackEvent("whatsapp_click", {
      page: bodyPage || "unknown",
      label: trackLabel,
    });
  }

  if (href.startsWith("tel:")) {
    trackEvent("phone_click", {
      page: bodyPage || "unknown",
      label: trackLabel,
    });
  }

  if (href.startsWith("mailto:")) {
    trackEvent("email_click", {
      page: bodyPage || "unknown",
      label: trackLabel,
    });
  }
});

const revealElements = document.querySelectorAll(".reveal");
if (revealElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 50, 300)}ms`;
    observer.observe(element);
  });
}

const testimonialItems = document.querySelectorAll(".testimonial-item");
const testPrev = document.getElementById("testPrev");
const testNext = document.getElementById("testNext");
let testimonialIndex = 0;

function renderTestimonial(index) {
  testimonialItems.forEach((item, idx) => {
    item.classList.toggle("active", idx === index);
  });
}

function nextTestimonial() {
  testimonialIndex = (testimonialIndex + 1) % testimonialItems.length;
  renderTestimonial(testimonialIndex);
}

function prevTestimonial() {
  testimonialIndex =
    (testimonialIndex - 1 + testimonialItems.length) % testimonialItems.length;
  renderTestimonial(testimonialIndex);
}

if (testimonialItems.length > 0 && testPrev && testNext) {
  testPrev.addEventListener("click", () => {
    prevTestimonial();
    trackEvent("testimonial_prev_click", { page: bodyPage || "unknown" });
  });
  testNext.addEventListener("click", () => {
    nextTestimonial();
    trackEvent("testimonial_next_click", { page: bodyPage || "unknown" });
  });
  setInterval(nextTestimonial, 6000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9+\-\s()]{8,20}$/.test(phone);
}

async function postLead(payload) {
  const response = await fetch(contactApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Lead submission failed.");
  }
  return response.json();
}

const staticForms = document.querySelectorAll("form[data-static-form]");
staticForms.forEach((form) => {
  const statusEl = form.querySelector(".form-note");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const date = String(data.get("date") || "").trim();
    const eventType = String(data.get("event_type") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !phone || !email) {
      if (statusEl) {
        statusEl.textContent = "Please enter your name, phone, and email.";
      }
      trackEvent("lead_validation_failed", { reason: "required_fields" });
      return;
    }

    if (!isValidPhone(phone)) {
      if (statusEl) statusEl.textContent = "Please enter a valid phone number.";
      trackEvent("lead_validation_failed", { reason: "phone_invalid" });
      return;
    }

    if (!isValidEmail(email)) {
      if (statusEl) statusEl.textContent = "Please enter a valid email address.";
      trackEvent("lead_validation_failed", { reason: "email_invalid" });
      return;
    }

    const payload = {
      name,
      phone,
      email,
      eventDate: date || null,
      eventType: eventType || null,
      message,
      sourcePage: bodyPage || "contact",
      createdAt: new Date().toISOString(),
    };

    try {
      await postLead(payload);
      trackEvent("lead_submitted", { channel: "website_form", page: bodyPage });

      const whatsappMessage =
        `Hi EverVow Events, I just submitted an enquiry.\n` +
        `Name: ${name}\n` +
        `Phone: ${phone}\n` +
        `Email: ${email}\n` +
        `Event Date: ${date || "Not shared"}\n` +
        `Event Type: ${eventType || "Not shared"}\n` +
        `Message: ${message || "Not shared"}`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, "_blank");

      if (statusEl) {
        statusEl.textContent =
          "Thanks. Your enquiry has been saved. WhatsApp opened for quick chat.";
      }
      form.reset();
    } catch (error) {
      trackEvent("lead_submit_failed", {
        channel: "website_form",
        page: bodyPage || "contact",
      });
      if (statusEl) {
        statusEl.textContent =
          "We could not save the form right now. WhatsApp is opening instead.";
      }

      const fallbackMessage =
        `Hi EverVow Events, I want to plan an event.\n` +
        `Name: ${name}\n` +
        `Phone: ${phone}\n` +
        `Email: ${email}\n` +
        `Event Date: ${date || "Not shared"}\n` +
        `Event Type: ${eventType || "Not shared"}\n` +
        `Message: ${message || "Not shared"}`;
      const fallbackUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fallbackMessage)}`;
      window.open(fallbackUrl, "_blank");
    }
  });
});
