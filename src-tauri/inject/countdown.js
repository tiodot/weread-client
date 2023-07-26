function countdown(dom, total = 15) {
  countdown.retry = (countdown.retry || 0) + 1;
  const countdownNumberEl = dom.querySelector('.ti-countdown-number');
  const countdownCircleEl = dom.querySelector('.ti-countdown-circle');
  const initialOffset = 138.2;
  let status = 'playing'; // done, pause

  if (!countdownCircleEl || !countdownNumberEl) {
    countdown.retry <= 3 && setTimeout(() => {
      countdown(dom, total);
    }, 500)
    return;
  }

  // 设置倒计时开始时间和结束时间
  let startTime = Date.now();
  let endTime = startTime + total * 60 * 1000;
  let remainingTime = endTime - startTime;

  // 更新倒计时数字和圆环的状态
  function updateCountdown() {
    const now = Date.now();
    remainingTime = endTime - now;
    const minutes = Math.ceil(remainingTime / 1000 / 60);

    // 更新倒计时数字
    countdownNumberEl.textContent = minutes;

    // 更新圆环状态
    const progress = 1 - remainingTime / (total * 60 * 1000);
    const offset = initialOffset * progress;
    countdownCircleEl.style.strokeDashoffset = -offset;

    // 检查倒计时是否结束
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownNumberEl.textContent = "✔";
      countdownCircleEl.style.strokeDashoffset = 0;
      status = 'done';
    }
  }

  updateCountdown();
  // 每秒更新一次倒计时状态
  let countdownInterval = setInterval(updateCountdown, 1000);

  const actions = {
    reset() {
      clearInterval(countdownInterval);
      countdownCircleEl.style.strokeDashoffset = -0.1;
    },
    pause() {
      clearInterval(countdownInterval);
      countdownNumberEl.textContent = '⏵';
      status = 'pause';
    },
    resume() {
      if (status === 'pause') {
        // 需要重新更新一个时间，避免计算出现问题
        endTime = remainingTime + Date.now();

        // 更新倒计时数字
        countdownNumberEl.textContent = Math.ceil(remainingTime / 1000 / 60);
        countdownInterval = setInterval(updateCountdown, 1000);
      }
      status = 'playing';
    },
    toggle() {
      if (status === 'done') {
        return countdown(dom, total);
      }
      if (status === 'playing') {
        actions.pause();
      } else {
        actions.resume();
      }
    }
  }
  return actions;
}

function addCountdownDom() {
  const countdownDom = document.createElement('div');
  countdownDom.classList.add('ti-countdown');
  countdownDom.classList.add('readerControls_item');
  countdownDom.innerHTML = `
    <div class="ti-countdown-number"></div>
    <svg class="ti-countdown-svg">
      <circle class="ti-countdown-circle" r="22" cx="24" cy="24"></circle>
    </svg>
  `
  if (document.querySelector('.readerControls')) {
    document.querySelector('.readerControls').appendChild(countdownDom);
    const countdownAction = countdown(countdownDom, 15);

    countdownDom.addEventListener('click', () => {
      countdownAction.toggle();
    })
  }
}

window.addEventListener('load', () => {
  addCountdownDom();
})

