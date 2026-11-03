/* Fonctions partagées par les deux pages : thème, menu, section visible, apparitions. */
(function () {
  'use strict';

  /* Typographie française : espace insécable avant : ; ! ? » et après «, pour éviter un signe seul en début de ligne. */
  function typographie(texte) {
    return texte.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ');
  }

  /* Crée un élément. Le texte passe toujours par des noeuds texte, jamais par innerHTML. */
  function el(balise, attributs, ...enfants) {
    const noeud = document.createElement(balise);
    for (const [cle, valeur] of Object.entries(attributs || {})) {
      if (valeur === null || valeur === undefined || valeur === false) continue;
      if (cle === 'class') noeud.className = valeur;
      else noeud.setAttribute(cle, valeur === true ? '' : String(valeur));
    }
    for (const enfant of enfants.flat()) {
      if (enfant === null || enfant === undefined || enfant === false || enfant === '') continue;
      noeud.append(enfant instanceof Node ? enfant : document.createTextNode(typographie(String(enfant))));
    }
    return noeud;
  }

  async function chargerJSON(chemin) {
    const reponse = await fetch(chemin, { cache: 'no-cache' });
    if (!reponse.ok) throw new Error(`${chemin} : erreur ${reponse.status}`);
    return reponse.json();
  }

  function estRempli(valeur) {
    if (typeof valeur === 'string') return valeur.trim() !== '';
    if (Array.isArray(valeur)) return valeur.length > 0;
    return valeur !== null && valeur !== undefined;
  }

  /* Accepte uniquement les adresses http, https et mailto. */
  function urlSure(valeur) {
    if (!estRempli(valeur) || typeof valeur !== 'string') return null;
    try {
      const url = new URL(valeur, window.location.href);
      return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : null;
    } catch (e) {
      return null;
    }
  }

  function typeEtAnnee(projet) {
    return [projet.type, projet.annee].filter(estRempli).join(', ');
  }

  /* Classes Tailwind des éléments créés par les scripts. Les couleurs (accent, encre, doux...) viennent de css/style.css. */
  const styles = {
    lien: 'font-semibold text-accent underline decoration-accent/30 decoration-2 underline-offset-4 transition-colors hover:decoration-accent',
    bouton: 'inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-sur-accent transition-colors hover:bg-accent-fort',
    boutonSecondaire: 'inline-flex items-center rounded-full border border-trait-fort px-6 py-3 text-sm font-semibold text-encre transition-colors hover:border-accent hover:text-accent',
    etiquettes: 'etiquettes flex flex-wrap gap-1.5',
    etiquette: 'rounded-md border border-trait bg-fond px-2 py-1 font-mono text-[11px] leading-none text-doux',
    pastille: 'rounded-full bg-accent-doux px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide text-accent-texte uppercase',
    surtitre: 'font-mono text-sm text-accent',
    message: 'message text-doux'
  };

  const CATEGORIES = { mobile: 'Mobile', web: 'Web', automatisation: 'Automatisation', donnees: 'Données' };

  function numero(index) {
    return String(index + 1).padStart(2, '0');
  }

  function etiquettes(liste, libelle) {
    return el('ul', { class: styles.etiquettes, 'aria-label': libelle || null },
      liste.map((texte) => el('li', { class: styles.etiquette }, texte)));
  }

  /* github = null : code privé. github = "" : information manquante, rien n'est affiché. */
  function lienCode(projet, classes) {
    if (projet.github === null) return el('span', { class: 'code-prive text-sm font-medium text-doux' }, 'Code privé');
    const url = urlSure(projet.github);
    if (!url) return null;
    return el('a', { href: url, class: classes || styles.lien },
      'Code source', el('span', { class: 'sr-only' }, ` de ${projet.titre}`));
  }

  /* Thème clair ou sombre */

  function initialiserTheme() {
    const racine = document.documentElement;
    const systeme = window.matchMedia('(prefers-color-scheme: dark)');
    const bouton = document.querySelector('.bouton-theme');
    const etat = bouton && bouton.querySelector('.etat-theme');

    function themeSysteme() {
      return systeme.matches ? 'sombre' : 'clair';
    }

    function appliquer(theme) {
      racine.setAttribute('data-theme', theme);
      if (etat) etat.textContent = `, actuellement ${theme}`;
    }

    appliquer(racine.getAttribute('data-theme') || themeSysteme());

    if (bouton) {
      bouton.addEventListener('click', () => {
        const nouveau = racine.getAttribute('data-theme') === 'sombre' ? 'clair' : 'sombre';
        appliquer(nouveau);
        try {
          // Revenir au thème du système efface le choix enregistré.
          if (nouveau === themeSysteme()) localStorage.removeItem('theme');
          else localStorage.setItem('theme', nouveau);
        } catch (e) {}
      });
    }

    systeme.addEventListener('change', () => {
      let choix = null;
      try {
        choix = localStorage.getItem('theme');
      } catch (e) {}
      if (!choix) appliquer(themeSysteme());
    });
  }

  /* Menu replié sur téléphone */

  function initialiserMenu() {
    const bouton = document.querySelector('.bouton-menu');
    const menu = document.getElementById('menu-principal');
    if (!bouton || !menu) return;

    function fermer() {
      bouton.setAttribute('aria-expanded', 'false');
    }

    bouton.addEventListener('click', () => {
      const ouvert = bouton.getAttribute('aria-expanded') === 'true';
      bouton.setAttribute('aria-expanded', String(!ouvert));
    });
    menu.addEventListener('click', (evenement) => {
      if (evenement.target.closest('a')) fermer();
    });
    document.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && bouton.getAttribute('aria-expanded') === 'true') {
        fermer();
        bouton.focus();
      }
    });
    document.addEventListener('click', (evenement) => {
      if (!evenement.target.closest('.entete-site')) fermer();
    });
  }

  /* Indique dans la navigation la section affichée à l'écran. */

  function suivreSectionVisible() {
    const liens = Array.from(document.querySelectorAll('.menu a[href^="#"]'));
    const sections = liens
      .map((lien) => document.getElementById(lien.hash.slice(1)))
      .filter(Boolean);
    if (!sections.length) return;

    let enAttente = false;

    function mettreAJour() {
      enAttente = false;
      const ligne = window.innerHeight * 0.35;
      let active = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= ligne) active = section;
      }
      const enBas = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (enBas && window.scrollY > 0) active = sections[sections.length - 1];
      for (const lien of liens) {
        if (active && lien.hash === `#${active.id}`) lien.setAttribute('aria-current', 'true');
        else lien.removeAttribute('aria-current');
      }
    }

    function demander() {
      if (enAttente) return;
      enAttente = true;
      window.requestAnimationFrame(mettreAJour);
    }

    window.addEventListener('scroll', demander, { passive: true });
    window.addEventListener('resize', demander);
    mettreAJour();
  }

  /* Apparition discrète des sections. Le CSS ne masque rien si l'utilisateur réduit les animations. */

  let observateur = null;

  function observerApparitions(racine) {
    const elements = (racine || document).querySelectorAll('.apparition:not(.visible)');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('visible'));
      return;
    }
    if (!observateur) {
      observateur = new IntersectionObserver((entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            entree.target.classList.add('visible');
            observateur.unobserve(entree.target);
          }
        }
      }, { rootMargin: '0px 0px -8% 0px' });
    }
    elements.forEach((element) => observateur.observe(element));
  }

  /* Lumière qui suit le curseur sur les éléments .projecteur (désactivée en CSS sur écran tactile
     et si l'utilisateur réduit les animations). */

  function suivreCurseur() {
    document.addEventListener('pointermove', (evenement) => {
      if (evenement.pointerType !== 'mouse') return;
      const cible = evenement.target.closest && evenement.target.closest('.projecteur');
      if (!cible) return;
      const cadre = cible.getBoundingClientRect();
      cible.style.setProperty('--x', `${evenement.clientX - cadre.left}px`);
      cible.style.setProperty('--y', `${evenement.clientY - cadre.top}px`);
    }, { passive: true });
  }

  /* Défilement : progression de lecture (0 à 1), distance parcourue (limitée à 1000 px) et état « défilé »
     de l'en-tête. Les effets eux-mêmes sont dans css/style.css. */

  function suivreDefilement() {
    const racine = document.documentElement;
    let enAttente = false;

    function mettreAJour() {
      enAttente = false;
      const position = window.scrollY;
      const maximum = racine.scrollHeight - window.innerHeight;
      racine.style.setProperty('--progression', maximum > 0 ? (position / maximum).toFixed(4) : '0');
      racine.style.setProperty('--defilement', String(Math.min(Math.round(position), 1000)));
      racine.classList.toggle('defile', position > 8);
    }

    window.addEventListener('scroll', () => {
      if (enAttente) return;
      enAttente = true;
      window.requestAnimationFrame(mettreAJour);
    }, { passive: true });
    window.addEventListener('resize', mettreAJour);
    mettreAJour();
  }

  initialiserTheme();
  initialiserMenu();
  suivreSectionVisible();
  observerApparitions(document);
  suivreCurseur();
  suivreDefilement();

  window.Portfolio = {
    el, typographie, styles, etiquettes, CATEGORIES, numero,
    chargerJSON, estRempli, urlSure, typeEtAnnee, lienCode, observerApparitions
  };
})();
