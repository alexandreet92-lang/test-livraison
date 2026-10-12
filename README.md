# Modèle de site statique

Le site de départ de chaque client. Du HTML, du CSS et un peu de JavaScript :
**rien à installer, aucune étape de construction.** Le dossier est publié tel
quel sur Netlify (voir `netlify.toml`).

C'est ce dossier que Claude remplit pour chaque nouveau client, puis que vous
livrez avec `docs/LIVRAISON.md`.

## Ce qu'il contient

| Fichier | Rôle |
|---|---|
| `index.html` | La page unique : héros, services, à propos, réalisations, avis, horaires, formulaire |
| `mentions-legales.html`, `confidentialite.html` | Les deux pages légales, déjà rédigées |
| `merci.html`, `404.html` | Après l'envoi du formulaire, et page introuvable |
| `styles.css` | Tout l'habillage. Couleurs et polices en variables, en tête de fichier |
| `site.js` | Menu mobile, apparitions au défilement. Sans lui, le site reste lisible |
| `netlify.toml` | Réglages Netlify + le bloc « aperçu » (`noindex`) |
| `robots.txt`, `sitemap.xml` | Référencement |
| `verifier.mjs` | Le contrôle avant livraison (voir plus bas) |
| `images/` | Les photos du client. `exemple.svg` n'est qu'un substitut ; `favicon.svg` est la petite icône de l'onglet (à recolorer) |

**Aucune police ni script externe, aucun cookie, aucune statistique.** Résultat :
pas de bandeau de consentement à afficher, et un site rapide. La carte est un
**lien** vers Google Maps, pas une carte intégrée (qui déposerait des cookies).

## Fabriquer un site pour un client

1. **Copier ce dossier** dans un nouveau dépôt, au nom du client
   (`site-martin-plomberie`).
2. **Demander à Claude de le remplir** à partir du dossier du client dans
   `/admin` : tout ce qui est écrit `[[ENTRE DOUBLES CROCHETS]]` est à remplacer.
   Demandez aussi d'adapter `--accent` et les polices dans `styles.css` au
   métier, de retirer les sections sans contenu réel (avis, réalisations,
   prix), et d'ajouter ou retirer des cartes de services.
3. **Les photos** : les déposer dans `images/` en **WebP ou JPEG, 1600 px de
   large au plus, 200 Ko environ chacune**. Ce site ne les redimensionne pas
   tout seul. Ajouter `images/partage.jpg` (1200 × 630), l'image qui
   s'affiche quand le lien est partagé.
4. **Les avis** : des avis **réellement reçus**, recopiés tels quels. Pas d'avis
   réel, on retire la section.
5. **Contrôler** : `node verifier.mjs`. Il refuse de passer tant qu'un trou, une
   photo d'exemple, une image manquante ou un titre vide traîne.
6. **Relire le site entier** à l'œil, sur téléphone, avant de l'envoyer.

## L'aperçu provisoire, puis la vraie mise en ligne

- **Aperçu** : publier sur **votre** Netlify, avec le bloc `noindex` de
  `netlify.toml` **en place**. Google ignore le site.
- **Vraie mise en ligne** (chez le client, au nom du client — voir
  `docs/LIVRAISON.md`, chapitre 6) :
  1. **supprimer le bloc « aperçu »** de `netlify.toml` ;
  2. `node verifier.mjs --production` doit passer ;
  3. publier.

  Oublier l'étape 1, c'est un site que personne ne trouvera jamais : c'est le
  premier point que le contrôle `--production` vérifie.

## Le formulaire

Il est géré par **Netlify Forms** : à la publication, Netlify repère le
formulaire `contact` tout seul. Dans **le compte Netlify du client** :
*Forms* → *Form notifications* → *Add notification* → *Email notification* →
son adresse. **Faites une vraie demande de test** avant de partir : elle doit
arriver dans sa boîte.

Le quota gratuit d'envois est limité : à vérifier dans le compte du client. S'il
risque d'être dépassé, remplacer l'attribut `action` du formulaire par un
service type Formspree ou Web3Forms (créé au nom du client).

## À vérifier avant la première vraie livraison

- La mention d'hébergeur de `mentions-legales.html` (nom et adresse de
  Netlify, Inc.) : à recopier depuis les conditions légales actuelles de
  Netlify.
- Pour les professions réglementées (kiné, psychologue…) : les mentions
  obligatoires propres au métier, à ajouter dans la zone prévue.
- Le bloc `[[headers]]` de `netlify.toml` : un passage réel sur Netlify pour
  confirmer que l'en-tête `X-Robots-Tag` est bien envoyé en aperçu (inspecteur
  du navigateur, onglet Réseau) et bien absent ensuite.

## Voir le modèle en local

```bash
cd modeles/site-statique
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```
