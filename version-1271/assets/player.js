import { H as Hls } from './hls.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (box) {
  var video = box.querySelector('video');
  var button = box.querySelector('[data-play-button]');
  var source = box.getAttribute('data-src');
  var loaded = false;
  var hls = null;

  var load = function () {
    if (!video || !source) {
      return;
    }

    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    box.classList.add('is-playing');

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        box.classList.remove('is-playing');
      });
    }
  };

  if (button) {
    button.addEventListener('click', load);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        load();
      }
    });

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
  }
});
