function __tauri_countdown(dom, total = 15) {
  __tauri_countdown.retry = (__tauri_countdown.retry || 0) + 1;
  const countdownNumberEl = dom.querySelector('.ti-countdown-number');
  const countdownCircleEl = dom.querySelector('.ti-countdown-circle');
  const initialOffset = 138.2;
  let status = 'playing'; // done, pause

  if (!countdownCircleEl || !countdownNumberEl) {
    __tauri_countdown.retry <= 3 && setTimeout(() => {
      __tauri_countdown(dom, total);
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
      // 避免进度条变动
      countdownCircleEl.style.strokeDashoffset = -(initialOffset - 0.05);
      status = 'done';
      __tauri_record(total);
    }
  }

  // updateCountdown();
  // 每秒更新一次倒计时状态
  let countdownInterval = setInterval(updateCountdown, 1000);

  const actions = {
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
        countdownCircleEl.style.strokeDashoffset = -0.1;
        countdownNumberEl.textContent = total;
        startTime = Date.now();
        endTime = startTime + total * 60 * 1000;
        remainingTime = endTime - startTime;
        countdownInterval = setInterval(updateCountdown, 1000);
        status = 'playing';
      } else if (status === 'playing') {
        actions.pause();
      } else {
        actions.resume();
      }
    }
  }
  return actions;
}

async function __tauri_record(duration = 15, bookTitle) {
  const invoke = window.__TAURI__.invoke
  if (invoke) {
    const date = new Date();
    const time = date.toTimeString().split(' ')[0];
    const datetime = date.toISOString().replace(/T[\s\S]+$/, ` ${time}`);
    console.log('datetime:', datetime);
    bookTitle = bookTitle || document.querySelector('.readerTopBar_title_link')?.innerText || ''
    const [rowsAffected, lastInsertId] = await invoke(
      "plugin:sql|execute",
      {
        db: 'sqlite:weread.db',
        query: `INSERT INTO count (created_datetime, duration, description) VALUES ($1, $2, $3)`,
        values: [datetime, duration, bookTitle.trim()],
      },
    )
    console.log('RowAffected', rowsAffected, lastInsertId);
  }
}

window.addEventListener('load', async () => {
  // 插入倒计时节点
  const countdownDom = document.createElement('div');
  countdownDom.classList.add('ti-countdown');
  countdownDom.classList.add('readerControls_item');
  countdownDom.innerHTML = `
    <div class="ti-countdown-number"></div>
    <svg class="ti-countdown-svg">
      <circle class="ti-countdown-circle" r="22" cx="24" cy="24"></circle>
    </svg>
  `
  const addCountdownDom = (total = 15) => {
    console.log('total--->', total);
    document.querySelector('.readerControls').appendChild(countdownDom);
    const countdownAction = __tauri_countdown(countdownDom, total);

    countdownDom.addEventListener('click', () => {
      countdownAction.toggle();
    })
    // 支持 command + s 暂停/恢复/重新计时
    document.addEventListener('keydown', (event) => {
      // 针对body做特殊按键处理
      if ('BODY' === event.target.tagName && event.key === 's' && event.metaKey) {
        countdownAction.toggle();
      }
    })
  }
  const invoke = window.__TAURI__.invoke
  if (document.querySelector('.readerControls')) {
    invoke('plugin:store|get', {path: 'weread.setting.json', key: 'countdown'}).then(addCountdownDom)
  }
  // 判断数据库是否存在，不存在时则新建一个
  if (invoke) {
    const dbPath = 'sqlite:weread.db';
    const db = await invoke("plugin:sql|load", {
      db: dbPath,
    });
    console.log('connected sqlite db:', db);
    const [rowsAffected, lastInsertId] = await invoke(
      "plugin:sql|execute",
      {
        db: dbPath,
        query: `
        CREATE TABLE IF NOT EXISTS count (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_datetime DATETIME,
          duration INTEGER,
          description TEXT
        );
        `,
        values: [],
      },
    )
    console.log('result:', rowsAffected, lastInsertId);
  }
})