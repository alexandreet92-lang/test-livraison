#!/usr/bin/env node
/**
 * LE CONTRÔLE AVANT LIVRAISON du modèle statique.
 *
 *   node verifier.mjs               # avant l'aperçu : rien d'oublié dans le site
 *   node verifier.mjs --production  # avant la vraie mise en ligne : en plus, plus de noindex
 *
 * Il ne remplace pas la relecture du site page par page, il attrape ce qui se
 * oublie : un « [[PLACEHOLDER]] » resté dans une page, la photo d'exemple
 * encore en place, une image qui n'existe pas, un titre vide, un `noindex`
 * encore actif le jour de la vraie mise en ligne.
 *
 * Aucune dépendance : Node suffit.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = dirname(fileURLToPath(import.meta.url));
const production = process.argv.includes('--production');
const erreurs = [];
const avis = [];

function fichiers(dossier) {
  const sortie = [];
  for (const nom of readdirSync(dossier)) {
    if (nom === 'node_modules' || nom.startsWith('.')) continue;
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) sortie.push(...fichiers(chemin));
    else sortie.push(chemin);
  }
  return sortie;
}

const rel = (p) => p.slice(racine.length + 1);
const tous = fichiers(racine);
const textes = tous.filter((f) => ['.html', '.xml', '.txt', '.css', '.js', '.svg'].includes(extname(f)));

for (const f of textes) {
  if (f.endsWith('verifier.mjs')) continue;
  const contenu = readFileSync(f, 'utf8');

  // 1. Les trous à remplir.
  const trous = contenu.match(/\[\[[^\]]*\]\]/g);
  if (trous) {
    erreurs.push(`${rel(f)} : ${trous.length} trou(s) à remplir, par exemple ${trous[0].slice(0, 60)}`);
  }

  // 2. Les photos d'exemple encore en place.
  if (f.endsWith('.html') && /images\/exemple\.svg/.test(contenu)) {
    const n = (contenu.match(/images\/exemple\.svg/g) || []).length;
    erreurs.push(`${rel(f)} : ${n} photo(s) d'exemple encore en place (images/exemple.svg)`);
  }

  if (!f.endsWith('.html')) continue;

  // 3. Les images et les liens qui n'existent pas.
  for (const m of contenu.matchAll(/(?:src|href)="([^"#?]+)(?:[#?][^"]*)?"/g)) {
    const cible = m[1];
    if (/^(https?:|mailto:|tel:|\/\/|data:)/.test(cible) || cible.startsWith('[[')) continue;
    const chemin = resolve(dirname(f), cible);
    if (!existsSync(chemin)) erreurs.push(`${rel(f)} : « ${cible} » n'existe pas`);
  }

  // 4. Les bases du référencement.
  const titre = (contenu.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!titre.trim()) erreurs.push(`${rel(f)} : titre vide`);
  else if (titre.length > 65) avis.push(`${rel(f)} : titre de ${titre.length} caractères (Google coupe vers 60)`);
  const h1 = (contenu.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) erreurs.push(`${rel(f)} : ${h1} balise(s) h1 (il en faut exactement une)`);
  for (const m of contenu.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]+"/.test(m[0])) erreurs.push(`${rel(f)} : image sans texte alternatif`);
  }
  if (rel(f) === 'index.html') {
    const d = (contenu.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
    if (d.length > 170) avis.push(`index.html : description de ${d.length} caractères (visez 150 ou moins)`);
  }
}

// 5. L'image de partage, annoncée dans l'en-tête.
if (!existsSync(join(racine, 'images', 'partage.jpg'))) {
  avis.push("images/partage.jpg est absente : c'est l'image qui s'affiche quand le lien est partagé (1200 × 630)");
}

// 6. Le noindex : normal en aperçu, interdit en production.
const toml = readFileSync(join(racine, 'netlify.toml'), 'utf8');
const noindex = /^\s*X-Robots-Tag\s*=.*noindex/m.test(toml);
if (production && noindex) {
  erreurs.push("netlify.toml : le bloc « aperçu » (noindex) est toujours là — Google n'indexera jamais ce site. Supprimez-le.");
}
if (!production && noindex) avis.push("noindex actif (normal pour l'aperçu). Pour la mise en ligne : supprimez le bloc de netlify.toml.");
if (production && !noindex) avis.push('noindex retiré : le site sera indexé.');

console.log(production ? 'Contrôle avant MISE EN LIGNE\n' : "Contrôle avant APERÇU\n");
for (const a of avis) console.log('  à savoir  ' + a);
for (const e of erreurs) console.log('  BLOQUANT  ' + e);
if (!erreurs.length) console.log(`\n✓ Rien d'oublié${avis.length ? ' (voir « à savoir » ci-dessus)' : ''}.`);
else console.log(`\n✗ ${erreurs.length} point(s) bloquant(s). Ne livrez pas avec ça.`);
process.exit(erreurs.length ? 1 : 0);
