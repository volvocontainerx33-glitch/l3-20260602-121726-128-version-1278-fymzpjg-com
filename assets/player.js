(function () {
  function bindPlayer(card) {
    var video = card.querySelector('video');
    var cover = card.querySelector('.player-cover');
    var src = card.getAttribute('data-player-src');
    var loaded = false;
    var hls = null;

    if (!video || !src) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }

    function start() {
      loadVideo();
      card.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          card.classList.remove('is-playing');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      card.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        card.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      card.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player-src]')).forEach(bindPlayer);
})();
