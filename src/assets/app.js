/**
 * Bike slider
 */
(() => {
    const slider = document.querySelector(".bike-selection-slider");
    if (!slider) return;

    const wrapper = slider.querySelector(".bike-selection-slider-wrapper");
    const slides = Array.from(slider.querySelectorAll(".bike-selection-slider-item"));
    const buttonsRoot = document.querySelector(".bike-selection-slider-buttons");
    const prevButton = slider.querySelector(".bike-selection-slider-arrow-prev");
    const nextButton = slider.querySelector(".bike-selection-slider-arrow-next");

    if (!wrapper || !slides.length) return;

    const track = document.createElement("div");
    track.className = "bike-selection-slider-track";

    slides.forEach((slide) => track.appendChild(slide));
    wrapper.appendChild(track);

    let activeIndex = 0;
    let pointerId = null;
    let startX = 0;
    let deltaX = 0;
    const buttons = slides.map((_, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", `Перейти к слайду ${index + 1}`);
        button.addEventListener("click", () => setActiveSlide(index));
        if (buttonsRoot) {
            buttonsRoot.appendChild(button);
        }
        return button;
    });

    const updateState = () => {
        slides.forEach((slide, index) => {
            slide.classList.toggle("active", index === activeIndex);
        });

        buttons.forEach((button, index) => {
            const isActive = index === activeIndex;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        if (prevButton) prevButton.disabled = activeIndex === 0;
        if (nextButton) nextButton.disabled = activeIndex === slides.length - 1;
    };

    const updatePosition = () => {
        const currentSlide = slides[activeIndex];
        const slideCenter = currentSlide.offsetLeft + currentSlide.offsetWidth / 2;
        const wrapperCenter = wrapper.clientWidth / 2;
        const maxOffset = Math.max(track.scrollWidth - wrapper.clientWidth, 0);
        const offset = Math.min(Math.max(slideCenter - wrapperCenter, 0), maxOffset);

        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const setActiveSlide = (index) => {
        activeIndex = Math.min(Math.max(index, 0), slides.length - 1);
        updateState();
        updatePosition();
    };

    if (prevButton) {
        prevButton.addEventListener("click", () => setActiveSlide(activeIndex - 1));
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => setActiveSlide(activeIndex + 1));
    }

    wrapper.addEventListener("pointerdown", (event) => {
        pointerId = event.pointerId;
        startX = event.clientX;
        deltaX = 0;
        wrapper.setPointerCapture(pointerId);
    });

    wrapper.addEventListener("pointermove", (event) => {
        if (pointerId !== event.pointerId) return;
        deltaX = event.clientX - startX;
    });

    const finishSwipe = (event) => {
        if (pointerId !== event.pointerId) return;

        if (Math.abs(deltaX) > 50) {
            setActiveSlide(activeIndex + (deltaX < 0 ? 1 : -1));
        }

        wrapper.releasePointerCapture(pointerId);
        pointerId = null;
        startX = 0;
        deltaX = 0;
    };

    wrapper.addEventListener("pointerup", finishSwipe);
    wrapper.addEventListener("pointercancel", finishSwipe);
    window.addEventListener("resize", updatePosition);

    setActiveSlide(0);
})();

/**
 * Blog slider
 */
(() => {
    const slider = document.querySelector(".blog-slider");
    if (!slider) return;

    const wrapper = slider.querySelector(".blog-slider-wrapper");
    const slides = Array.from(slider.querySelectorAll(".blog-slider-item"));
    const arrowButtons = slider.querySelectorAll(".blog-slider-arrows button");
    const prevButton = arrowButtons[0];
    const nextButton = arrowButtons[1];

    if (!wrapper || !slides.length) return;

    const track = document.createElement("div");
    track.className = "blog-slider-track";

    slides.forEach((slide) => track.appendChild(slide));
    wrapper.appendChild(track);

    let activeIndex = Math.min(1, slides.length - 1);
    let pointerId = null;
    let startX = 0;
    let deltaX = 0;

    const getGap = () => {
        const styles = window.getComputedStyle(track);
        return parseFloat(styles.columnGap || styles.gap || "0");
    };

    const getVisibleCount = () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = getGap();

        if (!slideWidth) return 1;

        return Math.max(
            1,
            Math.min(slides.length, Math.round((wrapper.clientWidth + gap) / (slideWidth + gap)))
        );
    };

    const getBounds = () => {
        const visibleCount = getVisibleCount();

        if (slides.length <= visibleCount) {
            return { min: 0, max: 0, visibleCount };
        }

        const min = Math.floor((visibleCount - 1) / 2);
        const max = slides.length - Math.ceil(visibleCount / 2);

        return {
            min,
            max,
            visibleCount,
        };
    };

    const getVisibleRange = () => {
        const { visibleCount } = getBounds();
        const maxStart = Math.max(slides.length - visibleCount, 0);
        const start = Math.min(
            Math.max(activeIndex - Math.floor((visibleCount - 1) / 2), 0),
            maxStart
        );

        return {
            start,
            end: start + visibleCount - 1,
            visibleCount,
        };
    };

    const updateState = () => {
        const { min, max, visibleCount } = getBounds();
        const { start, end } = getVisibleRange();

        slides.forEach((slide, index) => {
            slide.classList.toggle("active", index === activeIndex);
            slide.classList.toggle("is-visible", index >= start && index <= end);
        });

        if (prevButton) prevButton.disabled = visibleCount >= slides.length || activeIndex <= min;
        if (nextButton) nextButton.disabled = visibleCount >= slides.length || activeIndex >= max;
    };

    const updatePosition = () => {
        const { start, end } = getVisibleRange();
        const firstSlide = slides[start];
        const lastSlide = slides[end];
        const visibleGroupStart = firstSlide.offsetLeft;
        const visibleGroupEnd = lastSlide.offsetLeft + lastSlide.offsetWidth;
        const visibleGroupCenter = (visibleGroupStart + visibleGroupEnd) / 2;
        const wrapperCenter = wrapper.clientWidth / 2;
        const maxOffset = Math.max(track.scrollWidth - wrapper.clientWidth, 0);
        const offset = Math.min(Math.max(visibleGroupCenter - wrapperCenter, 0), maxOffset);

        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const setActiveSlide = (index) => {
        const { min, max } = getBounds();
        activeIndex = Math.min(Math.max(index, min), max);
        updateState();
        updatePosition();
    };

    if (prevButton) {
        prevButton.addEventListener("click", () => setActiveSlide(activeIndex - 1));
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => setActiveSlide(activeIndex + 1));
    }

    wrapper.addEventListener("pointerdown", (event) => {
        pointerId = event.pointerId;
        startX = event.clientX;
        deltaX = 0;
        wrapper.setPointerCapture(pointerId);
    });

    wrapper.addEventListener("pointermove", (event) => {
        if (pointerId !== event.pointerId) return;
        deltaX = event.clientX - startX;
    });

    const finishSwipe = (event) => {
        if (pointerId !== event.pointerId) return;

        if (Math.abs(deltaX) > 50) {
            setActiveSlide(activeIndex + (deltaX < 0 ? 1 : -1));
        }

        wrapper.releasePointerCapture(pointerId);
        pointerId = null;
        startX = 0;
        deltaX = 0;
    };

    wrapper.addEventListener("pointerup", finishSwipe);
    wrapper.addEventListener("pointercancel", finishSwipe);
    window.addEventListener("resize", () => {
        const { min, max } = getBounds();
        activeIndex = Math.min(Math.max(activeIndex, min), max);
        updateState();
        updatePosition();
    });

    setActiveSlide(activeIndex);
})();

/**
 * Header catalog menu
 */
(() => {
    const header = document.querySelector(".header");
    const toggle = document.querySelector(".header-left a:nth-of-type(3)");
    const menu = document.querySelector(".catalog-menu");
    const categories = Array.from(document.querySelectorAll(".catalog-menu-category"));
    const previewBlocks = Array.from(document.querySelectorAll(".catalog-menu-products"));

    if (!header || !toggle || !menu || !previewBlocks.length) return;

    const showPreview = (previewName) => {
        previewBlocks.forEach((block) => {
            block.classList.toggle("is-active", block.dataset.previewContent === previewName);
        });
    };

    const setOpen = (isOpen) => {
        menu.classList.toggle("is-open", isOpen);
        menu.setAttribute("aria-hidden", String(!isOpen));
        toggle.setAttribute("aria-expanded", String(isOpen));
    };

    toggle.setAttribute("aria-controls", "catalog-menu");
    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", (event) => {
        event.preventDefault();
        setOpen(!menu.classList.contains("is-open"));
    });

    document.addEventListener("click", (event) => {
        if (!menu.classList.contains("is-open")) return;
        if (header.contains(event.target)) return;
        setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setOpen(false);
        }
    });

    categories.forEach((category) => {
        category.addEventListener("click", () => {
            categories.forEach((item) => item.classList.remove("active"));
            category.classList.add("active");
            showPreview(category.dataset.preview || "");
        });
    });

    showPreview(categories.find((item) => item.classList.contains("active"))?.dataset.preview || "");
})();

/**
 * Catalog sort and filters
 */
(() => {
    const sort = document.querySelector(".catalog-filters-sort");
    const sortToggle = sort?.querySelector(".catalog-filters-sort-toggle");
    const filterItems = Array.from(document.querySelectorAll(".catalog-filters-item"));

    if (!sort && !filterItems.length) return;

    const closeSort = () => {
        if (!sort || !sortToggle) return;

        sort.classList.remove("is-open");
        sortToggle.setAttribute("aria-expanded", "false");
    };

    const closeFilters = () => {
        filterItems.forEach((item) => {
            item.classList.remove("is-open");
            item.removeAttribute("open");

            const toggle = item.querySelector(".catalog-filters-item-toggle");

            if (toggle) {
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    };

    const closeAll = () => {
        closeSort();
        closeFilters();
    };

    filterItems.forEach((item) => {
        const toggle = item.querySelector(".catalog-filters-item-toggle");
        const options = Array.from(item.querySelectorAll(".catalog-filters-item-list li"));

        if (!toggle) return;

        toggle.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            const isOpen = item.classList.contains("is-open") || item.hasAttribute("open");

            closeAll();

            item.classList.toggle("is-open", !isOpen);
            item.toggleAttribute("open", !isOpen);
            toggle.setAttribute("aria-expanded", String(!isOpen));
        });

        options.forEach((option) => {
            option.addEventListener("click", () => {
                options.forEach((current) => current.classList.remove("active"));
                option.classList.add("active");
                item.classList.add("catalog-filters-item-touched");
                item.classList.remove("is-open");
                item.removeAttribute("open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    });

    if (sort && sortToggle) {
        sortToggle.addEventListener("click", (event) => {
            event.stopPropagation();

            const isOpen = sort.classList.contains("is-open");

            closeAll();

            sort.classList.toggle("is-open", !isOpen);
            sortToggle.setAttribute("aria-expanded", String(!isOpen));
        });
    }

    document.addEventListener("click", (event) => {
        const clickedInsideFilter = filterItems.some((item) => item.contains(event.target));
        const clickedInsideSort = sort?.contains(event.target);

        if (!clickedInsideFilter && !clickedInsideSort) {
            closeAll();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAll();
        }
    });
})();

/**
 * FAQ
 */
(() => {
    const items = Array.from(document.querySelectorAll(".faq-item"));

    if (!items.length) return;

    const setItemState = (item, isOpen) => {
        const button = item.querySelector(".faq-item-toggle");

        if (!button) return;

        item.classList.toggle("is-open", isOpen);
        button.setAttribute("aria-expanded", String(isOpen));
    };

    items.forEach((item) => {
        const button = item.querySelector(".faq-item-toggle");

        if (!button) return;

        button.setAttribute("aria-expanded", "false");

        button.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");

            items.forEach((currentItem) => setItemState(currentItem, false));
            setItemState(item, !isOpen);
        });
    });
})();

/**
 * Product gallery and tabs
 */
(() => {
    const productCard = document.querySelector(".product-card");

    if (!productCard) return;

    const slides = Array.from(productCard.querySelectorAll(".product-gallery-main-image"));
    const thumbs = Array.from(productCard.querySelectorAll(".product-gallery-thumb"));
    const thumbsTrack = productCard.querySelector(".product-gallery-thumbs");
    const thumbsViewport = productCard.querySelector(".product-gallery-thumbs-viewport");
    const prevButton = productCard.querySelector(".product-gallery-arrow-up");
    const nextButton = productCard.querySelector(".product-gallery-arrow-down");
    const tabs = Array.from(productCard.querySelectorAll(".product-tab-item"));

    let activeIndex = 0;
    let thumbOffset = 0;

    const getThumbMetrics = () => {
        const firstThumb = thumbs[0];

        if (!firstThumb || !thumbsTrack || !thumbsViewport) {
            return { isRow: false, step: 0, visibleCount: thumbs.length };
        }

        const styles = window.getComputedStyle(thumbsTrack);
        const isRow = styles.flexDirection === "row";
        const gap = parseFloat(styles.gap || "0");
        const thumbSize = isRow ? firstThumb.offsetWidth : firstThumb.offsetHeight;
        const viewportSize = isRow ? thumbsViewport.clientWidth : thumbsViewport.clientHeight;
        const step = thumbSize + gap;
        const visibleCount = step > 0 ? Math.max(1, Math.floor((viewportSize + gap) / step)) : thumbs.length;

        return { isRow, step, visibleCount };
    };

    const updateThumbsPosition = () => {
        if (!thumbsTrack) return;

        const { isRow, step } = getThumbMetrics();
        const offset = thumbOffset * step;

        thumbsTrack.style.transform = isRow
            ? `translate3d(${-offset}px, 0, 0)`
            : `translate3d(0, ${-offset}px, 0)`;
    };

    const syncThumbOffset = () => {
        const { visibleCount } = getThumbMetrics();
        const maxOffset = Math.max(thumbs.length - visibleCount, 0);

        if (activeIndex < thumbOffset) {
            thumbOffset = activeIndex;
        } else if (activeIndex >= thumbOffset + visibleCount) {
            thumbOffset = activeIndex - visibleCount + 1;
        }

        thumbOffset = Math.min(Math.max(thumbOffset, 0), maxOffset);
    };

    const updateState = () => {
        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === activeIndex);
        });

        thumbs.forEach((thumb, index) => {
            const isActive = index === activeIndex;
            thumb.classList.toggle("is-active", isActive);
            thumb.setAttribute("aria-pressed", String(isActive));
        });

        syncThumbOffset();
        updateThumbsPosition();
    };

    const setTabState = (tab, isOpen) => {
        const button = tab.querySelector(".product-tab-toggle");

        if (!button) return;

        tab.classList.toggle("is-open", isOpen);
        button.setAttribute("aria-expanded", String(isOpen));
    };

    const setActiveSlide = (index) => {
        activeIndex = Math.min(Math.max(index, 0), slides.length - 1);
        updateState();
    };

    thumbs.forEach((thumb, index) => {
        thumb.addEventListener("click", () => setActiveSlide(index));
    });

    if (prevButton) {
        prevButton.addEventListener("click", () => {
            thumbOffset = Math.max(thumbOffset - 1, 0);
            updateThumbsPosition();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            const { visibleCount } = getThumbMetrics();
            const maxOffset = Math.max(thumbs.length - visibleCount, 0);
            thumbOffset = Math.min(thumbOffset + 1, maxOffset);
            updateThumbsPosition();
        });
    }

    tabs.forEach((tab) => {
        const button = tab.querySelector(".product-tab-toggle");

        if (!button) return;

        button.setAttribute("aria-expanded", "false");

        button.addEventListener("click", () => {
            const isOpen = tab.classList.contains("is-open");

            tabs.forEach((currentTab) => setTabState(currentTab, false));
            setTabState(tab, !isOpen);
        });
    });

    window.addEventListener("resize", updateState);

    updateState();
})();

/**
 * Home burger
 */
(() => {
    const header = document.querySelector(".header-home");
    const toggle = header?.querySelector(".header-home-burger");
    const panel = header?.querySelector(".header-home-mobile-panel");
    const submenuItems = Array.from(header?.querySelectorAll(".header-home-mobile-item.has-children") || []);

    if (!header || !toggle || !panel) return;

    const setOpen = (isOpen) => {
        panel.classList.toggle("is-open", isOpen);
        panel.setAttribute("aria-hidden", String(!isOpen));
        toggle.setAttribute("aria-expanded", String(isOpen));
    };

    toggle.addEventListener("click", () => {
        setOpen(!panel.classList.contains("is-open"));
    });

    document.addEventListener("click", (event) => {
        if (!panel.classList.contains("is-open")) return;
        if (header.contains(event.target)) return;
        setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setOpen(false);
        }
    });

    submenuItems.forEach((item) => {
        const button = item.querySelector(".header-home-mobile-subtoggle");

        if (!button) return;

        button.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");

            submenuItems.forEach((currentItem) => {
                currentItem.classList.remove("is-open");
                currentItem
                    .querySelector(".header-home-mobile-subtoggle")
                    ?.setAttribute("aria-expanded", "false");
            });

            item.classList.toggle("is-open", !isOpen);
            button.setAttribute("aria-expanded", String(!isOpen));
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 850) {
            setOpen(false);
        }
    });
})();
