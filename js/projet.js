/* Page de détail : projet.html?id=identifiant. Toutes les informations viennent de data/projets.json. */
(function () {
  'use strict';

  const { el, typographie, styles, etiquettes, CATEGORIES, numero, chargerJSON, estRempli, urlSure, typeEtAnnee, lienCode, observerApparitions } = window.Portfolio;

  const article = document.getElementById('projet');
  const identifiant = new URLSearchParams(window.location.search).get('id');
  const MESSAGE_VIDEO_ABSENTE = "La vidéo de démonstration n'est pas encore disponible.";

  function lienRetour() {
    return el('a', { href: 'index.html#realisations', class: styles.lien }, 'Retour aux réalisations');
  }

  /* Les sections sont numérotées dans l'ordre où elles apparaissent (une section vide n'est pas affichée). */
  let compteurSections = 0;

  function section(cle, titre, ...contenu) {
    const rang = numero(compteurSections++);
    return el('section', { class: 'projet-section apparition mt-20', 'aria-labelledby': `titre-${cle}` },
      el('div', { class: 'flex items-baseline gap-4 border-b border-trait pb-4' },
        el('span', { class: 'font-mono text-xs text-accent', 'aria-hidden': 'true' }, rang),
        el('h2', { id: `titre-${cle}`, class: 'text-2xl font-bold tracking-tight text-encre sm:text-3xl' }, titre)
      ),
      el('div', { class: 'mt-8' }, ...contenu)
    );
  }

  const CARTE = 'rounded-2xl border border-trait bg-surface p-6 sm:p-8';

  function paragraphe(texte) {
    return el('p', { class: 'leading-relaxed text-encre' }, texte);
  }

  function blocTexte(titre, texte) {
    return el('div', { class: CARTE },
      el('h3', { class: 'font-mono text-xs tracking-wider text-accent uppercase' }, titre),
      el('p', { class: 'mt-3 leading-relaxed text-encre' }, texte)
    );
  }

  function definirMeta(selecteur, valeur) {
    const balise = document.querySelector(selecteur);
    if (balise && estRempli(valeur)) balise.setAttribute('content', valeur);
  }

  function mettreAJourMeta(projet) {
    const titre = `${projet.titre}, réalisation de Kouame Marius`;
    document.title = titre;
    definirMeta('meta[name="description"]', projet.contexte);
    definirMeta('meta[property="og:title"]', titre);
    definirMeta('meta[property="og:description"]', projet.contexte);
    definirMeta('meta[property="og:image"]', projet.couverture);
  }

  /* Vidéo */

  function idYoutube(source) {
    if (/^[\w-]{11}$/.test(source)) return source;
    const trouve = source.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    return trouve ? trouve[1] : null;
  }

  function idVimeo(source) {
    if (/^\d+$/.test(source)) return source;
    const trouve = source.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return trouve ? trouve[1] : null;
  }

  function videoAbsente(cadre) {
    cadre.replaceChildren(el('p', {
      class: 'video-absente absolute inset-0 flex items-center justify-center p-6 text-center text-doux'
    }, MESSAGE_VIDEO_ABSENTE));
  }

  function integration(adresse, titre) {
    return el('iframe', {
      class: 'h-full w-full border-0',
      src: adresse,
      title: `Vidéo de démonstration de ${titre}`,
      loading: 'lazy',
      allow: 'encrypted-media; picture-in-picture; fullscreen',
      allowfullscreen: true,
      referrerpolicy: 'strict-origin-when-cross-origin'
    });
  }

  /* Aucun attribut autoplay et aucun appel à play() : la vidéo démarre seulement si le visiteur la lance. */
  function creerVideo(video, titre) {
    const cadre = el('div', { class: 'video-cadre relative aspect-video overflow-hidden rounded-2xl border border-trait bg-media' });
    const source = String(video.source || '').trim();

    if (video.type === 'youtube') {
      const id = idYoutube(source);
      if (id) cadre.append(integration(`https://www.youtube-nocookie.com/embed/${id}?rel=0`, titre));
      else videoAbsente(cadre);
      return cadre;
    }

    if (video.type === 'vimeo') {
      const id = idVimeo(source);
      if (id) cadre.append(integration(`https://player.vimeo.com/video/${id}?dnt=1`, titre));
      else videoAbsente(cadre);
      return cadre;
    }

    if (!source) {
      videoAbsente(cadre);
      return cadre;
    }

    const lecteur = el('video', {
      class: 'h-full w-full bg-black',
      controls: true,
      preload: 'metadata',
      playsinline: true,
      poster: estRempli(video.poster) ? video.poster : null,
      'aria-label': `Vidéo de démonstration de ${titre}`
    }, 'Votre navigateur ne peut pas lire cette vidéo.');
    lecteur.addEventListener('error', () => videoAbsente(cadre));

    // On vérifie d'abord que le fichier existe, pour afficher le message sans attendre une erreur du lecteur.
    fetch(source, { method: 'HEAD' })
      .then((reponse) => {
        if (!reponse.ok) throw new Error(String(reponse.status));
        lecteur.src = source;
        cadre.append(lecteur);
      })
      .catch(() => videoAbsente(cadre));

    return cadre;
  }

  /* Galerie et visionneuse */

  function texteAlternatif(image, index, titre) {
    return estRempli(image.legende) ? image.legende : `${titre}, image ${index + 1} de la galerie`;
  }

  function creerGalerie(images, titre) {
    const visionneuse = document.getElementById('visionneuse');
    const imageGrande = visionneuse.querySelector('.visionneuse-image');
    const legende = visionneuse.querySelector('.visionneuse-legende');
    const compteur = visionneuse.querySelector('.visionneuse-compteur');
    const precedent = visionneuse.querySelector('[data-action="precedent"]');
    const suivant = visionneuse.querySelector('[data-action="suivant"]');
    const fermer = visionneuse.querySelector('[data-action="fermer"]');
    let courant = 0;
    let declencheur = null;

    function afficher(index) {
      courant = (index + images.length) % images.length;
      const image = images[courant];
      imageGrande.src = image.fichier;
      imageGrande.alt = texteAlternatif(image, courant, titre);
      legende.textContent = typographie(image.legende || '');
      legende.hidden = !estRempli(image.legende);
      compteur.textContent = `Image ${courant + 1} sur ${images.length}`;
    }

    function ouvrir(index, bouton) {
      declencheur = bouton;
      afficher(index);
      visionneuse.showModal();
      fermer.focus();
    }

    precedent.hidden = suivant.hidden = images.length < 2;
    precedent.addEventListener('click', () => afficher(courant - 1));
    suivant.addEventListener('click', () => afficher(courant + 1));
    fermer.addEventListener('click', () => visionneuse.close());

    // Échap ferme la boîte de dialogue nativement ; les flèches changent d'image.
    visionneuse.addEventListener('keydown', (evenement) => {
      if (images.length < 2) return;
      if (evenement.key === 'ArrowLeft') {
        evenement.preventDefault();
        afficher(courant - 1);
      } else if (evenement.key === 'ArrowRight') {
        evenement.preventDefault();
        afficher(courant + 1);
      }
    });

    // Un clic en dehors de l'image et des boutons ferme la visionneuse.
    visionneuse.addEventListener('click', (evenement) => {
      if (evenement.target === visionneuse || evenement.target.classList.contains('visionneuse-scene')) {
        visionneuse.close();
      }
    });

    visionneuse.addEventListener('close', () => {
      if (declencheur) declencheur.focus();
    });

    // La classe galerie-portrait (ajoutée plus bas) resserre les colonnes et allonge les miniatures.
    const liste = el('ul', {
      class: 'galerie grid grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] gap-5 [&.galerie-portrait]:grid-cols-[repeat(auto-fill,minmax(min(170px,100%),1fr))]'
    }, images.map((image, index) => {
      const bouton = el('button', {
        type: 'button',
        class: 'galerie-bouton block w-full cursor-zoom-in overflow-hidden rounded-xl border border-trait bg-media transition-colors hover:border-accent'
      },
        el('span', { class: 'sr-only' }, "Agrandir l'image : "),
        el('img', {
          class: 'aspect-[4/3] w-full object-contain in-[.galerie-portrait]:aspect-[1/2]',
          src: image.fichier,
          alt: texteAlternatif(image, index, titre),
          loading: 'lazy',
          decoding: 'async'
        })
      );
      bouton.addEventListener('click', () => ouvrir(index, bouton));
      return el('li', {},
        el('figure', {},
          bouton,
          estRempli(image.legende) && el('figcaption', {
            class: 'mt-2 text-sm leading-snug text-doux in-[.galerie-portrait]:text-[13px]'
          }, image.legende)
        )
      );
    }));

    // Des captures de téléphone (plus hautes que larges) reçoivent des miniatures plus étroites.
    const sonde = new Image();
    sonde.addEventListener('load', () => {
      if (sonde.naturalHeight > sonde.naturalWidth) liste.classList.add('galerie-portrait');
    });
    sonde.src = images[0].fichier;

    return liste;
  }

  /* Construction de la page, dans l'ordre demandé */

  function construire(projet) {
    const elements = [];

    // Fiche : Rôle et Statut côte à côte, Technologies sur toute la largeur.
    const fiche = [];
    if (estRempli(projet.role)) fiche.push(['Rôle', projet.role, false]);
    if (estRempli(projet.statut)) fiche.push(['Statut', projet.statut, false]);
    if (estRempli(projet.technologies)) fiche.push(['Technologies', etiquettes(projet.technologies), true]);

    // Effet d'entrée (css/style.css) : chaque élément de l'en-tête apparaît après le précédent.
    const entree = (ordre) => ({ style: `--ordre: ${ordre}` });

    elements.push(el('header', {},
      el('a', { ...entree(0), href: 'index.html#realisations', class: 'entree inline-block font-mono text-sm text-doux transition-colors hover:text-accent' }, 'Réalisations'),
      el('h1', { ...entree(1), class: 'entree mt-5 text-4xl leading-[1.02] font-extrabold tracking-[-0.035em] text-encre sm:text-6xl' }, projet.titre),
      el('p', { ...entree(2), class: 'entree meta mt-6 flex flex-wrap items-center gap-x-3 gap-y-2' },
        CATEGORIES[projet.categorie] && el('span', { class: styles.pastille }, CATEGORIES[projet.categorie]),
        el('span', { class: 'font-mono text-[13px] text-doux' }, typeEtAnnee(projet))
      ),
      estRempli(projet.resume) && el('p', { ...entree(3), class: 'entree projet-resume mt-8 max-w-3xl text-lg leading-relaxed text-doux sm:text-xl' }, projet.resume),
      fiche.length > 0 && el('dl', { ...entree(4), class: 'entree fiche mt-10 grid gap-4 sm:grid-cols-2' },
        fiche.map(([libelle, valeur, large]) =>
          el('div', { class: `rounded-2xl border border-trait bg-surface/80 p-5 backdrop-blur${large ? ' sm:col-span-2' : ''}` },
            el('dt', { class: 'font-mono text-[11px] tracking-wider text-doux uppercase' }, libelle),
            el('dd', { class: 'mt-2 font-medium text-encre' }, valeur)
          )))
    ));

    if (estRempli(projet.fonctionnalites)) {
      elements.push(section('fonctionnalites', 'Fonctionnalités principales',
        el('ul', { class: 'liste-lignes grid gap-3 sm:grid-cols-2' },
          projet.fonctionnalites.map((texte, index) =>
            el('li', { class: 'flex gap-4 rounded-2xl border border-trait bg-surface p-5' },
              el('span', { class: 'font-mono text-xs text-accent', 'aria-hidden': 'true' }, numero(index)),
              el('span', { class: 'leading-relaxed text-encre' }, texte)
            )))));
    }

    if (projet.video && (estRempli(projet.video.source) || projet.video.type === 'fichier')) {
      elements.push(section('video', 'Vidéo de démonstration', creerVideo(projet.video, projet.titre)));
    }

    if (estRempli(projet.galerie)) {
      elements.push(section('galerie', 'Galerie', creerGalerie(projet.galerie, projet.titre)));
    }

    if (estRempli(projet.choixTechniques)) {
      elements.push(section('choix', 'Choix techniques', el('div', { class: CARTE }, paragraphe(projet.choixTechniques))));
    }

    if (estRempli(projet.difficulte) || estRempli(projet.solution)) {
      elements.push(section('difficulte', 'Difficulté rencontrée et solution',
        el('div', { class: 'grid gap-4 md:grid-cols-2' },
          estRempli(projet.difficulte) && blocTexte('Difficulté', projet.difficulte),
          estRempli(projet.solution) && blocTexte('Solution', projet.solution)
        )
      ));
    }

    const demo = urlSure(projet.demo);
    elements.push(el('nav', {
      class: 'projet-liens mt-20 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-trait bg-surface p-6 sm:p-8',
      'aria-label': 'Liens du projet'
    },
      lienCode(projet, `bouton ${styles.bouton}`),
      demo && el('a', { href: demo, class: `bouton bouton-secondaire ${styles.boutonSecondaire}` }, 'Voir la démo'),
      lienRetour()
    ));

    return elements;
  }

  function afficherMessage(titre, texte) {
    document.title = `${titre}, Kouame Marius`;
    article.replaceChildren(
      el('h1', { class: 'text-4xl font-extrabold tracking-[-0.035em] text-encre sm:text-6xl' }, titre),
      el('p', { class: 'projet-resume mt-6 text-lg leading-relaxed text-doux' }, texte),
      el('p', { class: 'projet-liens mt-16 rounded-2xl border border-trait bg-surface p-6' }, lienRetour())
    );
  }

  async function demarrer() {
    let projets;
    try {
      projets = await chargerJSON('data/projets.json');
    } catch (erreur) {
      console.error('Chargement impossible de data/projets.json. En local, ouvrez le site avec un serveur (voir README.md).', erreur);
      afficherMessage('Chargement impossible', 'Les informations de ce projet ne peuvent pas être chargées pour le moment.');
      return;
    }

    const projet = projets.find((element) => element.id === identifiant);
    if (!projet) {
      afficherMessage('Projet introuvable', "Aucune réalisation ne correspond à cette adresse.");
      return;
    }

    mettreAJourMeta(projet);
    article.replaceChildren(...construire(projet));
    article.removeAttribute('aria-busy');
    observerApparitions(article);
  }

  demarrer();
})();
