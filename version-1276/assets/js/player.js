import { H as Hls } from './hls-vendor-dru42stk.js';

function initializePlayer(video) {
    var source = video.getAttribute('data-src');
    if (!source) {
        return null;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return hls;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
    }

    return null;
}

function setupPlayer() {
    var video = document.getElementById('movie-player');
    var start = document.querySelector('[data-player-start]');
    var playerInstance = null;

    if (!video) {
        return;
    }

    function playVideo() {
        if (!playerInstance && !video.src) {
            playerInstance = initializePlayer(video);
        }
        if (start) {
            start.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (start) {
                    start.classList.remove('is-hidden');
                }
            });
        }
    }

    if (start) {
        start.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPlayer);
} else {
    setupPlayer();
}
