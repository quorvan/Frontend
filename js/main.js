const header = document.querySelector(".header");
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("lock", open);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("lock");
  });
});

const onScroll = () => {
  header?.classList.toggle("scrolled", window.scrollY > 6);
};

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const sectionLinks = [...document.querySelectorAll(".nav a[data-section]")];
const spySections = sectionLinks
  .map((link) => ({ link, section: document.getElementById(link.dataset.section) }))
  .filter((item) => item.section)
  .sort((a, b) => a.section.offsetTop - b.section.offsetTop);

if (spySections.length > 1) {
  const setActiveSection = (id) => {
    sectionLinks.forEach((link) => {
      const active = link.dataset.section === id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  const updateActiveSection = () => {
    const line = (header?.getBoundingClientRect().bottom || 0) + 16;
    let current = spySections[0].section.id;
    spySections.forEach(({ section }) => {
      if (section.getBoundingClientRect().top <= line) current = section.id;
    });
    setActiveSection(current);
  };

  updateActiveSection();
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
}

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-item").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

document.querySelectorAll(".quote-form").forEach((form) => {
  const success = form.querySelector(".form-success");
  const error = form.querySelector(".form-error");
  const button = form.querySelector("[type=submit]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const captcha = form.querySelector(".g-recaptcha");
    if (captcha && !window.grecaptcha?.getResponse()) {
      if (error) {
        error.textContent = "Please confirm you are not a robot.";
        error.hidden = false;
      }
      return;
    }

    const endpoint = form.getAttribute("action") || "";
    if (!endpoint.includes("formspree.io")) {
      form.reset();
      success?.classList.add("show");
      success?.focus();
      return;
    }

    error.hidden = true;
    if (error) error.textContent = "";
    success?.classList.remove("show");
    if (button) button.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        form.reset();
        window.grecaptcha?.reset();
        success?.classList.add("show");
        success?.focus();
        return;
      }
      const data = await response.json().catch(() => null);
      const message = Array.isArray(data?.errors)
        ? data.errors.map((item) => item.message).filter(Boolean).join(" ")
        : "";
      if (error) {
        error.textContent = message || "The inquiry could not be sent. Please try again.";
        error.hidden = false;
      }
      window.grecaptcha?.reset();
    } catch {
      window.grecaptcha?.reset();
      if (error) {
        error.textContent = "The inquiry could not be sent. Please try again.";
        error.hidden = false;
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
});

const usecaseDialog = document.querySelector("#usecase-dialog");

if (usecaseDialog) {
  const photo = usecaseDialog.querySelector(".usecase-photo");
  const tag = usecaseDialog.querySelector(".usecase-tag");
  const title = usecaseDialog.querySelector("#usecase-title");
  const summary = usecaseDialog.querySelector(".usecase-summary");
  const copy = usecaseDialog.querySelector(".usecase-copy");

  document.querySelectorAll(".folio-go, .capability-open").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.dataset.panel || "");
      usecaseDialog.classList.toggle("is-photo", button.classList.contains("capability-open"));
      photo.src = button.dataset.image;
      photo.alt = button.dataset.imageAlt || "";
      tag.textContent = button.dataset.tag || "";
      title.textContent = button.dataset.title || "";
      summary.textContent = button.dataset.summary || "";
      copy.replaceChildren(panel?.content ? panel.content.cloneNode(true) : "");
      usecaseDialog.showModal();
    });
  });

  usecaseDialog.querySelector("[data-close-usecase]")?.addEventListener("click", () => {
    usecaseDialog.close();
  });

  usecaseDialog.addEventListener("click", (event) => {
    if (event.target === usecaseDialog) usecaseDialog.close();
  });
}

const COOKIE_CHOICE = "quorvan-cookie-choice";
const COOKIE_DISMISS = "quorvan-cookie-dismissed";

const readStore = (store, key) => {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
};

const writeStore = (store, key, value) => {
  try {
    store.setItem(key, value);
  } catch {
    /* private browsing can block storage */
  }
};

if (!readStore(localStorage, COOKIE_CHOICE) && !readStore(sessionStorage, COOKIE_DISMISS)) {
  const notice = document.createElement("aside");
  notice.className = "cookie";
  notice.setAttribute("role", "dialog");
  notice.setAttribute("aria-labelledby", "cookie-title");
  notice.innerHTML = `
    <button type="button" class="cookie-close" aria-label="Close cookie notice">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
    <h2 id="cookie-title">Cookie notice</h2>
    <p>Quorvan uses essential cookies to run this site and optional cookies to remember your choices. Read the <a href="privacy.html">Privacy Policy</a>.</p>
    <div class="cookie-actions">
      <button type="button" class="btn btn-ghost" data-cookie="declined">Decline</button>
      <button type="button" class="btn btn-green" data-cookie="accepted">Accept</button>
    </div>
  `;
  document.body.append(notice);
  requestAnimationFrame(() => notice.classList.add("show"));

  const hide = () => {
    notice.classList.remove("show");
    notice.addEventListener("transitionend", () => notice.remove(), { once: true });
  };

  notice.querySelector(".cookie-close").addEventListener("click", () => {
    writeStore(sessionStorage, COOKIE_DISMISS, "1");
    hide();
  });

  notice.querySelectorAll("[data-cookie]").forEach((button) => {
    button.addEventListener("click", () => {
      writeStore(localStorage, COOKIE_CHOICE, button.dataset.cookie);
      hide();
    });
  });
}

const hideTawkGreeting = () => {
  document.querySelectorAll('iframe[title="Chat widget"]').forEach((frame) => {
    if (frame.dataset.greetingHidden === "1") {
      frame.style.setProperty("display", "none", "important");
      return;
    }
    try {
      if (frame.contentDocument?.querySelector('img[src*="attention-grabbers"]')) {
        frame.dataset.greetingHidden = "1";
        frame.style.setProperty("display", "none", "important");
      }
    } catch {
      /* the chat window is a separate frame */
    }
  });
};

hideTawkGreeting();
const greetingWatcher = new MutationObserver(hideTawkGreeting);
greetingWatcher.observe(document.documentElement, { childList: true, subtree: true });
const greetingTimer = setInterval(hideTawkGreeting, 400);
setTimeout(() => clearInterval(greetingTimer), 15000);

const liveDemo = document.querySelector("[data-live-demo]");

if (liveDemo) {
  const pick = liveDemo.querySelector("[data-live-pick]");
  const updated = liveDemo.querySelector("[data-live-updated]");
  const dest = liveDemo.querySelector("[data-live-dest]");
  const healthyCount = liveDemo.querySelector("[data-live-healthy]");
  const fastest = liveDemo.querySelector("[data-live-fastest]");
  const dot = liveDemo.querySelector("[data-live-dot]");
  const refresh = liveDemo.querySelector("[data-live-refresh]");
  const rows = [...liveDemo.querySelectorAll("[data-live-url]")];
  let readAt = 0;
  let reading = false;

  const classify = (data) => {
    const indicator = data?.status?.indicator || "";
    const description = data?.status?.description || "Status unavailable";
    if (indicator === "none" || /operational/i.test(description)) {
      return { state: "healthy", label: description };
    }
    if (indicator === "major" || indicator === "critical") {
      return { state: "down", label: description };
    }
    return { state: "degraded", label: description };
  };

  const paintAge = () => {
    if (!readAt) return;
    const seconds = Math.max(0, Math.round((Date.now() - readAt) / 1000));
    updated.textContent = seconds < 5 ? "Updated just now" : `Updated ${seconds}s ago`;
  };

  const readRow = async (row) => {
    const state = row.querySelector("[data-live-state]");
    const latency = row.querySelector("[data-live-ms]");
    const started = performance.now();
    try {
      const response = await fetch(`${row.dataset.liveUrl}?t=${Date.now()}`);
      const elapsed = Math.round(performance.now() - started);
      if (!response.ok) throw new Error(String(response.status));
      const result = classify(await response.json());
      state.textContent = result.label;
      state.className = `live-state is-${result.state}`;
      latency.textContent = `${elapsed} ms`;
      return { row, name: row.querySelector("h3").textContent, state: result.state, elapsed };
    } catch {
      state.textContent = "Unreachable";
      state.className = "live-state is-down";
      latency.textContent = "-";
      return { row, name: row.querySelector("h3").textContent, state: "down", elapsed: null };
    }
  };

  const resetRow = (row) => {
    const state = row.querySelector("[data-live-state]");
    const bar = row.querySelector("[data-live-bar]");
    row.classList.remove("is-preferred");
    state.textContent = "Checking";
    state.className = "live-state";
    row.querySelector("[data-live-ms]").textContent = "—";
    if (bar) bar.style.width = "0%";
  };

  const readAll = async () => {
    if (reading) return;
    reading = true;
    refresh.disabled = true;
    dot.classList.add("is-busy");
    liveDemo.classList.add("is-reading");
    rows.forEach(resetRow);
    if (dest) {
      dest.textContent = "—";
      dest.closest(".live-node")?.classList.remove("is-set");
    }
    const results = await Promise.all(rows.map(readRow));
    const measured = results.filter((item) => item.elapsed != null);
    const peak = Math.max(...measured.map((item) => item.elapsed), 1);
    measured.forEach((item) => {
      const bar = item.row.querySelector("[data-live-bar]");
      if (bar) bar.style.width = `${Math.max(8, Math.round((item.elapsed / peak) * 100))}%`;
    });
    const healthy = measured.filter((item) => item.state === "healthy");
    const chosen = healthy.sort((a, b) => a.elapsed - b.elapsed)[0];
    if (healthyCount) healthyCount.textContent = String(healthy.length);
    if (fastest) fastest.textContent = chosen ? `${chosen.elapsed} ms` : "—";
    if (chosen) {
      chosen.row.classList.add("is-preferred");
      pick.textContent = `${chosen.name} · ${chosen.elapsed} ms`;
      if (dest) {
        dest.textContent = chosen.name;
        dest.closest(".live-node")?.classList.add("is-set");
      }
    } else {
      pick.textContent = "No operational target this reading";
    }
    readAt = Date.now();
    paintAge();
    dot.classList.remove("is-busy");
    liveDemo.classList.remove("is-reading");
    refresh.disabled = false;
    reading = false;
  };

  refresh.addEventListener("click", readAll);
  readAll();
  setInterval(paintAge, 1000);
  setInterval(() => {
    if (document.visibilityState === "visible") readAll();
  }, 20000);
}
