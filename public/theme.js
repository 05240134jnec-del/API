// public/theme.js
// Colour picker used by BOTH pages (home + dashboard).
// Saves the choice in the browser so it is remembered on the next visit.
(function () {
  // [name, colour in dark mode, colour in light mode]
  var ACCENTS = [
    ['Indigo', '#7c83ff', '#4f46e5'],
    ['Teal',   '#2dd4bf', '#0d9488'],
    ['Pink',   '#f472b6', '#db2777'],
    ['Orange', '#fb923c', '#ea580c'],
    ['Green',  '#4ade80', '#16a34a'],
  ];

  function read(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  // mix a hex colour with white (amount > 0) or black (amount < 0)
  function shade(hex, amount) {
    var n = parseInt(hex.slice(1), 16);
    var target = amount < 0 ? 0 : 255;
    var a = Math.abs(amount);
    var r = Math.round(((n >> 16) & 255) * (1 - a) + target * a);
    var g = Math.round(((n >> 8) & 255) * (1 - a) + target * a);
    var b = Math.round((n & 255) * (1 - a) + target * a);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  var root = document.documentElement;
  var accent = read('taskflow-accent', 'Indigo');
  var mode = read('taskflow-mode', 'dark');

  function apply() {
    var item = ACCENTS.filter(function (a) { return a[0] === accent; })[0] || ACCENTS[0];
    var base = mode === 'light' ? item[2] : item[1];
    root.setAttribute('data-mode', mode);
    root.style.setProperty('--brand', base);
    root.style.setProperty('--brand-dark', shade(base, -0.14));
    root.style.setProperty('--brand-2', shade(base, mode === 'light' ? 0.35 : 0.3));
    root.style.setProperty('--brand-soft', 'color-mix(in srgb, ' + base + ' ' + (mode === 'light' ? 11 : 16) + '%, transparent)');
  }
  apply(); // run right away so there is no flash of the wrong colour

  function build() {
    var host = document.querySelector('.nav-inner');
    if (!host) return;

    var box = document.createElement('div');
    box.className = 'theme-box';

    var swatches = document.createElement('div');
    swatches.className = 'swatches';
    ACCENTS.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (a[0] === accent ? ' on' : '');
      b.title = a[0];
      b.setAttribute('aria-label', a[0] + ' colour');
      b.style.background = a[1];
      b.addEventListener('click', function () {
        accent = a[0];
        write('taskflow-accent', accent);
        apply();
        swatches.querySelectorAll('.swatch').forEach(function (x) { x.classList.toggle('on', x === b); });
      });
      swatches.appendChild(b);
    });

    var modeBtn = document.createElement('button');
    modeBtn.type = 'button';
    modeBtn.className = 'mode-btn';
    modeBtn.title = 'Switch light / dark';
    modeBtn.setAttribute('aria-label', 'Switch light or dark mode');
    function icon() { modeBtn.textContent = mode === 'light' ? '🌙' : '☀️'; }
    icon();
    modeBtn.addEventListener('click', function () {
      mode = mode === 'light' ? 'dark' : 'light';
      write('taskflow-mode', mode);
      apply(); icon();
    });

    box.appendChild(swatches);
    box.appendChild(modeBtn);

    // put the links and the picker together on the right side of the bar
    var links = host.querySelector('.nav-links');
    var right = document.createElement('div');
    right.className = 'nav-right';
    host.appendChild(right);
    if (links) right.appendChild(links);
    right.appendChild(box);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
