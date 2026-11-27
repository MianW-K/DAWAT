(function () {
  "use strict";
  var started = false;
  function start3DScroll() {
    if (started || !document.body.classList.contains("invitation-open")) return;
    started = true;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var selectors = ".stage3d, .when, #count, main > section, main > footer";
    var targets = Array.prototype.slice.call(document.querySelectorAll(selectors));
    if (!targets.length) return;

    // Let the original staggered invitation fade finish before removing its animation class.
    // The longest current stagger is under 1.3s; 2.6s safely includes the 1.2s fade.
    window.setTimeout(function () {
      targets.forEach(function (el, index) {
        el.classList.remove("intro-reveal");
        el.classList.add("scroll3d-target");
      });

      if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        targets.forEach(function (el, index) {
          var isFooter = el.tagName === "FOOTER";
          gsap.fromTo(el,
            { y: 85, z: -150, rotationX: -13, rotationY: index % 2 ? -4 : 4, scale: 0.94, opacity: 0.48, filter: "blur(3px)" },
            { y: 0, z: 0, rotationX: 0, rotationY: 0, scale: 1, opacity: 1, filter: "blur(0px)", ease: "none",
              // The footer is at the document's end, so a top-based end point
              // may be unreachable and leave its scrubbed blur partly active.
              scrollTrigger: isFooter
                ? { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true }
                : { trigger: el, start: "top 88%", end: "top 42%", scrub: 0.7, invalidateOnRefresh: true } }
          );
        });
        requestAnimationFrame(function () { ScrollTrigger.refresh(); });
      } else {
        // CDN fallback: still gives a visible 3D reveal on scroll without external libraries.
        targets.forEach(function (el) {
          el.classList.add("scroll3d-fallback");
          if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries) {
              entries.forEach(function (entry) {
                if (entry.isIntersecting) { el.classList.add("scroll3d-visible"); io.unobserve(el); }
              });
            }, { threshold: 0.12 });
            io.observe(el);
          } else { el.classList.add("scroll3d-visible"); }
        });
      }
    }, 2600);
  }

  if (document.body.classList.contains("invitation-open")) start3DScroll();
  else {
    var bodyObserver = new MutationObserver(function () {
      if (document.body.classList.contains("invitation-open")) { bodyObserver.disconnect(); start3DScroll(); }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
})();
