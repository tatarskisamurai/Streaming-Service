const track = document.querySelector(".track");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
let isLocked = false;

const BASE = "translateX(calc(20% - var(--step)))";
const NEXT = "translateX(calc(20% - (var(--step) * 2)))";
const BASE_SLIDE_WIDTH = 1020;
const MIN_SCALE = 0.62;
const MAX_SCALE = 1.18;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const updateSlideScale = () => {
  if (!track) return;
  [...track.children].forEach((slide) => {
    const width = slide.offsetWidth || slide.clientWidth;
    if (!width) return;
    const scale = clamp(width / BASE_SLIDE_WIDTH, MIN_SCALE, MAX_SCALE);
    slide.style.setProperty("--slide-scale", scale.toFixed(3));
  });
};

const setActive = (activeIndex = 1) => {
  if (!track) return;
  [...track.children].forEach((slide, i) => slide.classList.toggle("is-active", i === activeIndex));
};

const next = () => {
  if (!track || isLocked) return;
  isLocked = true;
  setActive(2);
  track.style.transition = "transform 0.35s ease";
  track.style.transform = NEXT;

  const onEnd = () => {
    track.removeEventListener("transitionend", onEnd);
    track.style.transition = "none";
    track.append(track.firstElementChild);
    track.style.transform = BASE;
    track.offsetHeight;
    track.style.transition = "transform 0.35s ease";
    isLocked = false;
  };

  track.addEventListener("transitionend", onEnd);
};
const prev = () => {
  if (!track || isLocked) return;
  isLocked = true;
  track.style.transition = "none";
  track.prepend(track.lastElementChild);
  track.style.transform = NEXT;
  setActive(1);
  track.offsetHeight;

  track.style.transition = "transform 0.35s ease";
  track.style.transform = BASE;

  const onEnd = () => {
    track.removeEventListener("transitionend", onEnd);
    isLocked = false;
  };

  track.addEventListener("transitionend", onEnd);
};

if (prevBtn) prevBtn.onclick = prev;
if (nextBtn) nextBtn.onclick = next;

if (track) {
  track.style.transform = BASE;
}

if (track) {
  const mutationObserver = new MutationObserver(() => {
    if (isLocked) return;
    updateSlideScale();
  });
  mutationObserver.observe(track, { childList: true });

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(updateSlideScale);
    resizeObserver.observe(track);
  } else {
    window.addEventListener("resize", updateSlideScale);
  }

  requestAnimationFrame(() => {
    setActive(1);
    updateSlideScale();
  });
}
