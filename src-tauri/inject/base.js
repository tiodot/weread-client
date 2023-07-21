Object.defineProperty(window, '__TAURI_POST_MESSAGE__', {
  value: (message) => {
    {
      window.ipc.postMessage(JSON.stringify(message, (_k, val) => {
        if (val instanceof Map) {
          let o = {};
          val.forEach((v, k) => o[k] = v);
          return o;
        } else {
          return val;
        }
      })
      )
    }
  }
})


function __tauri_inject_style(content) {
  window.addEventListener('DOMContentLoaded', () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = content;
    document.head.appendChild(styleElement);
  })
}