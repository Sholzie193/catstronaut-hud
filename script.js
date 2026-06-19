const stage = document.querySelector(".orbital-stage");
const root = document.documentElement;
const missionFrame = document.querySelector("#missionFrame");
const frameContext = missionFrame.getContext("2d", { alpha: false, desynchronized: true });
const progressBar = document.querySelector("#progressBar");

const frameCount = 96;
const framePaths = Array.from({ length: frameCount }, (_, index) => `/frames/frame_${String(index).padStart(3, "0")}.jpg`);
let targetFrame = 0;
let smoothFrame = 0;
let currentFrame = -1;
let scrollProgress = 0;
let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const preloadedFrames = new Map();
const requestedFrames = new Set();
const readyFrames = new Set();
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
  const priorityFrames = [0, 1, 2, 4, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 95];
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
        if (index === pendingFrame || currentFrame < 0) {
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
  const rect = missionFrame.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
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
    return;
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
  frameContext.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function swapFrame(index) {
  if (index === currentFrame || !readyFrames.has(index)) {
    return;
  }
  currentFrame = index;
  drawFrame(currentFrame);
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
  resizeCanvas();
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
resizeCanvas();
updateScrollProgress();
tick();

window.addEventListener("resize", resizeCanvas, { passive: true });
