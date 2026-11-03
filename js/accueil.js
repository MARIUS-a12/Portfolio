/* Page d'accueil : bandeau des technologies, cartes des réalisations, filtre, compétences, parcours et contact. */
(function () {
  'use strict';

  const { el, styles, etiquettes, CATEGORIES, numero, chargerJSON, estRempli, urlSure, typeEtAnnee, lienCode, observerApparitions } = window.Portfolio;

  // Animation des cartes (voir css/style.css) : apparition, élévation et liseré vert au survol.
  const ANIMATION_CARTE = 'apparition carte-anim hover:border-accent/50 hover:shadow-[0_24px_60px_-34px_var(--accent)]';

  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');

  function delai(ordre) {
    return `--delai: ${Math.min(ordre, 5) * 70}ms`;
  }

  const grille = document.getElementById('grille-projets');
  const compte = document.getElementById('compte-projets');
  const boutonsFiltre = Array.from(document.querySelectorAll('.filtre button'));

  /* Bandeau : toutes les technologies citées dans les réalisations, sans doublon.
     La liste est écrite deux fois pour un défilement continu ; la copie est masquée aux lecteurs d'écran. */

  function afficherBandeau(projets) {
    const liste = document.getElementById('bandeau-technologies');
    const bandeau = liste.closest('.bandeau');
    const vues = new Set();
    const technologies = [];
    for (const projet of projets) {
      for (const techno of projet.technologies || []) {
        const cle = techno.toLowerCase();
        if (!vues.has(cle)) {
          vues.add(cle);
          technologies.push(techno);
        }
      }
    }
    const element = (techno, copie) => el('li', {
      class: 'shrink-0 px-5 font-mono text-sm whitespace-nowrap text-doux',
      'aria-hidden': copie ? 'true' : null
    }, techno);
    liste.replaceChildren(...technologies.map((t) => element(t, false)), ...technologies.map((t) => element(t, true)));

    const pause = bandeau.querySelector('.bouton-pause');
    pause.addEventListener('click', () => {
      const enPause = bandeau.classList.toggle('en-pause');
      pause.textContent = enPause ? 'Lecture' : 'Pause';
    });
  }

  /* Cartes */

  function ligne(libelle, valeur) {
    return el('p', { class: 'text-sm leading-relaxed text-doux' },
      el('span', { class: 'mr-2 font-mono text-[11px] tracking-wider text-doux uppercase' }, libelle), valeur);
  }

  function creerCarte(projet, index) {
    const lienProjet = `projet.html?id=${encodeURIComponent(projet.id)}`;
    // La classe vedette (posée par filtrer) étend la première carte visible sur toute la largeur.
    return el('article', {
      class: `carte projecteur group relative flex flex-col overflow-hidden rounded-2xl border border-trait bg-surface ${ANIMATION_CARTE} md:[&.vedette]:col-span-2 md:[&.vedette]:grid md:[&.vedette]:grid-cols-[1.25fr_1fr]`,
      'data-categorie': projet.categorie
    },
      el('div', { class: 'relative overflow-hidden border-b border-trait bg-media md:in-[.vedette]:border-r md:in-[.vedette]:border-b-0' },
        el('img', {
          class: 'carte-image aspect-video w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:in-[.vedette]:h-full md:in-[.vedette]:aspect-auto',
          src: projet.couverture,
          alt: `Aperçu du projet ${projet.titre}`,
          width: 1600,
          height: 900,
          loading: 'lazy',
          decoding: 'async'
        }),
        CATEGORIES[projet.categorie] && el('span', {
          class: 'absolute top-3 left-3 rounded-full border border-trait bg-fond/85 px-2.5 py-1 font-mono text-[11px] tracking-wider text-encre uppercase backdrop-blur'
        }, CATEGORIES[projet.categorie])
      ),
      el('div', { class: 'carte-corps flex flex-1 flex-col gap-4 p-6 sm:p-7 md:in-[.vedette]:justify-center md:in-[.vedette]:p-10' },
        el('div', { class: 'flex items-baseline justify-between gap-4' },
          el('h3', { class: 'carte-titre text-2xl font-bold tracking-tight text-encre transition-colors group-hover:text-accent' }, projet.titre),
          el('span', { class: 'font-mono text-xs text-doux', 'aria-hidden': 'true' }, numero(index))
        ),
        el('p', { class: 'meta -mt-2 font-mono text-[13px] text-doux' }, typeEtAnnee(projet)),
        estRempli(projet.contexte) && el('p', { class: 'leading-relaxed text-encre' }, projet.contexte),
        estRempli(projet.role) && ligne('Rôle', projet.role),
        estRempli(projet.technologies) && etiquettes(projet.technologies, 'Technologies'),
        estRempli(projet.statut) && ligne('Statut', projet.statut),
        el('p', { class: 'carte-liens mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-trait pt-5 text-sm' },
          el('a', { href: lienProjet, class: styles.lien },
            'Voir le projet', el('span', { class: 'sr-only' }, ` ${projet.titre}`)),
          lienCode(projet)
        )
      )
    );
  }

  function filtrer(categorie, rejouer) {
    if (!boutonsFiltre.some((bouton) => bouton.dataset.categorie === categorie)) categorie = 'tout';
    let visibles = 0;
    for (const carte of grille.querySelectorAll('.carte')) {
      const affichee = categorie === 'tout' || carte.dataset.categorie === categorie;
      carte.hidden = !affichee;
      carte.classList.toggle('vedette', affichee && visibles === 0);
      if (affichee) {
        carte.setAttribute('style', delai(visibles));
        // Après un clic sur le filtre, les cartes affichées rejouent leur apparition, l'une après l'autre.
        if (rejouer && !mouvementReduit.matches) {
          carte.classList.add('visible');
          carte.animate(
            [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
            { duration: 200, delay: Math.min(visibles, 5) * 70, easing: 'ease-out', fill: 'backwards' }
          );
        }
        visibles += 1;
      }
    }
    for (const bouton of boutonsFiltre) {
      bouton.setAttribute('aria-pressed', String(bouton.dataset.categorie === categorie));
    }
    if (visibles === 0) compte.textContent = 'Aucune réalisation dans cette catégorie.';
    else if (visibles === 1) compte.textContent = '1 réalisation affichée';
    else compte.textContent = `${visibles} réalisations affichées`;
    try {
      // Le filtre est conservé pendant la visite, pour le retour depuis une page de détail.
      sessionStorage.setItem('filtre', categorie);
    } catch (e) {}
  }

  function afficherProjets(projets) {
    grille.replaceChildren(...projets.map(creerCarte));
    let filtre = 'tout';
    try {
      filtre = sessionStorage.getItem('filtre') || 'tout';
    } catch (e) {}
    filtrer(filtre, false);
    observerApparitions(grille);
    for (const bouton of boutonsFiltre) {
      bouton.addEventListener('click', () => filtrer(bouton.dataset.categorie, true));
    }
  }

  /* Compétences, parcours, contact */

  function afficherCompetences(blocs) {
    const conteneur = document.getElementById('liste-competences');
    conteneur.replaceChildren(...blocs.map((bloc, index) =>
      el('div', { class: `bloc projecteur relative overflow-hidden rounded-2xl border border-trait bg-surface p-7 ${ANIMATION_CARTE}`, style: delai(index) },
        el('p', { class: 'font-mono text-xs text-doux', 'aria-hidden': 'true' }, numero(index)),
        el('h3', { class: 'mt-4 text-xl font-bold tracking-tight text-encre' }, bloc.domaine),
        el('ul', { class: 'mt-5 flex flex-wrap gap-2' }, (bloc.outils || []).map((outil) =>
          el('li', { class: 'rounded-full border border-trait bg-fond px-3 py-1 text-sm text-encre' }, outil)))
      )
    ));
  }

  function afficherParcours(etapes) {
    const liste = document.getElementById('liste-parcours');
    liste.replaceChildren(...etapes.map((etape) =>
      el('li', { class: 'grid gap-3 border-t border-trait py-9 last:border-b md:grid-cols-[240px_1fr] md:gap-10' },
        el('div', {},
          el('h3', { class: 'text-2xl font-bold tracking-tight text-encre' }, etape.intitule),
          estRempli(etape.periode) && el('p', { class: 'meta mt-1 font-mono text-[13px] text-doux' }, etape.periode),
          estRempli(etape.description) && el('p', { class: 'mt-4 max-w-2xl leading-relaxed text-doux' }, etape.description)
        ),
        // Le lieu s'affiche à gauche (en premier) mais vient après l'intitulé pour les lecteurs d'écran.
        estRempli(etape.lieu) && el('p', { class: 'order-first font-mono text-sm text-accent md:pt-2' }, etape.lieu)
      )
    ));
  }

  function texteLisible(url) {
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }

  /* Chaque coordonnée est une tuile ; un lien couvre toute la tuile. */
  function tuile(libelle, valeur, adresse) {
    const contenu = adresse
      ? el('a', { href: adresse, class: 'font-semibold text-encre transition-colors after:absolute after:inset-0 group-hover:text-accent' }, valeur)
      : valeur;
    return el('div', {
      class: `group relative rounded-2xl border border-trait bg-fond/70 p-5 backdrop-blur transition-colors sm:p-6${adresse ? ' hover:border-accent' : ''}`
    },
      el('dt', { class: 'font-mono text-[11px] tracking-wider text-doux uppercase' }, libelle),
      el('dd', { class: 'mt-2 text-lg break-words text-encre sm:text-xl' }, contenu)
    );
  }

  function afficherContact(contact) {
    const liste = document.getElementById('liste-contact');
    const tuiles = [];
    if (estRempli(contact.email)) {
      const adresse = contact.email.trim();
      tuiles.push(tuile('E-mail', adresse, `mailto:${adresse}`));
    }
    // Numéros au format international (+225...) : tel: garde le +, wa.me n'accepte que les chiffres.
    if (estRempli(contact.telephone)) {
      const numeroTel = contact.telephone.trim();
      tuiles.push(tuile('Téléphone', numeroTel, `tel:${numeroTel.replace(/[^\d+]/g, '')}`));
    }
    if (estRempli(contact.whatsapp)) {
      tuiles.push(tuile('WhatsApp', 'Écrire sur WhatsApp', `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`));
    }
    if (estRempli(contact.adresse)) tuiles.push(tuile('Adresse', contact.adresse.trim()));
    const linkedin = urlSure(contact.linkedin);
    if (linkedin) tuiles.push(tuile('LinkedIn', texteLisible(linkedin), linkedin));
    const github = urlSure(contact.github);
    if (github) tuiles.push(tuile('GitHub', texteLisible(github), github));
    liste.replaceChildren(...tuiles);
  }

  async function demarrer() {
    const [projets, profil] = await Promise.allSettled([
      chargerJSON('data/projets.json'),
      chargerJSON('data/profil.json')
    ]);

    if (projets.status === 'fulfilled') {
      afficherBandeau(projets.value);
      afficherProjets(projets.value);
    } else {
      grille.replaceChildren(el('p', { class: styles.message }, 'Les réalisations ne peuvent pas être chargées pour le moment.'));
      console.error('Chargement impossible de data/projets.json. En local, ouvrez le site avec un serveur (voir README.md).', projets.reason);
    }

    if (profil.status === 'fulfilled') {
      afficherCompetences(profil.value.competences || []);
      observerApparitions(document.getElementById('liste-competences'));
      afficherParcours(profil.value.parcours || []);
      afficherContact(profil.value.contact || {});
    } else {
      console.error('Chargement impossible de data/profil.json.', profil.reason);
    }
  }

  demarrer();
})();
