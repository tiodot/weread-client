Object.defineProperty(window, '__TAURI_POST_MESSAGE__', {
  value: (message) => window.ipc.postMessage(
    JSON.stringify(message, (_k, val) => {
      if (val instanceof Map) {
        let o = {};
        val.forEach((v, k) => o[k] = v);
        return o;
      } else {
        return val;
      }
    })
  )
})

function __tauri_debounce(func, delay) {
  let timerId;

  return function () {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      func.apply(this, arguments);
    }, delay);
  };
}

function __tauri_throttle(func, delay) {
  let timerId;
  let lastExecTime = 0;
  return function () {
    const context = this;
    const args = arguments;
    const currentTime = Date.now();
    if (currentTime - lastExecTime < delay) {
      clearTimeout(timerId);
      timerId = setTimeout(function () {
        lastExecTime = currentTime;
        func.apply(context, args);
      }, delay);
    } else {
      lastExecTime = currentTime;
      func.apply(context, args);
    }
  };
}

// 双指左划或右划实现页面的前进后退功能
window.addEventListener('load', () => {
  let allXPoints = [];
  let yPoint = [1, 1];
  const handleWheelEnd = __tauri_debounce(() => {
    if (allXPoints.length > 10 && yPoint[1] - yPoint[0] < 10) {
      if (allXPoints.every(d => d > 0)) {
        console.log("forward");
        window.history.forward();
      } else if (allXPoints.every(d => d < 0)) {
        console.log('back');
        window.history.back();
      }
    }
    allXPoints = [];
    yPoint = [1, 1];
  }, 80);
  const handleWheel = __tauri_throttle(event => {
    const { deltaX, deltaY } = event;
    const [min, max] = yPoint
    if (deltaY < min) {
      yPoint[0] = deltaY;
    }
    if (deltaY > max) {
      yPoint[1] = deltaY;
    }
    allXPoints.push(deltaX);
    // 判断是否是返回/前进
    // console.log(allXPoints, yPoint);
    handleWheelEnd();
  }, 50);
  window.addEventListener('wheel', handleWheel)
})

window.addEventListener('DOMContentLoaded', () => {
  const tauri = window.__TAURI__;
  const appWindow = tauri.window.appWindow;

  const topDom = document.createElement('div');
  topDom.id = 'pack-top-dom';
  document.body.appendChild(topDom);
  topDom.innerHTML = `
    <svg width="24" data-action="back" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M1.293 11.293a1 1 0 0 0 0 1.414l7 7a1 1 0 0 0 1.414-1.414L4.414 13H21a1 1 0 1 0 0-2H4.414l5.293-5.293a1 1 0 0 0-1.414-1.414l-7 7Z" fill="#2B2F36"/>
    </svg>
    <svg width="24" data-action="home" height="24" viewBox="0 0 24 24" fill="none">
      <path d="m20 10-8-5.939L4 10v10h5v-3.8a2.2 2.2 0 0 1 2.2-2.2h1.6a2.2 2.2 0 0 1 2.2 2.2V20h5V10Zm-9 11a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .75-1.562l8-5.938a2 2 0 0 1 2.5 0l8 5.938A2 2 0 0 1 22 10v10a2 2 0 0 1-2 2h-6a1 1 0 0 1-1-1v-4.8a.2.2 0 0 0-.2-.2h-1.6a.2.2 0 0 0-.2.2V21Z" fill="#2B2F36"/>
    </svg>
    <svg width="24" data-action="forward" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21.707 11.293a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414-1.414L18.586 13H2a1 1 0 1 1 0-2h16.586l-5.293-5.293a1 1 0 0 1 1.414-1.414l7 7Z" fill="#2B2F36"/>
    </svg>
  `
  const domEl = document.getElementById('pack-top-dom');

  topDom.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'svg') {
      return;
    }
    e.preventDefault();
    if (e.buttons === 1 && e.detail !== 2) {
      appWindow.startDragging().then();
    }
  });

  topDom.addEventListener('touchstart', () => {
    appWindow.startDragging().then();
  });

  topDom.addEventListener('click', e => {
    if (e.target.tagName === 'svg') {
      console.log(e.target.dataset);
      const action = e.target.dataset?.action;
      if (action === 'back') {
        window.history.back();
      } else if (action === 'forward') {
        window.history.forward();
      } else if (action === 'home') {
        window.location.href = '/';
      }
    }
  })
})

function __tauri_inject_style(content) {
  window.addEventListener('DOMContentLoaded', () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = content;
    document.head.appendChild(styleElement);
  })
}