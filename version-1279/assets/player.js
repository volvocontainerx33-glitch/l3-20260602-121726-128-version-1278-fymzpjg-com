import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(container) {
  var video = container.querySelector('video');
  var playButton = container.querySelector('[data-play-button]');
  var source = container.getAttribute('data-src');
  var hls = null;
  var loaded = false;

  if (!video || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;
    container.classList.add('is-loaded');

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    return Promise.resolve();
  }

  function play() {
    loadSource().then(function () {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          container.classList.remove('is-loaded');
        });
      }
    });
  }

  if (playButton) {
    playButton.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!loaded) {
      play();
      return;
    }
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
