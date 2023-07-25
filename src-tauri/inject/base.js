Object.defineProperty(window, '__TAURI_POST_MESSAGE__', {
  value: function (message) {
    return window.ipc.postMessage(JSON.stringify(message, (_k, val) => {
      if (val instanceof Map) {
        let o = {};
        val.forEach((v, k) => o[k] = v);
        return o;
      } else if (val instanceof Object && '__TAURI_CHANNEL_MARKER__' in val && typeof val.id === 'number') {
        return `__CHANNEL__:${val.id}`
      } else {
        return val;
      }
    })
    )
  }
})


function __tauri_inject_style(content) {
  window.addEventListener('DOMContentLoaded', () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = content;
    document.head.appendChild(styleElement);
  })
}