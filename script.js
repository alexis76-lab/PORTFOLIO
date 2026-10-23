document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Le compteur suit automatiquement le nombre de cartes projet présentes sur la page.
  const projectCount = document.querySelector('[data-count="projects"]');
  if (projectCount) {
    projectCount.textContent = document.querySelectorAll("#projets .project-card").length;
  }

  const faders = document.querySelectorAll(".fade-in");
  if (faders.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    // Pas de seuil en pourcentage : une section plus haute que l'écran (ex. projets sur mobile) n'apparaîtrait jamais.
    }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });

    faders.forEach(fader => observer.observe(fader));
  }

  // Met en évidence dans le menu la section actuellement à l'écran.
  const navLinks = document.querySelectorAll('nav ul a[href^="#"]');
  if (navLinks.length) {
    const linkFor = new Map();
    navLinks.forEach(link => {
      const section = document.querySelector(link.getAttribute("href"));
      if (section) {
        linkFor.set(section, link);
      }
    });

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
          });
          const link = linkFor.get(entry.target);
          link.classList.add("active");
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    linkFor.forEach((link, section) => sectionObserver.observe(section));
  }

  const menuBtn = document.querySelector(".menu-btn");
  const navUl = document.querySelector("nav ul");
  if (menuBtn && navUl) {
    menuBtn.addEventListener("click", () => {
      navUl.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", navUl.classList.contains("open") ? "true" : "false");
    });
  }

  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    // Le th\u00E8me initial est d\u00E9j\u00E0 pos\u00E9 sur <html> par le script dans <head> (pas de flash au chargement).
    const root = document.documentElement;
    const systemLight = window.matchMedia("(prefers-color-scheme: light)");
    const sunIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
    const moonIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>';

    const readSavedTheme = () => {
      try {
        return localStorage.getItem("theme");
      } catch (error) {
        return null;
      }
    };

    const applyTheme = theme => {
      root.dataset.theme = theme;
      const isLight = theme === "light";
      themeToggle.innerHTML = isLight ? moonIcon : sunIcon;
      themeToggle.setAttribute("aria-label", isLight ? "Passer en mode sombre" : "Passer en mode clair");
      themeToggle.setAttribute("title", isLight ? "Passer en mode sombre" : "Passer en mode clair");
      themeToggle.setAttribute("aria-pressed", isLight ? "true" : "false");
    };

    applyTheme(root.dataset.theme === "light" ? "light" : "dark");

    themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        // Stockage indisponible (navigation priv\u00E9e) : le th\u00E8me reste actif pour la page en cours.
      }
    });

    // Tant que l'utilisateur n'a rien choisi, on suit le th\u00E8me du syst\u00E8me.
    systemLight.addEventListener("change", event => {
      if (!readSavedTheme()) {
        applyTheme(event.matches ? "light" : "dark");
      }
    });
  }

  const scrollBtn = document.getElementById("scrollTopBtn");
  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formStatus = document.createElement("p");
    formStatus.className = "form-status";
    formStatus.setAttribute("role", "status");
    formStatus.setAttribute("aria-live", "polite");
    contactForm.appendChild(formStatus);

    contactForm.addEventListener("submit", async event => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const originalButtonText = submitButton?.textContent || "Envoyer";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Envoi...";
      }

      formStatus.textContent = "";
      formStatus.className = "form-status";

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method || "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'envoi du message.");
        }

        contactForm.reset();
        formStatus.textContent = "Message envoyé avec succès.";
        formStatus.classList.add("success");
      } catch {
        formStatus.textContent = "Impossible d'envoyer le message pour le moment.";
        formStatus.classList.add("error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }

  // Captures pas encore fournies : on affiche un emplacement réservé (nom du fichier attendu) au lieu d'une image cassée.
  document.querySelectorAll(".shot-frame img").forEach(image => {
    const markMissing = () => image.parentElement.classList.add("is-missing");
    if (image.complete && image.naturalWidth === 0) {
      markMissing();
    } else {
      image.addEventListener("error", markMissing);
    }
  });

  const zoomableImages = document.querySelectorAll(".project-image, .project-gallery img, .shot .shot-frame img");
  if (zoomableImages.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "image-lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <div class="image-lightbox-dialog">
        <button class="image-lightbox-close" type="button" aria-label="Fermer l'image">&times;</button>
        <img src="" alt="">
        <p class="image-lightbox-caption"></p>
      </div>
    `;

    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector("img");
    const lightboxCaption = lightbox.querySelector(".image-lightbox-caption");
    const lightboxClose = lightbox.querySelector(".image-lightbox-close");

    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    const openLightbox = image => {
      const figure = image.closest("figure");
      const caption = figure?.querySelector("figcaption")?.textContent?.trim() || image.alt || "";

      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || "Image agrandie";
      lightboxCaption.textContent = caption;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    zoomableImages.forEach(image => {
      image.addEventListener("click", () => openLightbox(image));
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && lightbox.classList.contains("open")) {
        closeLightbox();
      }
    });
  }
});
