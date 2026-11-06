(() => {
  const slides = [
    "Portada",
    "El problema",
    "El costo",
    "Validación",
    "La propuesta",
    "Cómo funciona",
    "Demo",
    "Alcance",
    "Cómo lo construimos",
    "Resultados",
    "Arquitectura",
    "Viabilidad",
    "Cierre",
    "Equipo",
    "Cierre · Parity"
  ];

  const image = document.querySelector("#slide-image");
  const caption = document.querySelector("#slide-caption");
  const frame = document.querySelector("#slide-frame");
  const errorMessage = document.querySelector("#image-error");
  const currentLabel = document.querySelector("#current-slide");
  const totalLabel = document.querySelector("#total-slides");
  const progress = document.querySelector("#progress");
  const progressBar = document.querySelector("#progress-bar");
  const status = document.querySelector("#status-message");
  const previous = document.querySelector("#previous");
  const next = document.querySelector("#next");
  const dialog = document.querySelector("#slide-index");
  const grid = document.querySelector("#slide-grid");
  let current = readSlideFromHash();

  totalLabel.textContent = String(slides.length).padStart(2, "0");
  progress.setAttribute("aria-valuemax", String(slides.length));

  function readSlideFromHash() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    const requested = match ? Number(match[1]) : 1;
    return Number.isInteger(requested) && requested >= 1 && requested <= slides.length ? requested : 1;
  }

  function renderIndex() {
    const fragment = document.createDocumentFragment();
    slides.forEach((title, index) => {
      const number = index + 1;
      const button = document.createElement("button");
      button.className = "slide-link";
      button.type = "button";
      button.dataset.slide = String(number);
      button.setAttribute("aria-label", `Ir a la diapositiva ${number}: ${title}`);
      button.innerHTML = `<img src="slides/slide-${String(number).padStart(2, "0")}.png" alt="" loading="lazy"><span><b>${String(number).padStart(2, "0")}</b>${title}</span>`;
      fragment.append(button);
    });
    grid.replaceChildren(fragment);
  }

  function showSlide(number, announce = true) {
    current = Math.min(slides.length, Math.max(1, number));
    const numberText = String(current).padStart(2, "0");
    const title = slides[current - 1];
    image.src = `slides/slide-${numberText}.png`;
    image.alt = `Diapositiva ${current} de ${slides.length}: ${title}`;
    caption.textContent = `Diapositiva ${current} de ${slides.length}: ${title}`;
    currentLabel.textContent = numberText;
    progressBar.style.width = `${(current / slides.length) * 100}%`;
    progress.setAttribute("aria-valuenow", String(current));
    previous.disabled = current === 1;
    next.disabled = current === slides.length;
    grid.querySelectorAll(".slide-link").forEach((button) => {
      const selected = Number(button.dataset.slide) === current;
      if (selected) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    errorMessage.hidden = true;
    if (window.location.hash !== `#slide-${current}`) {
      window.history.replaceState(null, "", `#slide-${current}`);
    }
    if (announce) status.textContent = `Diapositiva ${current} de ${slides.length}: ${title}`;
  }

  function moveBy(amount) {
    showSlide(current + amount);
  }

  renderIndex();
  showSlide(current, false);

  image.addEventListener("error", () => {
    errorMessage.hidden = false;
  });
  image.addEventListener("load", () => {
    errorMessage.hidden = true;
  });
  previous.addEventListener("click", () => moveBy(-1));
  next.addEventListener("click", () => moveBy(1));
  document.querySelector("#open-index").addEventListener("click", () => dialog.showModal());
  document.querySelector("#close-index").addEventListener("click", () => dialog.close());
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-slide]");
    if (!button) return;
    showSlide(Number(button.dataset.slide));
    dialog.close();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.querySelector("#fullscreen").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frame.requestFullscreen();
    } catch (error) {
      status.textContent = `No se pudo activar la pantalla completa: ${error.message}`;
    }
  });

  window.addEventListener("hashchange", () => showSlide(readSlideFromHash(), false));
  window.addEventListener("keydown", (event) => {
    if (dialog.open) {
      if (event.key === "Escape") dialog.close();
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      moveBy(1);
    } else if (event.key === "ArrowLeft" || event.key === "PageUp" || event.key === "Backspace") {
      event.preventDefault();
      moveBy(-1);
    } else if (event.key === "Home") {
      showSlide(1);
    } else if (event.key === "End") {
      showSlide(slides.length);
    } else if (event.key.toLowerCase() === "i") {
      dialog.showModal();
    } else if (event.key.toLowerCase() === "f") {
      document.querySelector("#fullscreen").click();
    }
  });

  let touchStartX = null;
  frame.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  frame.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 55) moveBy(distance < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

})();
