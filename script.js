const stage = document.querySelector(".orbital-stage");
const root = document.documentElement;
const missionFrame = document.querySelector("#missionFrame");
const missionPoster = document.querySelector(".mission-poster");
const frameContext = missionFrame.getContext("2d", { alpha: false, desynchronized: true });

const frameCount = 96;
const frameSets = {
  standard: {
    name: "standard",
    basePath: "/frames",
    pixelRatioCap: 2
  },
  high: {
    name: "high",
    basePath: "/frames-hq",
    pixelRatioCap: 1.5,
    mobilePixelRatioCap: 1.75
  }
};

let activeFrameSet = selectFrameSet();
let targetFrame = 0;
let smoothFrame = 0;
let currentFrame = -1;
let scrollProgress = 0;
let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const preloadedFrames = new Map();
const requestedFrames = new Set();
const readyFrames = new Set();
let pendingFrame = 0;
let frameRequestVersion = 0;
let stageTop = 0;
let stageTravel = 1;
let animationFrameId = 0;
let resizeTimer = 0;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
const getFramePath = (index) => `${activeFrameSet.basePath}/frame_${String(index).padStart(3, "0")}.jpg`;
const getPixelRatioCap = () => {
  const isMobileLayout = window.matchMedia("(max-width: 680px)").matches;
  return isMobileLayout && activeFrameSet.mobilePixelRatioCap
    ? activeFrameSet.mobilePixelRatioCap
    : activeFrameSet.pixelRatioCap;
};

function selectFrameSet() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrainedNetwork = connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "");

  if (constrainedNetwork) {
    return frameSets.standard;
  }

  return frameSets.high;
}

function resetFrameCache(nextFrameSet) {
  activeFrameSet = nextFrameSet;
  frameRequestVersion += 1;
  preloadedFrames.clear();
  requestedFrames.clear();
  readyFrames.clear();
  currentFrame = -1;
  pendingFrame = clamp(Math.round(smoothFrame), 0, frameCount - 1);
  root.dataset.frameQuality = activeFrameSet.name;
  preloadFrames();
}

function updateScrollProgress() {
  scrollProgress = clamp((window.scrollY - stageTop) / stageTravel);
  targetFrame = scrollProgress * (frameCount - 1);
}

function measureStage() {
  const rect = stage.getBoundingClientRect();
  stageTop = window.scrollY + rect.top;
  stageTravel = Math.max(1, stage.offsetHeight - window.innerHeight);
}

function preloadFrames() {
  const preloadVersion = frameRequestVersion;
  const priorityFrames = [0, 1, 2, 4, 8, 16, 32, 48, 64, 80, 95];
  priorityFrames.forEach((index, position) => requestFrame(index, position < 3));

  const loadRemaining = () => {
    if (preloadVersion !== frameRequestVersion) {
      return;
    }

    const remainingFrames = Array.from({ length: frameCount }, (_, index) => index)
      .filter((index) => !priorityFrames.includes(index));
    let cursor = 0;

    const scheduleBatch = () => {
      if (preloadVersion !== frameRequestVersion) {
        return;
      }

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadBatch, { timeout: 1200 });
      } else {
        setTimeout(loadBatch, 180);
      }
    };

    const loadBatch = () => {
      if (preloadVersion !== frameRequestVersion) {
        return;
      }

      const end = Math.min(remainingFrames.length, cursor + 4);
      for (; cursor < end; cursor += 1) {
        requestFrame(remainingFrames[cursor]);
      }
      if (cursor < remainingFrames.length) {
        setTimeout(scheduleBatch, 100);
      }
    };

    scheduleBatch();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadRemaining, { timeout: 1600 });
  } else {
    setTimeout(loadRemaining, 900);
  }
}

function requestFrame(index, priority = false) {
  if (requestedFrames.has(index) || index < 0 || index >= frameCount) {
    return;
  }
  const requestVersion = frameRequestVersion;
  requestedFrames.add(index);
  const image = new Image();
  image.decoding = "async";
  if ("fetchPriority" in image) {
    image.fetchPriority = priority ? "high" : "auto";
  }
  preloadedFrames.set(index, image);

  const markReady = () => {
    if (requestVersion !== frameRequestVersion) {
      return;
    }

    const decode = image.decode ? image.decode().catch(() => {}) : Promise.resolve();
    decode.then(() => {
      if (requestVersion !== frameRequestVersion) {
        return;
      }

      if (image.naturalWidth > 0) {
        readyFrames.add(index);
        if (index === pendingFrame || currentFrame < 0) {
          swapFrame(index);
        }
      }
    });
  };

  image.addEventListener("load", markReady, { once: true });
  image.addEventListener("error", () => {
    if (requestVersion === frameRequestVersion) {
      requestedFrames.delete(index);
    }
  }, { once: true });
  image.src = getFramePath(index);
}

function warmNearbyFrames(index) {
  requestFrame(index - 3);
  requestFrame(index - 2);
  requestFrame(index - 1);
  requestFrame(index);
  requestFrame(index + 1);
  requestFrame(index + 2);
  requestFrame(index + 3);
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

function resizeCanvas() {
  const nextFrameSet = selectFrameSet();
  if (nextFrameSet.name !== activeFrameSet.name) {
    resetFrameCache(nextFrameSet);
  }

  const rect = missionFrame.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, getPixelRatioCap());
  const width = Math.max(1, Math.round(rect.width * pixelRatio));
  const height = Math.max(1, Math.round(rect.height * pixelRatio));

  if (missionFrame.width !== width || missionFrame.height !== height) {
    missionFrame.width = width;
    missionFrame.height = height;
    drawFrame(currentFrame);
  }
}

function drawFrame(index) {
  const image = preloadedFrames.get(index);
  if (!image || !readyFrames.has(index) || image.naturalWidth === 0) {
    return false;
  }

  const canvasWidth = missionFrame.width;
  const canvasHeight = missionFrame.height;
  const scale = Math.max(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = (canvasHeight - drawHeight) / 2;

  frameContext.fillStyle = "#07101b";
  frameContext.fillRect(0, 0, canvasWidth, canvasHeight);
  frameContext.imageSmoothingEnabled = true;
  frameContext.imageSmoothingQuality = "high";
  frameContext.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  markFramesReady();
  return true;
}

function markFramesReady() {
  if (root.dataset.framesReady === "true") {
    return;
  }

  root.dataset.framesReady = "true";
  if (missionPoster) {
    setTimeout(() => missionPoster.remove(), 220);
  }
}

function swapFrame(index) {
  if (index === currentFrame || !readyFrames.has(index)) {
    return;
  }
  if (drawFrame(index)) {
    currentFrame = index;
  }
}

function updateMissionFrame() {
  smoothFrame = reducedMotion ? targetFrame : lerp(smoothFrame, targetFrame, 0.42);
  const nextFrame = clamp(Math.round(smoothFrame), 0, frameCount - 1);
  pendingFrame = nextFrame;
  warmNearbyFrames(nextFrame);
  swapFrame(findReadyFrame(nextFrame));
  return !reducedMotion && Math.abs(targetFrame - smoothFrame) > 0.02;
}

function updateCssState() {
  root.style.setProperty("--scroll-progress", scrollProgress.toFixed(4));
  root.style.setProperty("--video-scale", `${(1.03 - scrollProgress * 0.02).toFixed(4)}`);
  root.style.setProperty("--copy-y", `${(scrollProgress * -16).toFixed(2)}px`);
}

function tick() {
  animationFrameId = 0;
  updateScrollProgress();
  const isSettling = updateMissionFrame();
  updateCssState();
  if (isSettling) {
    scheduleTick();
  }
}

function scheduleTick() {
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(tick);
  }
}

function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    measureStage();
    resizeCanvas();
    scheduleTick();
  }, 120);
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

root.dataset.frameQuality = activeFrameSet.name;
root.dataset.animationLoop = "demand";
preloadFrames();
setupReveals();
measureStage();
resizeCanvas();
updateScrollProgress();
scheduleTick();

window.addEventListener("scroll", scheduleTick, { passive: true });
window.addEventListener("resize", handleResize, { passive: true });
