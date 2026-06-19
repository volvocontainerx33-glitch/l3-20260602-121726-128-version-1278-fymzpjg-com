(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    function syncHeader() {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (slides.length > 1) {
      var active = 0;
      slides[0].classList.add('active');
      window.setInterval(function () {
        slides[active].classList.remove('active');
        active = (active + 1) % slides.length;
        slides[active].classList.add('active');
      }, 4800);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var clearButton = document.querySelector('[data-clear-search]');
    var resultCount = document.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function updateSearch() {
      if (!searchInput || !cards.length) {
        if (resultCount) resultCount.textContent = cards.length;
        return;
      }
      var query = normalize(searchInput.value);
      var count = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) count += 1;
      });
      if (resultCount) resultCount.textContent = count;
    }

    if (searchInput) {
      searchInput.addEventListener('input', updateSearch);
      updateSearch();
    }

    if (clearButton && searchInput) {
      clearButton.addEventListener('click', function () {
        searchInput.value = '';
        updateSearch();
        searchInput.focus();
      });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-play-overlay]');
      var button = player.querySelector('[data-play-button]');
      if (!video) return;

      var source = video.getAttribute('data-src');
      var sourceAttached = false;

      function attachSource() {
        if (sourceAttached || !source) return;
        sourceAttached = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            video.setAttribute('controls', 'controls');
          });
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      video.addEventListener('play', function () {
        if (overlay) overlay.classList.add('is-hidden');
      });

      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) overlay.classList.remove('is-hidden');
      });

      video.addEventListener('click', function () {
        attachSource();
      }, { once: true });
    });
  });
})();
