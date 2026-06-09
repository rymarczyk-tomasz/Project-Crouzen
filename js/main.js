function openLightbox(name, meta, src) {
    const lb = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    const ph = document.getElementById("lightbox-placeholder");
    document.getElementById("lightbox-name").textContent = name;
    document.getElementById("lightbox-meta").textContent = meta;

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
}

function closeLightbox(e) {
    if (
        e &&
        e.target !== e.currentTarget &&
        !e.target.classList.contains("lightbox-close")
    )
        return;
    document.getElementById("lightbox").classList.remove("open");
    document.body.style.overflow = "";
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
});

function handleSubmit(e) {
    e.preventDefault();
    document.getElementById("form-success").style.display = "block";
    e.target.reset();
}

function updateFooterYear() {
    const yearElement = document.getElementById("footer-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

document.addEventListener("DOMContentLoaded", updateFooterYear);
