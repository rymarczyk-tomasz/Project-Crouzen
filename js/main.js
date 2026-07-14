const ArtSite = (function () {
    const DATA_URL = "data/artworks.json";
    const categoryLabels = {
        olej: "Olej",
        akryl: "Akryl",
        akwarela: "Akwarela",
        pastel: "Pastela",
        olowek: "Ołówek",
        mieszana: "Mieszana",
    };

    let artworksCache = null;
    let artworksById = new Map();
    const lightboxState = {
        sequence: [],
        currentIndex: -1,
        zoom: 1,
        lensSize: 180,
    };

    function getLightboxLens() {
        let lens = document.getElementById("lightbox-lens");
        if (lens) {
            return lens;
        }

        const lightbox = document.getElementById("lightbox");
        if (!lightbox) {
            return null;
        }

        lens = document.createElement("div");
        lens.id = "lightbox-lens";
        lens.className = "lightbox-lens";
        lens.setAttribute("aria-hidden", "true");
        lightbox.appendChild(lens);
        return lens;
    }

    async function getArtworks() {
        if (artworksCache) {
            return artworksCache;
        }

        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error("Nie udalo sie wczytac danych galerii.");
        }

        const data = await response.json();
        artworksCache = Array.isArray(data) ? data : [];
        artworksById = new Map(
            artworksCache.map((artwork) => [artwork.id, artwork]),
        );
        return artworksCache;
    }

    function getArtworkById(id) {
        return artworksById.get(id) || null;
    }

    function getCategoryLabel(category) {
        return categoryLabels[category] || category;
    }

    function createPlaceholder() {
        const placeholder = document.createElement("div");
        placeholder.className = "painting-placeholder";
        placeholder.innerHTML =
            '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"></rect><path d="M3 9l4-4 4 4 4-6 4 6"></path><circle cx="8.5" cy="13.5" r="1.5"></circle></svg><span>Brak zdjecia</span>';
        return placeholder;
    }

    function createArtworkCard(artwork, mode) {
        const isGalleryMode = mode === "gallery";
        const article = document.createElement("article");
        article.className = isGalleryMode ? "fg-item" : "painting";
        article.dataset.category = artwork.category;
        article.dataset.artId = artwork.id;

        const frame = document.createElement("button");
        frame.type = "button";
        frame.className = isGalleryMode
            ? "fg-frame artwork-open-trigger js-open-lightbox"
            : "painting-frame artwork-open-trigger js-open-lightbox";
        frame.setAttribute("aria-label", "Podglad obrazu: " + artwork.title);

        if (artwork.image) {
            const image = document.createElement("img");
            image.src = artwork.image;
            image.alt = artwork.title;
            image.loading = "lazy";
            frame.appendChild(image);
        } else {
            frame.classList.add(
                isGalleryMode ? "fg-placeholder" : "painting-placeholder-frame",
            );
            frame.style.background = artwork.placeholderColor || "#bfa070";
            frame.appendChild(createPlaceholder());
        }

        const caption = document.createElement("div");
        caption.className = isGalleryMode ? "fg-caption" : "painting-caption";

        const textWrap = document.createElement("div");
        textWrap.className = isGalleryMode ? "fg-text" : "painting-text";

        const name = document.createElement("span");
        name.className = isGalleryMode ? "fg-name" : "painting-name";
        name.textContent = artwork.title;

        const meta = document.createElement("span");
        meta.className = isGalleryMode ? "fg-meta" : "painting-meta";
        meta.textContent =
            artwork.technique +
            " · " +
            artwork.dimensions +
            " · " +
            String(artwork.year);

        textWrap.appendChild(name);
        textWrap.appendChild(meta);

        caption.appendChild(textWrap);

        article.appendChild(frame);
        article.appendChild(caption);

        return article;
    }

    function openLightbox(name, meta, src) {
        const lb = document.getElementById("lightbox");
        const img = document.getElementById("lightbox-img");
        const ph = document.getElementById("lightbox-placeholder");
        const nameEl = document.getElementById("lightbox-name");
        const metaEl = document.getElementById("lightbox-meta");

        if (!lb || !img || !ph || !nameEl || !metaEl) {
            return;
        }

        nameEl.textContent = name;
        metaEl.textContent = meta;

        if (src) {
            img.src = src;
            img.alt = name;
            img.style.display = "block";
            ph.style.display = "none";
        } else {
            img.style.display = "none";
            ph.style.display = "flex";
        }

        lb.classList.add("open");
        document.body.style.overflow = "hidden";
        setLightboxLensSize(lightboxState.lensSize);
        setLightboxZoom(src ? 2 : 1);
        updateLensButtonsState(Boolean(src));
        updateLightboxNavButtons();
    }

    function closeLightbox() {
        const lb = document.getElementById("lightbox");
        if (!lb) {
            return;
        }

        lb.classList.remove("open");
        document.body.style.overflow = "";
        lightboxState.sequence = [];
        lightboxState.currentIndex = -1;
        setLightboxZoom(1);
        hideLightboxLens();
        updateLensButtonsState(false);
        updateLightboxNavButtons();
    }

    function updateLensButtonsState(isEnabled) {
        const smaller = document.querySelector("[data-lightbox-lens-smaller]");
        const larger = document.querySelector("[data-lightbox-lens-larger]");
        if (!smaller || !larger) {
            return;
        }

        const minSize = 120;
        const maxSize = 280;

        smaller.disabled = !isEnabled || lightboxState.lensSize <= minSize;
        larger.disabled = !isEnabled || lightboxState.lensSize >= maxSize;
    }

    function setLightboxLensSize(size) {
        const lens = getLightboxLens();
        if (!lens) {
            return;
        }

        const minSize = 120;
        const maxSize = 280;
        const nextSize = Math.min(maxSize, Math.max(minSize, size));
        lightboxState.lensSize = nextSize;

        lens.style.width = String(nextSize) + "px";
        lens.style.height = String(nextSize) + "px";

        const img = document.getElementById("lightbox-img");
        updateLensButtonsState(Boolean(img && img.style.display === "block"));
    }

    function setLightboxZoom(scale) {
        const img = document.getElementById("lightbox-img");
        const lens = getLightboxLens();
        if (!img) {
            return;
        }

        lightboxState.zoom = scale;

        const isActive = scale > 1 && img.style.display === "block";
        img.style.cursor = isActive ? "none" : "zoom-in";

        if (lens) {
            lens.classList.toggle("active", isActive);
        }

        if (!isActive) {
            hideLightboxLens();
        }

        updateLensButtonsState(img.style.display === "block");
    }

    function hideLightboxLens() {
        const lens = getLightboxLens();
        if (!lens) {
            return;
        }

        lens.classList.remove("visible");
    }

    function updateLightboxLensPosition(event) {
        const img = document.getElementById("lightbox-img");
        const lens = getLightboxLens();

        if (!img || !lens || lightboxState.zoom <= 1 || img.style.display !== "block") {
            hideLightboxLens();
            return;
        }

        const rect = img.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            hideLightboxLens();
            return;
        }

        const lensSize = lightboxState.lensSize;
        const half = lensSize / 2;

        lens.style.left = String(event.clientX - half) + "px";
        lens.style.top = String(event.clientY - half) + "px";
        lens.style.backgroundImage = 'url("' + img.src + '")';
        lens.style.backgroundSize =
            String(rect.width * lightboxState.zoom) +
            "px " +
            String(rect.height * lightboxState.zoom) +
            "px";
        lens.style.backgroundPosition =
            String(-(x * lightboxState.zoom - half)) +
            "px " +
            String(-(y * lightboxState.zoom - half)) +
            "px";

        lens.classList.add("visible");
    }

    function updateLightboxNavButtons() {
        const prevButton = document.querySelector("[data-lightbox-prev]");
        const nextButton = document.querySelector("[data-lightbox-next]");
        const hasItems = lightboxState.sequence.length > 0;

        if (prevButton) {
            prevButton.disabled = !hasItems;
        }

        if (nextButton) {
            nextButton.disabled = !hasItems;
        }
    }

    function showLightboxByIndex(index) {
        if (!lightboxState.sequence.length) {
            return;
        }

        const normalizedIndex =
            (index + lightboxState.sequence.length) %
            lightboxState.sequence.length;
        const artId = lightboxState.sequence[normalizedIndex];
        const artwork = getArtworkById(artId);

        if (!artwork) {
            return;
        }

        const metaText =
            artwork.technique +
            " · " +
            artwork.dimensions +
            " · " +
            String(artwork.year);

        lightboxState.currentIndex = normalizedIndex;
        openLightbox(artwork.title, metaText, artwork.image);
    }

    function initLightboxEvents() {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox) {
            return;
        }

        lightbox.addEventListener("click", function (event) {
            if (
                event.target === lightbox ||
                event.target.closest("[data-lightbox-close]")
            ) {
                closeLightbox();
            }
        });

        document.addEventListener("click", function (event) {
            const trigger = event.target.closest(".js-open-lightbox");
            if (!trigger) {
                return;
            }

            const card = trigger.closest("[data-art-id]");
            if (!card) {
                return;
            }

            const artwork = getArtworkById(card.dataset.artId);
            if (!artwork) {
                return;
            }

            const cards = Array.from(
                document.querySelectorAll("[data-art-id]"),
            ).filter(function (item) {
                return !item.classList.contains("hidden");
            });

            lightboxState.sequence = cards
                .map(function (item) {
                    return item.dataset.artId;
                })
                .filter(Boolean);

            const index = lightboxState.sequence.indexOf(artwork.id);
            showLightboxByIndex(index === -1 ? 0 : index);
        });

        document.addEventListener("click", function (event) {
            const prevButton = event.target.closest("[data-lightbox-prev]");
            const nextButton = event.target.closest("[data-lightbox-next]");
            const smallerLensButton = event.target.closest(
                "[data-lightbox-lens-smaller]",
            );
            const largerLensButton = event.target.closest(
                "[data-lightbox-lens-larger]",
            );

            if (prevButton) {
                showLightboxByIndex(lightboxState.currentIndex - 1);
            }

            if (nextButton) {
                showLightboxByIndex(lightboxState.currentIndex + 1);
            }

            if (smallerLensButton) {
                setLightboxLensSize(lightboxState.lensSize - 20);
            }

            if (largerLensButton) {
                setLightboxLensSize(lightboxState.lensSize + 20);
            }
        });

        lightbox.addEventListener("mousemove", function (event) {
            updateLightboxLensPosition(event);
        });

        lightbox.addEventListener("mouseleave", function () {
            hideLightboxLens();
        });

        window.addEventListener("resize", function () {
            hideLightboxLens();
        });

        document.addEventListener("keydown", function (event) {
            if (!lightbox.classList.contains("open")) {
                return;
            }

            if (event.key === "Escape") {
                closeLightbox();
            }

            if (event.key === "ArrowLeft") {
                showLightboxByIndex(lightboxState.currentIndex - 1);
            }

            if (event.key === "ArrowRight") {
                showLightboxByIndex(lightboxState.currentIndex + 1);
            }
        });
    }

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

        function closeNav() {
            nav.classList.remove("nav-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Otworz menu");
        }

        toggle.addEventListener("click", function () {
            const isOpen = nav.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.setAttribute(
                "aria-label",
                isOpen ? "Zamknij menu" : "Otworz menu",
            );
        });

        links.forEach(function (link) {
            link.addEventListener("click", closeNav);
        });

        document.addEventListener("click", function (event) {
            if (!nav.contains(event.target)) {
                closeNav();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeNav();
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 600) {
                closeNav();
            }
        });
    }

    function initActiveSectionState() {
        const links = Array.from(
            document.querySelectorAll("[data-track-section]"),
        );
        if (!links.length) {
            return;
        }

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
                        const match =
                            link.getAttribute("href") === "#" + entry.target.id;
                        if (match) {
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

    async function renderFeaturedGallery() {
        const container = document.getElementById("featured-gallery");
        if (!container) {
            return;
        }

        const artworks = await getArtworks();
        const featured = artworks.filter((item) => item.featured).slice(0, 7);

        container.innerHTML = "";
        featured.forEach(function (artwork) {
            container.appendChild(createArtworkCard(artwork, "index"));
        });
    }

    function initContactEnhancements() {
        const params = new URLSearchParams(window.location.search);
        const selectedArtwork = params.get("art");
        const wasSent = params.get("wyslano") === "1";

        const hiddenArtwork = document.getElementById("artwork-hidden");
        const messageField = document.getElementById("message");
        const successMessage = document.getElementById("form-success");

        if (selectedArtwork && hiddenArtwork) {
            hiddenArtwork.value = selectedArtwork;
        }

        if (selectedArtwork && messageField && !messageField.value.trim()) {
            messageField.value =
                "Dzien dobry, interesuje mnie obraz: " +
                selectedArtwork +
                ". Prosze o informacje o dostepnosci i cenie.";
        }

        if (wasSent && successMessage) {
            successMessage.style.display = "block";
        }
    }

    return {
        createArtworkCard,
        getArtworks,
        getCategoryLabel,
        initActiveSectionState,
        initContactEnhancements,
        initLightboxEvents,
        initMobileNav,
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
    ArtSite.initContactEnhancements();

    try {
        await ArtSite.renderFeaturedGallery();
    } catch (error) {
        const gallery = document.getElementById("featured-gallery");
        if (gallery) {
            gallery.innerHTML =
                '<p class="gallery-empty">Nie mozna teraz wczytac galerii.</p>';
        }
        console.error(error);
    }
});
