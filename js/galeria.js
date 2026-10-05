document.addEventListener("DOMContentLoaded", async function () {
    const galleryContainer = document.getElementById("gallery-container");
    const filterContainer = document.getElementById("gallery-filters");
    const emptyMessage = document.getElementById("gallery-empty");

    if (!galleryContainer || !filterContainer || !window.ArtSite) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    let currentFilter = params.get("kategoria") || "all";
    let artworks = [];

    function setFilter(filter) {
        currentFilter = filter;

        const url = new URL(window.location.href);
        if (filter === "all") {
            url.searchParams.delete("kategoria");
        } else {
            url.searchParams.set("kategoria", filter);
        }
        history.replaceState(null, "", url);

        renderFilters();
        renderGallery();
    }

    function renderFilters() {
        const counts = new Map();
        artworks.forEach(function (item) {
            counts.set(item.category, (counts.get(item.category) || 0) + 1);
        });

        // Jedna kategoria = filtry nic nie dają
        filterContainer.parentElement.hidden = counts.size < 2;

        const allFilters = [["all", artworks.length]].concat(
            Array.from(counts.entries()),
        );
        filterContainer.innerHTML = "";

        allFilters.forEach(function ([filter, count]) {
            const button = document.createElement("button");
            const isActive = filter === currentFilter;
            button.type = "button";
            button.className = "filter-btn" + (isActive ? " active" : "");
            button.setAttribute("aria-pressed", String(isActive));
            button.textContent =
                (filter === "all"
                    ? "Wszystkie"
                    : window.ArtSite.getCategoryLabel(filter)) +
                " (" +
                count +
                ")";

            button.addEventListener("click", () => setFilter(filter));
            filterContainer.appendChild(button);
        });
    }

    function renderGallery() {
        const visible = artworks.filter(function (item) {
            return currentFilter === "all" || item.category === currentFilter;
        });

        galleryContainer.innerHTML = "";
        visible.forEach(function (artwork) {
            galleryContainer.appendChild(
                window.ArtSite.createArtworkCard(artwork, "gallery"),
            );
        });

        if (emptyMessage) {
            emptyMessage.hidden = visible.length > 0;
        }
    }

    try {
        artworks = await window.ArtSite.getArtworks();
        if (!artworks.some((item) => item.category === currentFilter)) {
            currentFilter = "all";
        }
        renderFilters();
        renderGallery();
    } catch (error) {
        if (emptyMessage) {
            emptyMessage.textContent = "Nie można teraz wczytać galerii.";
            emptyMessage.hidden = false;
        }
        console.error(error);
    }
});
