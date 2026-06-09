document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".filter-btn");
    const items = document.querySelectorAll(".fg-item");
    const emptyMsg = document.getElementById("gallery-empty");

    buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const filter = btn.dataset.filter;

            // update active button
            buttons.forEach(function (b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");

            // show/hide items
            let visible = 0;
            items.forEach(function (item) {
                if (filter === "all" || item.dataset.category === filter) {
                    item.classList.remove("hidden");
                    visible++;
                } else {
                    item.classList.add("hidden");
                }
            });

            // empty state
            if (emptyMsg) {
                if (visible === 0) {
                    emptyMsg.classList.remove("hidden");
                } else {
                    emptyMsg.classList.add("hidden");
                }
            }
        });
    });
});
