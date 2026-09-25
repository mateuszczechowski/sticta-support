// Landing page interactions. No trackers, no third parties except the
// newsletter endpoint below, which is only contacted when someone submits.

// Launch list: EmailOctopus. Both forms post to the form below with the
// same fields EmailOctopus's own embed uses (field_0 = email, plus its
// honeypot), so the page loads none of its script and no Google reCAPTCHA.
// Turn reCAPTCHA off in the form's settings, or submissions get rejected.
const EO_FORM_ID = "7f7123e2-b8bc-11f1-b7b9-c5447589fe5b";

/* ---------- hero: live map with draggable stickers ---------- */
(async function heroMap() {
  const screen = document.querySelector(".mac-screen");
  const holder = screen.querySelector(".map-live");
  const counter = screen.querySelector("[data-count]");
  const hint = screen.querySelector(".hint");
  try {
    holder.innerHTML = await (await fetch("assets/home/europe.svg")).text();
  } catch { return; }

  const layer = screen.querySelector(".sticker-layer");
  const stickers = [...layer.querySelectorAll(".st")];
  const paths = [...holder.querySelectorAll("path")];

  // The country under a sticker's pin, hit-tested in the map's own
  // coordinates (works even while the demo is scrolled out of view).
  const svg = holder.querySelector("svg");
  function countryAt(st) {
    const tack = st.querySelector(".tack").getBoundingClientRect();
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = new DOMPoint(tack.left + tack.width / 2, tack.top + tack.height * 0.8).matrixTransform(ctm.inverse());
    const hit = paths.find((p) => p.isPointInFill(pt));
    return hit ? hit.dataset.c : null;
  }

  let lastCount = null;
  function refresh(changed) {
    const visited = new Set();
    for (const st of stickers) {
      const c = countryAt(st);
      st.dataset.country = c || "";
      if (c) visited.add(c);
    }
    for (const p of paths) {
      const on = visited.has(p.dataset.c);
      if (on && !p.classList.contains("on") && changed) {
        p.classList.remove("flash"); void p.getBBox(); p.classList.add("flash");
      }
      p.classList.toggle("on", on);
    }
    if (visited.size !== lastCount) {
      counter.textContent = visited.size;
      if (lastCount !== null) { counter.classList.remove("bump"); void counter.offsetWidth; counter.classList.add("bump"); }
      lastCount = visited.size;
    }
  }
  refresh(false);
  addEventListener("resize", () => refresh(false));

  // Drag with pointer events; positions stay in % so the layout scales.
  for (const st of stickers) {
    st.tabIndex = 0;
    st.addEventListener("pointerdown", (e) => {
      if (screen.dataset.mode !== "edit") return;
      e.preventDefault();
      st.setPointerCapture(e.pointerId);
      const box = layer.getBoundingClientRect();
      const startX = parseFloat(st.style.getPropertyValue("--x"));
      const startY = parseFloat(st.style.getPropertyValue("--y"));
      const ox = e.clientX, oy = e.clientY;
      st.classList.add("dragging");
      hint.classList.add("gone");
      const move = (ev) => {
        const w = parseFloat(st.style.getPropertyValue("--w"));
        const x = Math.min(100 - w * 0.5, Math.max(-w * 0.5, startX + (ev.clientX - ox) / box.width * 100));
        const y = Math.min(88, Math.max(6, startY + (ev.clientY - oy) / box.height * 100));
        st.style.setProperty("--x", x.toFixed(2));
        st.style.setProperty("--y", y.toFixed(2));
      };
      const up = () => {
        st.classList.remove("dragging");
        st.removeEventListener("pointermove", move);
        st.removeEventListener("pointerup", up);
        st.removeEventListener("pointercancel", up);
        layer.append(st); // dropped sticker goes on top, like in the app
        refresh(true);
      };
      st.addEventListener("pointermove", move);
      st.addEventListener("pointerup", up);
      st.addEventListener("pointercancel", up);
    });
    // arrow keys nudge, same as the app's editor
    st.addEventListener("keydown", (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d || screen.dataset.mode !== "edit") return;
      e.preventDefault();
      const step = e.shiftKey ? 5 : 1;
      st.style.setProperty("--x", parseFloat(st.style.getPropertyValue("--x")) + d[0] * step);
      st.style.setProperty("--y", parseFloat(st.style.getPropertyValue("--y")) + d[1] * step);
      refresh(true);
    });
  }

  // "Set as Wallpaper": the app chrome goes away and the Mac shows its desktop.
  const shutter = document.createElement("div");
  shutter.className = "shutter";
  screen.append(shutter);
  let toastTimer;
  screen.querySelector("[data-apply]").addEventListener("click", () => {
    screen.dataset.mode = "desktop";
    shutter.classList.remove("go"); void shutter.offsetWidth; shutter.classList.add("go");
    screen.classList.add("toasting");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => screen.classList.remove("toasting"), 2400);
  });
  screen.querySelector("[data-edit]").addEventListener("click", () => {
    screen.dataset.mode = "edit";
    screen.classList.remove("toasting");
  });
})();

/* ---------- before / after ---------- */
for (const box of document.querySelectorAll("[data-compare]")) {
  const input = box.querySelector("input");
  const set = () => box.style.setProperty("--pos", input.value + "%");
  input.addEventListener("input", set);
  set();
}

/* ---------- style lab ---------- */
(function lab() {
  const controls = document.querySelector("[data-lab]");
  if (!controls) return;
  const sticker = document.querySelector(".lab-sticker");
  const radius = document.querySelector("#outline [data-radius]");
  const kinds = controls.querySelectorAll("[data-kind]");
  kinds.forEach((b) => b.addEventListener("click", () => {
    kinds.forEach((o) => o.setAttribute("aria-checked", String(o === b)));
    sticker.dataset.kind = b.dataset.kind;
  }));
  const outline = controls.querySelector("[data-outline]");
  outline.addEventListener("input", () => radius.setAttribute("radius", outline.value));
  const shadow = controls.querySelector("[data-shadow]");
  shadow.addEventListener("change", () =>
    sticker.style.setProperty("--shadow", shadow.checked ? "drop-shadow(0 14px 14px rgba(0,0,0,.35))" : "drop-shadow(0 0 0 transparent)"));
  const flip = controls.querySelector("[data-flip]");
  flip.addEventListener("change", () => sticker.style.setProperty("--flip", flip.checked ? -1 : 1));
})();

/* ---------- scene palette swatches ---------- */
for (const scene of document.querySelectorAll("[data-variants]")) {
  const img = scene.querySelector(".shot img");
  const buttons = scene.querySelectorAll(".swatches button");
  buttons.forEach((b) => b.addEventListener("click", () => {
    buttons.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    img.style.opacity = 0;
    setTimeout(() => { img.src = b.dataset.src; img.onload = () => (img.style.opacity = 1); }, 200);
  }));
}

/* ---------- second display rotates through projects ---------- */
(function rotation() {
  const imgs = [...document.querySelectorAll(".rotate > img")];
  if (!imgs.length) return;
  let i = 0;
  imgs[0].classList.add("on");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(() => {
    imgs[i].classList.remove("on");
    i = (i + 1) % imgs.length;
    imgs[i].classList.add("on");
  }, 3200);
})();

/* ---------- notify forms ---------- */
for (const form of document.querySelectorAll("[data-notify]")) {
  const note = form.querySelector(".notify-note");
  const noteHTML = note.innerHTML;
  const button = form.querySelector("button");
  const input = form.querySelector("input[type=email]");

  const fail = (text) => {
    note.textContent = text;
    note.classList.add("error");
    button.disabled = false;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    note.classList.remove("error");
    note.innerHTML = noteHTML;
    if (!input.checkValidity()) return fail("That doesn't look like an email address.");
    if (!EO_FORM_ID) return fail("Sign-ups open soon. Please check back in a day or two.");

    button.disabled = true;
    let result;
    try {
      const res = await fetch(`https://eocampaign1.com/form/${EO_FORM_ID}`, {
        method: "POST", mode: "cors", cache: "no-cache", body: new FormData(form),
      });
      result = await res.json();
    } catch {
      return fail("Couldn't reach the sign-up service. Please try again in a moment.");
    }
    if (!result.success) {
      console.warn("EmailOctopus refused the sign-up:", result.error);
      return fail("EmailOctopus couldn't take that address. Please check it, or email sticta@proton.me.");
    }

    form.classList.add("done");
    const thanks = document.createElement("span");
    thanks.className = "thanks";
    thanks.textContent = "Almost there!";
    form.insertBefore(thanks, note);
    note.textContent = "Check your inbox and confirm your address. That's the only email until launch day.";
  });
}
