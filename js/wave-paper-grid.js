(() => {
  'use strict';

  const canvas = document.getElementById('wave-paper-grid');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;

  const state = {
    w: 0,
    h: 0,
    dpr: 1,
    t0: performance.now(),
    pausedAt: 0,
    raf: 0,
    visible: true
  };

  /*
    Autonomous elastic-paper grid.
    IMPORTANT: this field is driven ONLY by animation time.
    There is no scroll input and no reduced-motion gate, so it keeps moving
    continuously while the page is open, independent of whether the visitor
    is scrolling or standing still.
  */
  const cfg = {
    spacing: 58,
    sample: 8,
    line: 'rgba(55, 67, 72, 0.20)',
    lineSoft: 'rgba(55, 67, 72, 0.060)',
    ampX: 14.5,
    ampY: 12.0,
    speed: 0.00102
  };

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    state.w = Math.max(1, window.innerWidth);
    state.h = Math.max(1, window.innerHeight);

    canvas.width = Math.round(state.w * state.dpr);
    canvas.height = Math.round(state.h * state.dpr);
    canvas.style.width = state.w + 'px';
    canvas.style.height = state.h + 'px';

    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    draw(performance.now(), true);
    kick();
  }

  function deform(x, y, time) {
    /* Multiple independent oscillators make the mesh feel like one sheet of
       flexible paper rather than a simple sine-wave overlay. */
    const dx =
      Math.sin(y * 0.0104 + time * 0.92) * cfg.ampX +
      Math.sin((x + y) * 0.0047 - time * 0.71) * 5.1 +
      Math.cos(x * 0.0061 - y * 0.0031 + time * 0.47) * 3.2 +
      Math.sin(y * 0.0027 - time * 0.31) * 2.1;

    const dy =
      Math.cos(x * 0.0091 - time * 0.84) * cfg.ampY +
      Math.sin((x - y) * 0.0042 + time * 0.63) * 4.4 +
      Math.sin(y * 0.0050 + time * 0.39) * 2.7 +
      Math.cos(x * 0.0027 + time * 0.29) * 1.9;

    return [x + dx, y + dy];
  }

  function drawPathVertical(baseX, time, soft = false) {
    ctx.beginPath();
    let first = true;
    for (let y = -90; y <= state.h + 90; y += cfg.sample) {
      const p = deform(baseX, y, time);
      if (first) {
        ctx.moveTo(p[0], p[1]);
        first = false;
      } else {
        ctx.lineTo(p[0], p[1]);
      }
    }
    ctx.strokeStyle = soft ? cfg.lineSoft : cfg.line;
    ctx.stroke();
  }

  function drawPathHorizontal(baseY, time, soft = false) {
    ctx.beginPath();
    let first = true;
    for (let x = -90; x <= state.w + 90; x += cfg.sample) {
      const p = deform(x, baseY, time);
      if (first) {
        ctx.moveTo(p[0], p[1]);
        first = false;
      } else {
        ctx.lineTo(p[0], p[1]);
      }
    }
    ctx.strokeStyle = soft ? cfg.lineSoft : cfg.line;
    ctx.stroke();
  }

  function draw(now, oneShot = false) {
    state.raf = 0;
    if (!state.visible && !oneShot) return;

    /* Pure time-based phase. This changes every animation frame even when the
       scroll position is completely stationary. */
    const elapsed = (now - state.t0) * cfg.speed;

    ctx.clearRect(0, 0, state.w, state.h);
    ctx.save();
    ctx.lineWidth = 0.82;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const s = cfg.spacing;

    /* Independent two-axis drift makes the entire grid visibly travel while
       its individual lines also flex. No scrollY or page-position values. */
    const ox = -s + Math.sin(elapsed * 0.52) * 15 + Math.sin(elapsed * 0.17) * 5;
    const oy = -s + Math.cos(elapsed * 0.44) * 13 + Math.sin(elapsed * 0.23) * 5;

    for (let x = ox; x <= state.w + s; x += s) {
      drawPathVertical(x, elapsed, false);
    }
    for (let y = oy; y <= state.h + s; y += s) {
      drawPathHorizontal(y, elapsed, false);
    }

    /* Half-step secondary mesh gives depth while retaining the bright paper. */
    ctx.lineWidth = 0.44;
    for (let x = ox + s * 0.5; x <= state.w + s; x += s) {
      drawPathVertical(x, elapsed + 0.21, true);
    }
    for (let y = oy + s * 0.5; y <= state.h + s; y += s) {
      drawPathHorizontal(y, elapsed + 0.21, true);
    }

    ctx.restore();

    if (!oneShot && state.visible) {
      state.raf = requestAnimationFrame(draw);
    }
  }

  function kick() {
    if (!state.raf && state.visible) {
      state.raf = requestAnimationFrame(draw);
    }
  }

  window.addEventListener('resize', resize, { passive: true });

  /* Intentionally NO scroll listener. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      state.visible = false;
      state.pausedAt = performance.now();
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = 0;
      return;
    }

    /* Exclude time spent in a background tab so the mesh resumes smoothly. */
    if (state.pausedAt) {
      state.t0 += performance.now() - state.pausedAt;
      state.pausedAt = 0;
    }
    state.visible = true;
    kick();
  });

  resize();
})();
