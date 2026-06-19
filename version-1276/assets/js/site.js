
(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var carousel = qs('[data-hero-carousel]');
    if (carousel) {
        var slides = qsa('[data-hero-slide]', carousel);
        var dotsWrap = qs('[data-hero-dots]', carousel);
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            qsa('button', dotsWrap).forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (dotsWrap && slides.length > 1) {
            slides.forEach(function (_, index) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 张焦点图');
                dot.addEventListener('click', function () {
                    showSlide(index);
                    startTimer();
                });
                dotsWrap.appendChild(dot);
            });
            showSlide(0);
            startTimer();
        }
    }

    qsa('[data-card-filter]').forEach(function (form) {
        var input = qs('input', form);
        var scope = qs('[data-filter-scope]');
        if (!input || !scope) {
            return;
        }
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            qsa('.movie-card', scope).forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.style.display = text.indexOf(query) >= 0 ? '' : 'none';
            });
        });
    });

    var yearBar = qs('[data-year-filter]');
    var filterScope = qs('[data-filter-scope]');
    if (yearBar && filterScope) {
        qsa('button', yearBar).forEach(function (button) {
            button.addEventListener('click', function () {
                var year = button.getAttribute('data-filter-year');
                qsa('button', yearBar).forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                qsa('.movie-card', filterScope).forEach(function (card) {
                    var cardYear = card.getAttribute('data-year') || '';
                    card.style.display = year === 'all' || cardYear === year ? '' : 'none';
                });
            });
        });
    }

    var searchInput = qs('#search-input');
    var searchResults = qs('#search-results');
    if (searchInput && searchResults) {
        var typeSelect = qs('#search-type');
        var regionSelect = qs('#search-region');
        var yearSelect = qs('#search-year');
        var resetButton = qs('#search-reset');
        var countNode = qs('#search-count');
        var movies = [];

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '' +
                '<article class="movie-card">' +
                    '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">' +
                        '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="play-mark">▶</span>' +
                        '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
                    '</a>' +
                    '<div class="card-body">' +
                        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
                        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                        '<div class="tag-row">' + tags + '</div>' +
                        '<div class="card-foot"><span>' + escapeHtml(movie.category) + '</span><a href="' + escapeHtml(movie.url) + '">立即观看</a></div>' +
                    '</div>' +
                '</article>';
        }

        function applySearch() {
            var q = searchInput.value.trim().toLowerCase();
            var type = typeSelect.value;
            var region = regionSelect.value;
            var year = yearSelect.value;
            var filtered = movies.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.summary, (movie.tags || []).join(' ')].join(' ').toLowerCase();
                return (!q || haystack.indexOf(q) >= 0) &&
                    (!type || movie.type === type) &&
                    (!region || movie.region === region) &&
                    (!year || movie.year === year);
            }).sort(function (a, b) {
                return (b.yearNum - a.yearNum) || (b.score - a.score);
            }).slice(0, 120);

            searchResults.innerHTML = filtered.map(renderCard).join('') || '<p class="empty-result">没有找到匹配影片，请调整关键词或筛选条件。</p>';
            if (countNode) {
                countNode.textContent = filtered.length;
            }
        }

        function hydrateFromUrl() {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                searchInput.value = q;
            }
        }

        fetch('assets/data/movies-search.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                movies = data;
                hydrateFromUrl();
                applySearch();
            })
            .catch(function () {
                hydrateFromUrl();
            });

        [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (node) {
            node.addEventListener('input', applySearch);
            node.addEventListener('change', applySearch);
        });

        resetButton.addEventListener('click', function () {
            searchInput.value = '';
            typeSelect.value = '';
            regionSelect.value = '';
            yearSelect.value = '';
            applySearch();
        });
    }
})();
