/* Applique le thème avant le premier affichage pour éviter un changement de couleurs visible. */
(function () {
  var racine = document.documentElement;
  var choix = null;
  try {
    choix = localStorage.getItem('theme');
  } catch (e) {}
  if (choix !== 'clair' && choix !== 'sombre') {
    choix = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair';
  }
  racine.setAttribute('data-theme', choix);
  racine.classList.add('js', 'tw-attente');

  /* Tailwind (CDN) calcule les styles dans le navigateur. La page reste masquée jusqu'à ce que
     l'en-tête ait reçu ses classes Tailwind, pour éviter un affichage sans mise en page.
     Au plus 2 secondes, au cas où le CDN ne répond pas. */
  function afficher() {
    racine.classList.remove('tw-attente');
  }

  function stylesPrets() {
    var entete = document.querySelector('.entete-site');
    return entete && window.getComputedStyle(entete).position === 'sticky';
  }

  function attendre() {
    if (stylesPrets()) afficher();
    else if (racine.classList.contains('tw-attente')) window.requestAnimationFrame(attendre);
  }

  window.setTimeout(afficher, 2000);
  document.addEventListener('DOMContentLoaded', attendre);
})();
