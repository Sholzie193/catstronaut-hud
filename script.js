const stage = document.querySelector(".orbital-stage");
const root = document.documentElement;
const missionFrame = document.querySelector("#missionFrame");
const progressBar = document.querySelector("#progressBar");

const frameCount = 96;
const framePaths = Array.from({ length: frameCount }, (_, index) => `/frames/frame_${String(index).padStart(3, "0")}.jpg`);
let targetFrame = 0;
let smoothFrame = 0;
let currentFrame = 0;
let scrollProgress = 0;
let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const preloadedFrames = new Map();
const requestedFrames = new Set([0]);
const readyFrames = new Set([0]);
let pendingFrame = 0;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;

function updateScrollProgress() {
  const rect = stage.getBoundingClientRect();
  const travel = Math.max(1, rect.height - window.innerHeight);
  scrollProgress = clamp(-rect.top / travel);
  targetFrame = scrollProgress * (frameCount - 1);
}

function preloadFrames() {
  const priorityFrames = [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 95];
  priorityFrames.forEach(requestFrame);

  const loadRemaining = () => {
    let index = 1;
    const loadBatch = () => {
      const end = Math.min(frameCount, index + 8);
      for (; index < end; index += 1) {
        requestFrame(index);
      }
      if (index < frameCount) {
        setTimeout(loadBatch, 180);
      }
    };
    loadBatch();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadRemaining, { timeout: 1600 });
  } else {
    setTimeout(loadRemaining, 900);
  }
}

function requestFrame(index) {
  if (requestedFrames.has(index) || index < 0 || index >= frameCount) {
    return;
  }
  requestedFrames.add(index);
  const image = new Image();
  image.decoding = "async";
  preloadedFrames.set(index, image);

  const markReady = () => {
    const decode = image.decode ? image.decode().catch(() => {}) : Promise.resolve();
    decode.then(() => {
      if (image.naturalWidth > 0) {
        readyFrames.add(index);
        if (index === pendingFrame) {
          swapFrame(index);
        }
      }
    });
  };

  image.addEventListener("load", markReady, { once: true });
  image.addEventListener("error", () => requestedFrames.delete(index), { once: true });
  image.src = framePaths[index];
}

function warmNearbyFrames(index) {
  requestFrame(index - 2);
  requestFrame(index);
  requestFrame(index + 1);
  requestFrame(index + 2);
  requestFrame(index - 1);
}

function findReadyFrame(index) {
  if (readyFrames.has(index)) {
    return index;
  }

  for (let distance = 1; distance < 7; distance += 1) {
    const previous = index - distance;
    const next = index + distance;

    if (readyFrames.has(previous)) {
      return previous;
    }

    if (readyFrames.has(next)) {
      return next;
    }
  }

  return currentFrame;
}

function swapFrame(index) {
  if (index === currentFrame || !readyFrames.has(index)) {
    return;
  }
  currentFrame = index;
  missionFrame.src = framePaths[currentFrame];
}

function updateMissionFrame() {
  smoothFrame = reducedMotion ? targetFrame : lerp(smoothFrame, targetFrame, 0.42);
  const nextFrame = clamp(Math.round(smoothFrame), 0, frameCount - 1);
  pendingFrame = nextFrame;
  warmNearbyFrames(nextFrame);
  swapFrame(findReadyFrame(nextFrame));
}

function updateCssState() {
  root.style.setProperty("--scroll-progress", scrollProgress.toFixed(4));
  root.style.setProperty("--video-scale", `${(1.03 - scrollProgress * 0.02).toFixed(4)}`);
  root.style.setProperty("--copy-y", `${(scrollProgress * -16).toFixed(2)}px`);
  if (progressBar) {
    progressBar.style.width = `${scrollProgress * 100}%`;
  }
}

function tick() {
  updateScrollProgress();
  updateMissionFrame();
  updateCssState();
  requestAnimationFrame(tick);
}

function setupReveals() {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.18 });

  reveals.forEach((item) => observer.observe(item));
}

preloadFrames();
setupReveals();
updateScrollProgress();
tick();
