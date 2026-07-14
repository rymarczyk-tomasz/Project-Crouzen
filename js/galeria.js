document.addEventListener("DOMContentLoaded", async function () {
    const galleryContainer = document.getElementById("gallery-container");
    const filterContainer = document.getElementById("gallery-filters");
    const emptyMessage = document.getElementById("gallery-empty");

    if (!galleryContainer || !filterContainer || !window.ArtSite) {
        return;
    }

    let currentFilter = "all";
    let artworks = [];

    function renderFilters() {
        const categories = Array.from(
            new Set(artworks.map((item) => item.category)),
        );

        const allFilters = ["all"].concat(categories);
        filterContainer.innerHTML = "";

        allFilters.forEach(function (filter) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "filter-btn";
            button.dataset.filter = filter;
            button.textContent =
                filter === "all"
                    ? "Wszystkie"
                    : window.ArtSite.getCategoryLabel(filter);

            if (filter === currentFilter) {
                button.classList.add("active");
                button.setAttribute("aria-pressed", "true");
            } else {
                button.setAttribute("aria-pressed", "false");
            }

            button.addEventListener("click", function () {
                currentFilter = filter;
                renderFilters();
                renderGallery();
            });

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
            if (visible.length === 0) {
                emptyMessage.classList.remove("hidden");
            } else {
                emptyMessage.classList.add("hidden");
            }
        }
    }

    try {
        artworks = await window.ArtSite.getArtworks();
        renderFilters();
        renderGallery();
    } catch (error) {
        if (emptyMessage) {
            emptyMessage.textContent = "Nie mozna teraz wczytac galerii.";
            emptyMessage.classList.remove("hidden");
        }
        console.error(error);
    }
});
