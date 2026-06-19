(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-dot">▶</span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <div class="meta-line">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function searchMovies(query) {
    var q = query.toLowerCase();
    if (!q) {
      return [];
    }
    return (window.SEARCH_MOVIES || []).filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine,
        movie.category,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).sort(function (a, b) {
      return (b.yearNum || 0) - (a.yearNum || 0);
    });
  }

  function render() {
    var input = document.querySelector('[data-search-input]');
    var resultBox = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var query = getQuery();

    if (input) {
      input.value = query;
    }

    if (!resultBox || !summary) {
      return;
    }

    if (!query) {
      resultBox.innerHTML = '';
      summary.textContent = '请输入关键词开始搜索。';
      return;
    }

    var results = searchMovies(query).slice(0, 200);
    summary.textContent = '关键词“' + query + '”找到 ' + results.length + ' 条结果，最多显示 200 条。';
    resultBox.innerHTML = results.map(card).join('\n');
  }

  document.addEventListener('DOMContentLoaded', render);
})();
