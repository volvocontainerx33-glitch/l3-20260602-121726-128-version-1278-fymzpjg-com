(function () {
  function markMissingImages(root) {
    var images = (root || document).querySelectorAll('img');
    images.forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
        if (img.parentElement) {
          img.parentElement.classList.add('poster-fallback');
        }
      }, { once: true });
    });
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var scope = document.querySelector('[data-filter-scope]');
    var list = document.querySelector('[data-filter-list]');
    if (!scope || !list) {
      return;
    }
    var year = scope.querySelector('[data-filter-year]');
    var region = scope.querySelector('[data-filter-region]');
    var keyword = scope.querySelector('[data-filter-keyword]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function apply() {
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchedRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var matchedKeyword = !keywordValue || title.indexOf(keywordValue) !== -1;
        card.style.display = matchedYear && matchedRegion && matchedKeyword ? '' : 'none';
      });
    }

    [year, region, keyword].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    markMissingImages(document);
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
