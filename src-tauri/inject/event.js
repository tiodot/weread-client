const shortcuts = {
  ArrowUp: () => scrollTo(0, 0),
  ArrowDown: () => scrollTo(0, document.body.scrollHeight),
  // Don't use command + ArrowLeft or command + ArrowRight
  // When editing text in page, it causes unintended page navigation.
  // ArrowLeft: () => window.history.back(),
  // ArrowRight: () => window.history.forward(),
  '[': () => window.history.back(),
  ']': () => window.history.forward(),
  'b': () => {
    if (document.cookie.match(/wr_name=[^;]+;/)) {
      window.location.href = '/web/shelf'
    } else {
      window.location.href = '/'
    }
  },
  r: () => window.location.reload(),
  '-': () => zoomOut(),
  '=': () => zoomIn(),
  '+': () => zoomIn(),
  0: () => setZoom('100%'),
  ',': () => {
    if (location.href.endsWith('/setting.html')) {
      window.history.back();
      return;
    }
    if (window.__tauri_dev__) {
      location.href = 'http://127.0.0.1:1430/setting.html';
    } else {
      location.href = 'tauri://localhost/setting.html';
    }
  }
};

const vimKeys = {
  'j': (options) => scrollPage((options?.delta || 2) * 120),
  'k': (options) => scrollPage((options?.delta || 2) * -120),
  'J': (options) => scrollPage(5 * 120),
  'K': (options) => scrollPage(-5 * 120),
  'g': (options) => {
    if (options?.isDouble) {
      scroll(0, 0);
    }
    if (options?.shiftKey) {
      scroll(0, document.body.scrollHeight);
    }
  },
  'G': (options) => {
    if (options?.shiftKey) {
      scroll(0, document.body.scrollHeight);
    }
  },
  'n': () => toggleChapter('next'),
  'p': () => toggleChapter('prev'),
  // w s a d 按键模式，适合左手操作
  's': () => scrollPage(2 * 120),
  'w': () => scrollPage(-2 * 120),
  'a': () => toggleChapter('prev'),
  'd': () => toggleChapter('next'),
}

function setZoom(zoom) {
  const html = document.getElementsByTagName('html')[0];
  html.style.zoom = zoom;
  window.localStorage.setItem('htmlZoom', zoom);
}

function zoomCommon(zoomChange) {
  const currentZoom = window.localStorage.getItem('htmlZoom') || '100%';
  setZoom(zoomChange(currentZoom));
}

function zoomIn() {
  zoomCommon((currentZoom) => `${Math.min(parseInt(currentZoom) + 10, 200)}%`);
}

function zoomOut() {
  zoomCommon((currentZoom) => `${Math.max(parseInt(currentZoom) - 10, 30)}%`);
}

function scrollPage(delta) {
  document.scrollingElement.scrollBy({ top: delta, behavior: 'smooth' });
}

function toggleChapter(type) {
  if (!window.location.pathname.startsWith('/web/reader')) {
    return;
  }
  let el = null;
  if (type === 'next') {
    el = document.querySelector('.readerFooter_button[title^="下一"]');
  }
  if (type === 'prev') {
    el = document.querySelector('.readerHeaderButton');
  }
  if (el) {
    switchChapter(el)
  }
}

function switchChapter(el) {
  el.style.boxShadow = '0 0 4px 2px #4183c4';
  let { x, y, width, height } = el.getBoundingClientRect();
  x += Math.floor(width / 2);
  y += Math.floor(height / 2);
  const event = new MouseEvent('click', {
    view: window,
    detail: 1,
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y,
  })
  el.dispatchEvent(event);
}

function handleShortcut(event) {
  if (shortcuts[event.key]) {
    event.preventDefault();
    shortcuts[event.key]();
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keyup', (event) => {
    if (/windows|linux/i.test(navigator.userAgent) && event.ctrlKey) {
      handleShortcut(event);
    }
    if (/macintosh|mac os x/i.test(navigator.userAgent) && event.metaKey) {
      handleShortcut(event);
    }
  });

  const preventEvent = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  let previousKey = '';
  document.addEventListener('keydown', (event) => {
    // 针对body做特殊按键处理
    if ('BODY' === event.target.tagName && vimKeys[event.key] && !event.metaKey) {
      vimKeys[event.key]({
        delta: Number(previousKey),
        shiftKey: event.shiftKey,
        isDouble: previousKey === 'g'
      });
      preventEvent(event);
    }
    previousKey = event.key;
  })
})


