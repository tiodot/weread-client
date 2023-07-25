function countdown(dom, total = 15) {
  countdown.retry = (countdown.retry || 0) + 1;
  const countdownNumberEl = dom.querySelector('.ti-countdown-number');
  const countdownCircleEl = dom.querySelector('.ti-countdown-circle');
  const initialOffset = 138.2;

  if (!countdownCircleEl || !countdownNumberEl) {
    countdown.retry <= 3 && setTimeout(() => {
      countdown(dom, total);
    }, 500)
    return;
  }

  // 设置倒计时开始时间和结束时间
  let startTime = Date.now();
  const endTime = startTime + total * 60 * 1000;

  // 更新倒计时数字和圆环的状态
  function updateCountdown() {
    const now = Date.now();
    const remainingTime = endTime - now;
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
    }
  }

  updateCountdown();
  // 每秒更新一次倒计时状态
  const countdownInterval = setInterval(updateCountdown, 1000);
  return () => {
    clearInterval(countdownInterval);
    countdownCircleEl.style.strokeDashoffset = -0.1; 
  };
}

function addCountdownDom() {
  console.log('add count down dome--->');
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
    const reset = countdown(countdownDom, 15);

    countdownDom.addEventListener('click', () => {
       reset();
       countdown(countdownDom, 15);
    })
  }
}

window.addEventListener('load', () => {
  addCountdownDom();
})

