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

        const edgeOffset = Math.floor(visibleCount / 2);

        return {
            min: edgeOffset,
            max: slides.length - 1 - edgeOffset,
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
        const currentSlide = slides[activeIndex];
        const slideCenter = currentSlide.offsetLeft + currentSlide.offsetWidth / 2;
        const wrapperCenter = wrapper.clientWidth / 2;
        const maxOffset = Math.max(track.scrollWidth - wrapper.clientWidth, 0);
        const offset = Math.min(Math.max(slideCenter - wrapperCenter, 0), maxOffset);

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
