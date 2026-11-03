# Portfolio de Kouame Marius

Site statique en HTML, CSS et JavaScript, mis en forme avec Tailwind CSS chargé depuis un CDN. Il n'y a aucune étape de compilation. Il est prévu pour GitHub Pages.

Les cartes de la page d'accueil et les pages de détail sont générées à partir de `data/projets.json`. Ajouter une réalisation revient à ajouter une entrée dans ce fichier et un dossier d'images.

## Arborescence

```
index.html             Page d'accueil
projet.html            Page de détail commune à tous les projets (projet.html?id=identifiant)
css/style.css          Couleurs des thèmes clair et sombre, animation d'apparition, menu sur téléphone
js/theme.js            Applique le thème et masque la page le temps que Tailwind génère les styles
js/commun.js           Fonctions partagées : thème, menu, section visible, apparitions
js/accueil.js          Cartes, filtre, compétences, parcours, contact
js/projet.js           Page de détail, galerie, visionneuse, lecteur vidéo
data/projets.json      Toutes les réalisations
data/profil.json       Contact, compétences et parcours
images/<id>/           Couverture et galerie de chaque réalisation
images/partage.jpg     Image d'aperçu pour les réseaux sociaux (Open Graph)
videos/                Vidéos de démonstration
cv/                    CV au format PDF
.nojekyll              Demande à GitHub Pages de servir les fichiers tels quels
```

## Lancer le site en local

Le site lit ses données avec `fetch`. Un double clic sur `index.html` ne suffit pas : le navigateur bloque la lecture des fichiers JSON ouverts directement depuis le disque. Il faut un petit serveur local.

Avec Python :

```
cd chemin/vers/mon_portfolio
python -m http.server 8000
```

Ouvrir ensuite http://localhost:8000 dans le navigateur. `Ctrl + C` arrête le serveur.

Autres possibilités : `npx serve .` avec Node.js, ou l'extension « Live Server » de VS Code.

## Ajouter un projet

1. Choisir un identifiant court, en minuscules, sans espace ni accent, par exemple `mon-projet`. Il sert dans l'adresse `projet.html?id=mon-projet` et dans le nom des dossiers.
2. Créer le dossier `images/mon-projet/` avec `couverture.jpg` et les images de la galerie.
3. Déposer la vidéo dans `videos/mon-projet-demo.mp4` (facultatif).
4. Ajouter une entrée dans `data/projets.json`. Le plus simple est de copier un bloc existant. Ne pas oublier la virgule entre deux blocs.

Modèle d'entrée :

```json
{
  "id": "mon-projet",
  "titre": "Mon projet",
  "type": "Application web",
  "annee": "2026",
  "categorie": "web",
  "contexte": "Une phrase qui présente le projet.",
  "resume": "Trois à quatre lignes qui expliquent ce que fait le projet et ce que j'y fais.",
  "role": "Conception et développement complet",
  "technologies": ["HTML", "CSS", "JavaScript"],
  "statut": "En ligne",
  "fonctionnalites": ["Première fonctionnalité", "Deuxième fonctionnalité"],
  "choixTechniques": "Texte libre.",
  "difficulte": "Le problème rencontré.",
  "solution": "La solution retenue.",
  "github": "https://github.com/pseudo/mon-projet",
  "demo": null,
  "couverture": "images/mon-projet/couverture.jpg",
  "galerie": [
    { "fichier": "images/mon-projet/galerie-1.jpg", "legende": "Écran d'accueil" },
    { "fichier": "images/mon-projet/galerie-2.jpg", "legende": "Formulaire de commande" }
  ],
  "video": {
    "type": "fichier",
    "source": "videos/mon-projet-demo.mp4",
    "poster": "images/mon-projet/couverture.jpg"
  }
}
```

Détail des champs :

| Champ | Contenu |
| --- | --- |
| `id` | Identifiant unique, utilisé dans l'adresse de la page de détail. |
| `titre` | Nom du projet. |
| `type` | Nature du projet, par exemple « Application mobile ». |
| `annee` | Année, entre guillemets. Vide (`""`) : seule la mention du type s'affiche. |
| `categorie` | `mobile`, `web`, `automatisation` ou `donnees` (sans accent), en minuscules. Sert au filtre. |
| `contexte` | Une phrase, affichée sur la carte. |
| `resume` | Trois à quatre lignes, affichées en haut de la page de détail. |
| `role` | Mon rôle dans le projet. |
| `technologies` | Liste, affichée en étiquettes sur la carte. |
| `statut` | État du projet. |
| `fonctionnalites` | Liste des fonctionnalités principales. |
| `choixTechniques` | Texte. |
| `difficulte` et `solution` | Texte. |
| `github` | Adresse du dépôt. `null` : la mention « Code privé » remplace le bouton. `""` : rien ne s'affiche (information à compléter). |
| `demo` | Adresse d'une démo en ligne, ou `null`. Le lien « Voir la démo » apparaît sur la page de détail si une adresse est renseignée. |
| `couverture` | Chemin de l'image de couverture. |
| `galerie` | Liste d'images. Chaque image a un `fichier` et une `legende`. La légende s'affiche sous l'image et sert aussi de texte alternatif. Le nombre d'images est libre. |
| `video` | Voir ci-dessous. `null` si le projet n'a pas de vidéo. |

Règle générale : un texte vide (`""`) ou une liste vide (`[]`) n'est pas affiché. La section correspondante disparaît de la page de détail.

Les cartes apparaissent dans l'ordre du fichier.

Les catégories du filtre sont fixes (`mobile`, `web`, `automatisation`, `donnees`). Pour en créer une nouvelle, ajouter un bouton dans `index.html`, dans le bloc `class="filtre"`, avec la valeur correspondante dans `data-categorie`.

### Champ video

| `type` | `source` | `poster` |
| --- | --- | --- |
| `fichier` | Chemin du fichier MP4, par exemple `videos/mon-projet-demo.mp4` | Image affichée avant la lecture |
| `youtube` | Adresse de la vidéo YouTube ou son identifiant de 11 caractères | Non utilisé (`null`) |
| `vimeo` | Adresse de la vidéo Vimeo ou son numéro | Non utilisé (`null`) |

La vidéo ne démarre jamais seule. Si le fichier MP4 est absent, le lecteur affiche : « La vidéo de démonstration n'est pas encore disponible. »

## Où placer les images et les vidéos

Le site contient pour l'instant des images temporaires grises, avec le nom du fichier attendu écrit au centre. Pour les remplacer, il suffit de déposer le vrai fichier au même endroit, avec exactement le même nom. Aucune modification de `projets.json` n'est nécessaire.

| Fichier | Emplacement | Format conseillé |
| --- | --- | --- |
| Couverture | `images/<id>/couverture.jpg` | 16:9, par exemple 1600 x 900 px |
| Galerie | `images/<id>/galerie-1.jpg`, `galerie-2.jpg`, `galerie-3.jpg` | Format libre (les captures de téléphone en hauteur sont acceptées) |
| Vidéo | `videos/<id>-demo.mp4` | MP4 (H.264), 30 à 60 secondes |
| CV | `cv/développeur_fullstack_kouame_marius.pdf` | PDF. Pour changer de fichier, modifier aussi le lien « Télécharger mon CV » dans `index.html`. |
| Aperçu réseaux sociaux | `images/partage.jpg` | 1200 x 630 px |

Identifiants actuels : `mes-connect`, `loung`, `couahi`, `automatisation-whatsapp-ia`, `power-bi`. Exception : les images de Loung sont dans `images/e-commerce/`.

Le site lit les chemins écrits dans `projets.json`. Si une image ne s'affiche pas, vérifier que son nom et son dossier correspondent exactement au chemin du fichier JSON :

- l'extension compte : `.jpg` et `.jpeg` sont différents pour le site ;
- les majuscules comptent : Windows ignore la différence entre `Couahi` et `couahi`, GitHub Pages non. Une image qui s'affiche en local peut donc manquer une fois en ligne. Le plus sûr est de tout écrire en minuscules.

Le dossier `originaux/` garde les fichiers sources (captures PNG, vidéos non compressées). Il est exclu de la publication par `.gitignore`.

Une capture de téléphone (plus haute que large) peut servir de galerie : les miniatures s'adaptent automatiquement. Pour la couverture, préférer une image en 16:9, par exemple plusieurs captures côte à côte sur un fond uni.

Contraintes :

- Images en JPG ou WebP, 1600 px de large maximum, moins de 500 Ko. Pour une image en WebP, modifier aussi son chemin dans `projets.json`.
- Vidéos en MP4, de 30 à 60 secondes, moins de 20 Mo.
- Les couvertures sont toujours affichées en 16:9. Une image d'un autre format est recadrée.

Outils gratuits pour réduire le poids des fichiers : Squoosh (https://squoosh.app) pour les images, HandBrake pour les vidéos.

## Contact, compétences et parcours

Ces informations se trouvent dans `data/profil.json` :

- `contact` : `email`, `telephone` et `whatsapp` (au format international, par exemple `+225 07 77 93 51 65`), `adresse`, `linkedin` et `github` (adresse complète du profil). Une valeur vide n'est pas affichée. Le numéro WhatsApp donne un lien « Écrire sur WhatsApp ».
- `competences` : trois blocs (Mobile, Web, Bases de données) avec la liste des outils.
- `parcours` : chaque étape a un `intitule`, un `lieu`, une `periode` et une `description`. Les valeurs vides ne sont pas affichées.

## Publier sur GitHub Pages

1. Créer un dépôt sur GitHub, par exemple `portfolio`.
2. Envoyer les fichiers du site à la racine de la branche `main` :

   ```
   git init
   git add .
   git commit -m "Premier envoi du portfolio"
   git branch -M main
   git remote add origin https://github.com/PSEUDO/portfolio.git
   git push -u origin main
   ```

3. Sur la page du dépôt, ouvrir **Settings**, puis **Pages**.
4. Dans **Build and deployment**, choisir **Source : Deploy from a branch**.
5. Choisir la branche **main** et le dossier **/ (root)**.
6. Cliquer sur **Save**.

Après quelques minutes, le site est en ligne à l'adresse `https://PSEUDO.github.io/portfolio/`. Un dépôt nommé `PSEUDO.github.io` publie le site directement à `https://PSEUDO.github.io/`.

Tous les chemins du site sont relatifs : il fonctionne dans les deux cas sans modification.

## Après la mise en ligne : aperçu sur les réseaux sociaux

Les balises Open Graph demandent une adresse complète pour l'image. Une fois l'adresse du site connue, remplacer dans `index.html` et `projet.html` :

```html
<meta property="og:image" content="images/partage.jpg">
```

par l'adresse complète, par exemple :

```html
<meta property="og:image" content="https://PSEUDO.github.io/portfolio/images/partage.jpg">
```

Les réseaux sociaux n'exécutent pas JavaScript. Un lien vers `projet.html?id=...` affiche donc l'aperçu général de `projet.html`. Le titre de l'onglet et la description sont, eux, adaptés à chaque projet.

## Style : Tailwind CSS, couleurs et police

La mise en page utilise les classes Tailwind CSS (version 4), écrites directement dans le HTML et dans les scripts (`js/accueil.js`, `js/projet.js`, et `styles` dans `js/commun.js`).

- Tailwind est chargé depuis le CDN jsDelivr, dans une version fixée (4.3.4) avec une empreinte `integrity` : le navigateur refuse le fichier s'il a été modifié. Pour changer de version, il faut remplacer l'adresse et l'empreinte dans `index.html` et `projet.html`.
- Tailwind calcule les styles dans le navigateur du visiteur. Le site a donc besoin d'une connexion internet pour s'afficher correctement, y compris en local.
- Les couleurs se changent à un seul endroit : les variables en haut de `css/style.css`, une série pour le thème clair et une pour le thème sombre. Les classes Tailwind y font référence par leur nom : `bg-fond`, `text-encre`, `text-doux`, `border-trait`, `bg-accent`, `text-accent`, etc. Le bloc `<style type="text/tailwindcss">` de chaque page fait ce lien et doit rester identique dans les deux pages.
- Couleur d'accent : vert émeraude (`#047857` en thème clair, `#6ee7b7` en thème sombre). Les contrastes respectent le niveau AA des règles d'accessibilité WCAG.
- Police : Plus Jakarta Sans, chargée depuis Google Fonts. Sans connexion, le site utilise la police du système.
