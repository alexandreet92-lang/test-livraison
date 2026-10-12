/* Le peu de JavaScript du modèle. Sans lui, le site reste entièrement lisible :
   il ne fait qu'ajouter du confort (menu mobile, apparitions, ombre de l'en-tête). */
(function () {
  var racine = document.documentElement;
  racine.classList.add('js');

  var reduit = false;
  try { reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* on anime */ }

  // En-tête : un filet et une ombre dès qu'on a défilé.
  var entete = document.querySelector('.entete');
  function auDefilement() {
    if (entete) entete.classList.toggle('defile', window.scrollY > 8);
  }
  auDefilement();
  window.addEventListener('scroll', auDefilement, { passive: true });

  // Menu sur téléphone.
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var ouvert = menu.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { menu.classList.remove('ouvert'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Apparitions au défilement.
  var cibles = document.querySelectorAll('.revele');
  function montrer(el) { el.classList.add('vu'); }
  if (reduit || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(cibles, montrer);
  } else {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (en.isIntersecting) { obs.unobserve(en.target); montrer(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(cibles, function (el) { obs.observe(el); });
    // Filet de sécurité : rien ne reste invisible.
    setTimeout(function () {
      Array.prototype.forEach.call(cibles, function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) montrer(el);
      });
    }, 2000);
  }

  // L'année du pied de page se met à jour toute seule.
  var an = document.getElementById('annee');
  if (an) an.textContent = String(new Date().getFullYear());
})();
