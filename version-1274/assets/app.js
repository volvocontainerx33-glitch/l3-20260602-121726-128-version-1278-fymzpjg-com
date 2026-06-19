
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = form.getAttribute('data-search-url') || './search.html';
      var url = query ? target + '?q=' + encodeURIComponent(query) : target;
      window.location.href = url;
    });
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var root = panel.parentElement || document;
    var input = panel.querySelector('[data-filter-input]');
    var selects = panel.querySelectorAll('[data-filter-select]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var emptyState = root.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = normalize(select.value);
      });

      var visible = 0;

      cards.forEach(function (card) {
        var keywords = normalize(card.getAttribute('data-keywords'));
        var matchKeyword = !keyword || keywords.indexOf(keyword) !== -1;
        var matchRegion = !filters.region || normalize(card.getAttribute('data-region')) === filters.region;
        var matchType = !filters.type || normalize(card.getAttribute('data-type')) === filters.type;
        var matchYear = !filters.year || normalize(card.getAttribute('data-year')) === filters.year;
        var matched = matchKeyword && matchRegion && matchType && matchYear;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  });

  function showPlayerMessage(container, message) {
    var target = container.querySelector('[data-player-message]');

    if (target) {
      target.textContent = message;
      target.classList.add('is-visible');
    }
  }

  function playVideo(video) {
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  document.querySelectorAll('[data-video-player]').forEach(function (container) {
    var video = container.querySelector('video');
    var button = container.querySelector('[data-play-button]');
    var stream = container.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function start() {
      if (!video || !stream) {
        showPlayerMessage(container, '播放加载失败，请稍后重试。');
        return;
      }

      if (started) {
        playVideo(video);
        return;
      }

      started = true;
      video.controls = true;

      if (button) {
        button.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          playVideo(video);
        }, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showPlayerMessage(container, '播放加载失败，请稍后重试。');
          }
        });
        return;
      }

      showPlayerMessage(container, '播放加载失败，请稍后重试。');
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
