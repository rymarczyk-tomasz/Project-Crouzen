(() => {
  const $ = (s) => document.querySelector(s);
  const CATS = { olej: "Olej", akryl: "Akryl", akwarela: "Akwarela", pastel: "Pastela", olowek: "Ołówek", mieszana: "Technika mieszana" };
  const STATUS = {
    dostepny: ["Dostępny", "var(--ok)"],
    zarezerwowany: ["Zarezerwowany", "var(--res)"],
    sprzedany: ["Sprzedany", "var(--sold)"],
    niedostepny: ["Nie na sprzedaż", "#a8927a"]
  };
  // CMS zapisuje ścieżki od "/" — usuwamy, żeby działało pod podkatalogiem (GitHub Pages)
  const src = (p) => (p || "").replace(/^\/+/, "");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  let all = [], list = [], filter = "all", current = -1, ask = null;

  const meta = (a) => [a.technique || CATS[a.category], a.dimensions, a.year].filter(Boolean).join(" · ");
  const priceOf = (a) => a.status === "dostepny" ? (a.price || "Cena na zapytanie") : "";

  function renderFilters() {
    const used = Object.keys(CATS).filter((k) => all.some((a) => a.category === k));
    const items = [["all", "Wszystkie", all.length], ...used.map((k) => [k, CATS[k], all.filter((a) => a.category === k).length])];
    $("#filters").innerHTML = used.length > 1
      ? items.map(([k, l, n]) => `<button type="button" data-f="${k}" aria-pressed="${k === filter}">${l} <span>${n}</span></button>`).join("")
      : "";
    $("#facts-tech").textContent = used.map((k) => CATS[k]).join(", ") || $("#facts-tech").textContent;
  }

  function renderWorks() {
    list = all.filter((a) => filter === "all" || a.category === filter);
    $("#works").innerHTML = list.length ? list.map((a, i) => {
      const [label, dot] = STATUS[a.status] || STATUS.dostepny;
      return `<article class="work">
        <button class="frame" type="button" data-i="${i}" aria-label="Powiększ: ${esc(a.title)}">
          <img src="${esc(src(a.image))}" alt="${esc(a.title)}" loading="lazy">
        </button>
        <div class="work-info">
          <div><h3>${esc(a.title)}</h3><p>${esc(meta(a))}</p></div>
          <span class="status" style="--dot:${dot}">${label}</span>
        </div>
      </article>`;
    }).join("") : `<p class="empty">Nowe prace pojawią się wkrótce.</p>`;
  }

  function openLb(i) {
    current = (i + list.length) % list.length;
    const a = list[current];
    $("#lb-img").src = src(a.image);
    $("#lb-img").alt = a.title;
    $("#lb-title").textContent = a.title;
    $("#lb-count").textContent = `${current + 1} / ${list.length}`;
    const rows = [["Technika", a.technique || CATS[a.category]], ["Wymiary", a.dimensions], ["Rok", a.year],
      ["Status", (STATUS[a.status] || STATUS.dostepny)[0]], ["Cena", priceOf(a)]].filter(([, v]) => v);
    $("#lb-meta").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("");
    $("#lb-desc").hidden = !a.description;
    $("#lb-desc").textContent = a.description || "";
    $("#lb-ask").hidden = a.status === "niedostepny";
    const lb = $("#lightbox");
    if (!lb.open) { lb.showModal(); document.body.style.overflow = "hidden"; }
  }
  function closeLb() { $("#lightbox").close(); }

  function setAsk(a) {
    ask = a;
    $("#ask").hidden = !a;
    $("#artwork-hidden").value = a ? `${a.title} (${meta(a)})` : "";
    if (a) {
      $("#ask-img").src = src(a.image);
      $("#ask-title").textContent = a.title;
      const m = $("#message");
      if (!m.value) m.value = `Dzień dobry, interesuje mnie praca „${a.title}”. `;
    }
  }

  function setupContact(site) {
    const items = [];
    if (site.email) items.push(["E-mail", `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`]);
    if (site.phone) items.push(["Telefon", `<a href="tel:${esc(site.phone.replace(/\s/g, ""))}">${esc(site.phone)}</a>`]);
    if (site.instagram) items.push(["Instagram", `<a href="https://instagram.com/${esc(site.instagram)}" target="_blank" rel="noopener">@${esc(site.instagram)}</a>`]);
    $("#contact-list").innerHTML = items.map(([l, v]) => `<div><span class="label">${l}</span>${v}</div>`).join("");

    const form = $("#contact-form");
    const target = site.formId || site.email;
    if (!target) {
      $("#form-fields").disabled = true;
      $("#form-disabled").hidden = false;
      return;
    }
    form.action = `https://formsubmit.co/${encodeURIComponent(target)}`;
    $("#form-next").value = location.href.split("#")[0] + "?wyslano=1#kontakt";
    if (new URLSearchParams(location.search).has("wyslano")) $("#form-success").hidden = false;
  }

  async function load(path, fallback) {
    try { const r = await fetch(path, { cache: "no-cache" }); return r.ok ? await r.json() : fallback; }
    catch { return fallback; }
  }

  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-f]");
    if (f) { filter = f.dataset.f; renderFilters(); renderWorks(); return; }
    const w = e.target.closest(".work .frame");
    if (w) { openLb(+w.dataset.i); return; }
    if (e.target.closest("#hero-art .frame")) {
      const i = all.findIndex((a) => src(a.image) === "img/prace/pejzaz-jesienny.jpg");
      filter = "all"; renderFilters(); renderWorks(); if (list.length) openLb(Math.max(0, i));
    }
  });
  $("#lb-prev").onclick = () => openLb(current - 1);
  $("#lb-next").onclick = () => openLb(current + 1);
  $("#lb-close").onclick = closeLb;
  $("#lightbox").addEventListener("close", () => { document.body.style.overflow = ""; });
  $("#lightbox").addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") openLb(current + 1);
    if (e.key === "ArrowLeft") openLb(current - 1);
  });
  $("#lb-ask").onclick = () => {
    setAsk(list[current]); closeLb();
    window.scrollTo({ top: $("#kontakt").offsetTop - 60, behavior: "smooth" });
  };
  $("#ask-clear").onclick = () => setAsk(null);
  $("#year").textContent = new Date().getFullYear();

  Promise.all([load("data/artworks.json", []), load("data/site.json", {})]).then(([arts, site]) => {
    all = (Array.isArray(arts) ? arts : []).filter((a) => a.published !== false && a.image);
    renderFilters(); renderWorks(); setupContact(site || {});
  });
})();
