const ArtSite = (function () {
    const DATA_URL = "data/artworks.json";
    const SITE_URL = "data/site.json";
    const FEATURED_LIMIT = 6;
    const LENS_MIN = 120;
    const LENS_MAX = 280;

    const categoryLabels = {
        olej: "Olej",
        akryl: "Akryl",
        akwarela: "Akwarela",
        pastel: "Pastela",
        olowek: "Ołówek",
        mieszana: "Technika mieszana",
    };

    const statusLabels = {
        dostepny: "Dostępny",
        zarezerwowany: "Zarezerwowany",
        sprzedany: "Sprzedany",
        niedostepny: "Nie na sprzedaż",
    };

    let artworksPromise = null;
    let sitePromise = null;
    let artworksById = new Map();

    const lightboxState = {
        sequence: [],
        currentIndex: -1,
        lensSize: 180,
        returnFocus: null,
    };

    const canUseLens = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
    ).matches;

    /* ── DATA ── */

    function slugify(text) {
        return String(text || "")
            .toLowerCase()
            .replace(/ł/g, "l")
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function normalizeArtworks(data) {
        const list = Array.isArray(data) ? data : [];
        const usedIds = new Set();

        return list
            .filter((item) => item && item.image && item.published !== false)
            .map(function (item) {
                const baseId = slugify(item.title) || "praca";
                let id = baseId;
                let counter = 2;
                while (usedIds.has(id)) {
                    id = baseId + "-" + counter++;
                }
                usedIds.add(id);

                return Object.assign({}, item, {
                    id: id,
                    image: String(item.image).replace(/^\/+/, ""),
                    status: item.status || "dostepny",
                });
            });
    }

    function getArtworks() {
        if (!artworksPromise) {
            artworksPromise = fetch(DATA_URL, { cache: "no-cache" })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Nie udało się wczytać danych galerii.");
                    }
                    return response.json();
                })
                .then(function (data) {
                    const artworks = normalizeArtworks(data);
                    artworksById = new Map(
                        artworks.map((artwork) => [artwork.id, artwork]),
                    );
                    return artworks;
                })
                .catch(function (error) {
                    artworksPromise = null;
                    throw error;
                });
        }
        return artworksPromise;
    }

    function getSiteSettings() {
        if (!sitePromise) {
            sitePromise = fetch(SITE_URL, { cache: "no-cache" })
                .then((response) => (response.ok ? response.json() : {}))
                .catch(() => ({}));
        }
        return sitePromise;
    }

    function getArtworkById(id) {
        return artworksById.get(id) || null;
    }

    function getCategoryLabel(category) {
        return categoryLabels[category] || category;
    }

    function getArtworkMeta(artwork) {
        return [
            artwork.technique || getCategoryLabel(artwork.category),
            artwork.dimensions,
            artwork.year,
        ]
            .filter(Boolean)
            .join(" · ");
    }

    function getInquiryUrl(artwork) {
        return "index.html?art=" + encodeURIComponent(artwork.id) + "#kontakt";
    }

    /* ── CARDS ── */

    function createStatusBadge(status) {
        if (status !== "sprzedany" && status !== "zarezerwowany") {
            return null;
        }
        const badge = document.createElement("span");
        badge.className = "status-badge status-" + status;
        badge.textContent = statusLabels[status];
        return badge;
    }

    function createArtworkCard(artwork, mode) {
        const isGalleryMode = mode === "gallery";
        const article = document.createElement("article");
        article.className = isGalleryMode ? "fg-item" : "painting";
        article.dataset.category = artwork.category;
        article.dataset.artId = artwork.id;

        const frame = document.createElement("button");
        frame.type = "button";
        frame.className =
            (isGalleryMode ? "fg-frame" : "painting-frame") +
            " artwork-open-trigger js-open-lightbox";
        frame.setAttribute("aria-label", "Powiększ obraz: " + artwork.title);

        const image = document.createElement("img");
        image.src = artwork.image;
        image.alt = artwork.title;
        image.loading = "lazy";
        image.decoding = "async";
        frame.appendChild(image);

        const badge = createStatusBadge(artwork.status);
        if (badge) {
            frame.appendChild(badge);
        }

        const caption = document.createElement("div");
        caption.className = isGalleryMode ? "fg-caption" : "painting-caption";

        const textWrap = document.createElement("div");
        textWrap.className = isGalleryMode ? "fg-text" : "painting-text";

        const name = document.createElement("h3");
        name.className = isGalleryMode ? "fg-name" : "painting-name";
        name.textContent = artwork.title;

        const meta = document.createElement("span");
        meta.className = isGalleryMode ? "fg-meta" : "painting-meta";
        meta.textContent = getArtworkMeta(artwork);

        textWrap.appendChild(name);
        textWrap.appendChild(meta);
        caption.appendChild(textWrap);

        article.appendChild(frame);
        article.appendChild(caption);

        return article;
    }

    /* ── LIGHTBOX ── */

    function buildLightbox() {
        let lightbox = document.getElementById("lightbox");
        if (lightbox) {
            return lightbox;
        }

        lightbox = document.createElement("div");
        lightbox.className = "lightbox";
        lightbox.id = "lightbox";
        lightbox.hidden = true;
        lightbox.setAttribute("role", "dialog");
        lightbox.setAttribute("aria-modal", "true");
        lightbox.setAttribute("aria-labelledby", "lightbox-name");
        lightbox.innerHTML =
            '<div class="lightbox-toolbar">' +
            '<div class="lightbox-lens-controls" role="group" aria-label="Rozmiar lupy">' +
            '<button class="lightbox-lens-btn" data-lightbox-lens-smaller type="button" aria-label="Zmniejsz lupę">Lupa −</button>' +
            '<button class="lightbox-lens-btn" data-lightbox-lens-larger type="button" aria-label="Powiększ lupę">Lupa +</button>' +
            "</div>" +
            '<span class="lightbox-counter" id="lightbox-counter" aria-live="polite"></span>' +
            '<button class="lightbox-close" data-lightbox-close type="button">Zamknij ×</button>' +
            "</div>" +
            '<button class="lightbox-nav lightbox-prev" data-lightbox-prev type="button" aria-label="Poprzedni obraz">←</button>' +
            '<button class="lightbox-nav lightbox-next" data-lightbox-next type="button" aria-label="Następny obraz">→</button>' +
            '<figure class="lightbox-figure">' +
            '<div class="lightbox-stage"><img class="lightbox-img" id="lightbox-img" alt="" /></div>' +
            '<figcaption class="lightbox-caption">' +
            '<p class="lc-name" id="lightbox-name"></p>' +
            '<p class="lc-meta" id="lightbox-meta"></p>' +
            '<p class="lc-status" id="lightbox-status"></p>' +
            '<p class="lc-desc" id="lightbox-desc"></p>' +
            '<a class="lightbox-cta" id="lightbox-cta" data-lightbox-inquiry href="#kontakt">Zapytaj o ten obraz</a>' +
            "</figcaption>" +
            "</figure>" +
            '<div class="lightbox-lens" id="lightbox-lens" aria-hidden="true"></div>';

        document.body.appendChild(lightbox);
        return lightbox;
    }

    function isLightboxOpen() {
        const lightbox = document.getElementById("lightbox");
        return Boolean(lightbox && !lightbox.hidden);
    }

    function renderLightboxArtwork(artwork) {
        const img = document.getElementById("lightbox-img");
        const statusEl = document.getElementById("lightbox-status");
        const descEl = document.getElementById("lightbox-desc");
        const cta = document.getElementById("lightbox-cta");
        const counter = document.getElementById("lightbox-counter");
        const lens = document.getElementById("lightbox-lens");

        document.getElementById("lightbox-name").textContent = artwork.title;
        document.getElementById("lightbox-meta").textContent =
            getArtworkMeta(artwork);

        hideLightboxLens();
        img.src = artwork.image;
        img.alt = artwork.title;
        lens.style.backgroundImage = 'url("' + artwork.image + '")';

        let statusText = statusLabels[artwork.status] || "";
        if (artwork.status === "dostepny") {
            statusText += " · " + (artwork.price || "cena na zapytanie");
        }
        statusEl.textContent = statusText;
        statusEl.dataset.status = artwork.status;

        descEl.textContent = artwork.description || "";
        descEl.hidden = !artwork.description;

        cta.href = getInquiryUrl(artwork);
        cta.dataset.artId = artwork.id;
        cta.hidden = artwork.status === "sprzedany";

        const total = lightboxState.sequence.length;
        counter.textContent =
            total > 1 ? lightboxState.currentIndex + 1 + " / " + total : "";

        document
            .querySelectorAll("[data-lightbox-prev], [data-lightbox-next]")
            .forEach(function (button) {
                button.hidden = total < 2;
            });
    }

    function openLightbox(sequence, artId) {
        const lightbox = buildLightbox();

        lightboxState.sequence = sequence;
        if (!isLightboxOpen()) {
            lightboxState.returnFocus = document.activeElement;
        }

        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
        setLightboxLensSize(lightboxState.lensSize);
        showLightboxByIndex(Math.max(0, sequence.indexOf(artId)));
        lightbox.querySelector("[data-lightbox-close]").focus();
    }

    function closeLightbox() {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox || lightbox.hidden) {
            return;
        }

        lightbox.hidden = true;
        document.body.style.overflow = "";
        hideLightboxLens();
        lightboxState.sequence = [];
        lightboxState.currentIndex = -1;

        if (lightboxState.returnFocus && lightboxState.returnFocus.focus) {
            lightboxState.returnFocus.focus();
        }
    }

    function showLightboxByIndex(index) {
        const total = lightboxState.sequence.length;
        if (!total) {
            return;
        }

        const normalizedIndex = (index + total) % total;
        const artwork = getArtworkById(lightboxState.sequence[normalizedIndex]);
        if (!artwork) {
            return;
        }

        lightboxState.currentIndex = normalizedIndex;
        renderLightboxArtwork(artwork);
    }

    function setLightboxLensSize(size) {
        const lens = document.getElementById("lightbox-lens");
        const smaller = document.querySelector("[data-lightbox-lens-smaller]");
        const larger = document.querySelector("[data-lightbox-lens-larger]");
        if (!lens) {
            return;
        }

        lightboxState.lensSize = Math.min(LENS_MAX, Math.max(LENS_MIN, size));
        lens.style.width = lightboxState.lensSize + "px";
        lens.style.height = lightboxState.lensSize + "px";

        if (smaller && larger) {
            smaller.disabled = lightboxState.lensSize <= LENS_MIN;
            larger.disabled = lightboxState.lensSize >= LENS_MAX;
        }
    }

    function hideLightboxLens() {
        const lens = document.getElementById("lightbox-lens");
        if (lens) {
            lens.classList.remove("visible");
        }
    }

    function updateLightboxLensPosition(event) {
        const img = document.getElementById("lightbox-img");
        const lens = document.getElementById("lightbox-lens");
        if (!canUseLens || !img || !lens || !img.complete) {
            return;
        }

        const rect = img.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            hideLightboxLens();
            return;
        }

        // Powiększenie względem oryginalnej rozdzielczości zdjęcia (min. 2×)
        const zoom = Math.max(2, img.naturalWidth / rect.width);
        const half = lightboxState.lensSize / 2;

        lens.style.left = event.clientX - half + "px";
        lens.style.top = event.clientY - half + "px";
        lens.style.backgroundSize =
            rect.width * zoom + "px " + rect.height * zoom + "px";
        lens.style.backgroundPosition =
            -(x * zoom - half) + "px " + -(y * zoom - half) + "px";
        lens.classList.add("visible");
    }

    function trapFocus(event, lightbox) {
        const focusable = Array.from(
            lightbox.querySelectorAll("button, a[href]"),
        ).filter((el) => !el.disabled && !el.hidden && el.offsetParent);

        if (!focusable.length) {
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function initLightboxEvents() {
        const lightbox = buildLightbox();
        let touchStartX = null;

        document.addEventListener("click", function (event) {
            const trigger = event.target.closest(".js-open-lightbox");
            const card = trigger && trigger.closest("[data-art-id]");
            if (!card) {
                return;
            }

            const sequence = Array.from(
                document.querySelectorAll("[data-art-id]"),
            ).map((item) => item.dataset.artId);

            openLightbox(sequence, card.dataset.artId);
        });

        lightbox.addEventListener("click", function (event) {
            if (
                event.target === lightbox ||
                event.target.classList.contains("lightbox-stage") ||
                event.target.closest("[data-lightbox-close]")
            ) {
                closeLightbox();
            } else if (event.target.closest("[data-lightbox-prev]")) {
                showLightboxByIndex(lightboxState.currentIndex - 1);
            } else if (event.target.closest("[data-lightbox-next]")) {
                showLightboxByIndex(lightboxState.currentIndex + 1);
            } else if (event.target.closest("[data-lightbox-lens-smaller]")) {
                setLightboxLensSize(lightboxState.lensSize - 20);
            } else if (event.target.closest("[data-lightbox-lens-larger]")) {
                setLightboxLensSize(lightboxState.lensSize + 20);
            } else if (event.target.closest("[data-lightbox-inquiry]")) {
                const artwork = getArtworkById(
                    event.target.closest("[data-lightbox-inquiry]").dataset
                        .artId,
                );
                // Na stronie głównej formularz jest pod ręką — bez przeładowania
                if (artwork && document.getElementById("contact-form")) {
                    event.preventDefault();
                    closeLightbox();
                    prefillInquiry(artwork);
                    document
                        .getElementById("kontakt")
                        .scrollIntoView({ behavior: "smooth" });
                    // Na telefonie fokus otworzyłby klawiaturę w trakcie przewijania
                    if (canUseLens) {
                        document.getElementById("name").focus({
                            preventScroll: true,
                        });
                    }
                }
            }
        });

        lightbox.addEventListener("mousemove", updateLightboxLensPosition);
        lightbox.addEventListener("mouseleave", hideLightboxLens);
        window.addEventListener("resize", hideLightboxLens);

        lightbox.addEventListener(
            "touchstart",
            function (event) {
                // Pomijamy gest dwoma palcami i przesuwanie powiększonego obrazu
                const isZoomed =
                    window.visualViewport && window.visualViewport.scale > 1;
                touchStartX =
                    event.touches.length === 1 && !isZoomed
                        ? event.touches[0].clientX
                        : null;
            },
            { passive: true },
        );

        lightbox.addEventListener("touchend", function (event) {
            if (touchStartX === null) {
                return;
            }
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            touchStartX = null;
            if (Math.abs(deltaX) > 50) {
                showLightboxByIndex(
                    lightboxState.currentIndex + (deltaX < 0 ? 1 : -1),
                );
            }
        });

        document.addEventListener("keydown", function (event) {
            if (!isLightboxOpen()) {
                return;
            }

            if (event.key === "Escape") {
                closeLightbox();
            } else if (event.key === "ArrowLeft") {
                showLightboxByIndex(lightboxState.currentIndex - 1);
            } else if (event.key === "ArrowRight") {
                showLightboxByIndex(lightboxState.currentIndex + 1);
            } else if (event.key === "Tab") {
                trapFocus(event, lightbox);
            }
        });
    }

    /* ── LAYOUT ── */

    function updateFooterYear() {
        const yearElement = document.getElementById("footer-year");
        if (yearElement) {
            yearElement.textContent = String(new Date().getFullYear());
        }
    }

    function initMobileNav() {
        const nav = document.querySelector("nav");
        const toggle = document.querySelector(".nav-toggle");
        const links = document.querySelectorAll(".nav-links a");

        if (!nav || !toggle) return;

        function setNavOpen(isOpen) {
            nav.classList.toggle("nav-open", isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.setAttribute(
                "aria-label",
                isOpen ? "Zamknij menu" : "Otwórz menu",
            );
        }

        toggle.addEventListener("click", function () {
            setNavOpen(!nav.classList.contains("nav-open"));
        });

        links.forEach(function (link) {
            link.addEventListener("click", () => setNavOpen(false));
        });

        document.addEventListener("click", function (event) {
            if (!nav.contains(event.target)) {
                setNavOpen(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                setNavOpen(false);
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 600) {
                setNavOpen(false);
            }
        });
    }

    function initActiveSectionState() {
        const links = Array.from(
            document.querySelectorAll("[data-track-section]"),
        );
        const sections = links
            .map((link) => document.querySelector(link.getAttribute("href")))
            .filter(Boolean);

        if (!sections.length) {
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    links.forEach(function (link) {
                        if (link.getAttribute("href") === "#" + entry.target.id) {
                            link.setAttribute("aria-current", "location");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            {
                rootMargin: "-35% 0px -50% 0px",
                threshold: 0.01,
            },
        );

        sections.forEach((section) => observer.observe(section));
    }

    /* ── HOME PAGE ── */

    async function renderFeaturedGallery() {
        const container = document.getElementById("featured-gallery");
        if (!container) {
            return;
        }

        const artworks = await getArtworks();
        let featured = artworks.filter((item) => item.featured);
        // Brak wyróżnionych → pokaż najnowsze
        if (!featured.length) {
            featured = artworks
                .slice()
                .sort((a, b) => (b.year || 0) - (a.year || 0));
        }

        container.innerHTML = "";
        featured.slice(0, FEATURED_LIMIT).forEach(function (artwork) {
            container.appendChild(createArtworkCard(artwork, "index"));
        });

        if (!container.children.length) {
            container.innerHTML =
                '<p class="gallery-empty">Nowe prace pojawią się wkrótce.</p>';
        }
    }

    async function renderAboutTags() {
        const container = document.getElementById("about-tags");
        if (!container) {
            return;
        }

        const artworks = await getArtworks();
        const categories = Array.from(
            new Set(artworks.map((item) => item.category).filter(Boolean)),
        );

        container.innerHTML = "";
        categories.forEach(function (category) {
            const tag = document.createElement("a");
            tag.className = "tag";
            tag.href = "galeria.html?kategoria=" + encodeURIComponent(category);
            tag.textContent = getCategoryLabel(category);
            container.appendChild(tag);
        });
    }

    /* ── CONTACT ── */

    function fillContactItem(id, text, href) {
        const item = document.getElementById(id);
        if (!item || !text) {
            return;
        }
        const link = item.querySelector("a");
        link.textContent = text;
        link.href = href;
        item.hidden = false;
    }

    async function initContactDetails() {
        const form = document.getElementById("contact-form");
        if (!form) {
            return;
        }

        const site = await getSiteSettings();
        const email = (site.email || "").trim();
        const phone = (site.phone || "").trim();
        const instagram = (site.instagram || "").trim().replace(/^@/, "");
        const formTarget = (site.formId || "").trim() || email;

        fillContactItem("contact-email", email, "mailto:" + email);
        fillContactItem(
            "contact-phone",
            phone,
            "tel:" + phone.replace(/[^\d+]/g, ""),
        );
        fillContactItem(
            "contact-instagram",
            instagram && "@" + instagram,
            "https://instagram.com/" + encodeURIComponent(instagram),
        );

        if (formTarget) {
            form.action =
                "https://formsubmit.co/" +
                encodeURIComponent(formTarget).replace("%40", "@");
            document.getElementById("form-next").value =
                window.location.origin +
                window.location.pathname +
                "?wyslano=1#kontakt";
        } else {
            document.getElementById("form-fields").disabled = true;
            document.getElementById("form-disabled").hidden = false;
        }
    }

    function prefillInquiry(artwork) {
        const hiddenArtwork = document.getElementById("artwork-hidden");
        const messageField = document.getElementById("message");

        if (hiddenArtwork) {
            hiddenArtwork.value = artwork.title + " (" + getArtworkMeta(artwork) + ")";
        }

        if (messageField && !messageField.value.trim()) {
            messageField.value =
                "Dzień dobry, interesuje mnie obraz „" +
                artwork.title +
                "”. Proszę o informację o dostępności i cenie.";
        }
    }

    async function initContactEnhancements() {
        const params = new URLSearchParams(window.location.search);
        const successMessage = document.getElementById("form-success");

        if (params.get("wyslano") === "1" && successMessage) {
            successMessage.hidden = false;
        }

        if (params.has("art")) {
            await getArtworks();
            const artwork = getArtworkById(params.get("art"));
            if (artwork) {
                prefillInquiry(artwork);
            }
        }

        if (params.has("wyslano") || params.has("art")) {
            history.replaceState(
                null,
                "",
                window.location.pathname + window.location.hash,
            );
        }
    }

    return {
        createArtworkCard,
        getArtworks,
        getCategoryLabel,
        initActiveSectionState,
        initContactDetails,
        initContactEnhancements,
        initLightboxEvents,
        initMobileNav,
        renderAboutTags,
        renderFeaturedGallery,
        updateFooterYear,
    };
})();

window.ArtSite = ArtSite;

document.addEventListener("DOMContentLoaded", async function () {
    ArtSite.updateFooterYear();
    ArtSite.initMobileNav();
    ArtSite.initLightboxEvents();
    ArtSite.initActiveSectionState();
    ArtSite.initContactDetails();

    try {
        await Promise.all([
            ArtSite.renderFeaturedGallery(),
            ArtSite.renderAboutTags(),
            ArtSite.initContactEnhancements(),
        ]);

        // Galeria doładowuje się asynchronicznie i przesuwa sekcje niżej
        const target = window.location.hash
            ? document.getElementById(window.location.hash.slice(1))
            : null;
        if (target && target.id !== "home") {
            target.scrollIntoView();
        }
    } catch (error) {
        const gallery = document.getElementById("featured-gallery");
        if (gallery) {
            gallery.innerHTML =
                '<p class="gallery-empty">Nie można teraz wczytać galerii.</p>';
        }
        console.error(error);
    }
});
