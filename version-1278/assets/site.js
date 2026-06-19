(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('.hero-slider');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    restart();
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var pageSearchInput = document.querySelector('.page-search input[name="q"]');

  if (pageSearchInput && query) {
    pageSearchInput.value = query;
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

  filterPanels.forEach(function (panel) {
    var scope = panel.parentElement || document;
    var input = panel.querySelector('.filter-input');
    var year = panel.querySelector('.filter-year');
    var type = panel.querySelector('.filter-type');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('.filter-empty');

    if (input && query && document.body.contains(pageSearchInput)) {
      input.value = query;
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' ').toLowerCase();
        var yearOk = !yearValue || card.dataset.year === yearValue;
        var typeOk = !typeValue || (card.dataset.type || '').indexOf(typeValue) !== -1;
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var show = yearOk && typeOk && keywordOk;

        card.style.display = show ? '' : 'none';
        if (show) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.style.display = visibleCount ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    if (year) {
      year.addEventListener('change', applyFilters);
    }
    if (type) {
      type.addEventListener('change', applyFilters);
    }
    applyFilters();
  });
})();
