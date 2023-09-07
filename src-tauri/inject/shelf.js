document.addEventListener('DOMContentLoaded', () => {
  if (!location.pathname.startsWith('/web/shelf')) {
    return;
  }
  // 获取所有的bookId；
  const bookIds = window.__tauri__origin_state__.shelf.rawIndexes.map(i => i.bookId);
  // [title]: info, 如果 title有重复，则根据cover判断
  const bookMap = {};

  const addStatusTag = () => {
    document.querySelectorAll('.shelfBook .title').forEach(node => {
      const title = node.textContent;
      if (node.nextElementSibling) return;
      let bookInfo = bookMap[title];
      if (!bookInfo) return;
      if (bookInfo.length > 1) {
        // 通过cover获取对应的title
        const cover = node.previousElementSibling.querySelector('img').src;
        bookInfo = bookInfo.filter(book => book.cover === cover);
      }
      if (bookInfo.length === 1) {
        const [book] = bookInfo;
        if (book.progress) {
          const span = document.createElement('span');
          Object.assign(span.style, {
            background: book.finished ? '#fed4a4' : '#f8e6ab',
            position: 'absolute',
            top: 0,
            left: 0,
            padding: '2px 6px',
            'border-radius': '0 10px 10px 0'
          })
          span.innerText = book.finished ? '读完' : `已读 ${book.progress}%`;
          node.parentNode.appendChild(span);
        }
      }
    })
  }

  if (bookIds && bookIds.length) {

    fetch('/web/shelf/syncBook', {
      method: 'post',
      body: JSON.stringify({
        bookIds,
        count: 100,
        isArchive: null
      }),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }).then(res => res.json()).then(res => {
      // [id]: progress
      const bookProgress = {};
      res.bookProgress.map(book => {
        bookProgress[book.bookId] = book.progress;
      })

      res.books.map(book => {
        const currentProgress = bookProgress[book.bookId];
        const bookInfo = {
          id: book.bookId,
          progress: currentProgress,
          cover: book.cover,
          category: book.category,
          rating: book.newRatingDetail.title,
          finished: book.finishReading
        }
        if (!bookMap[book.title]) {
          bookMap[book.title] = [];
        }
        bookMap[book.title].push(bookInfo);
      })
    }).then(() => {
      setTimeout(addStatusTag, 1000);
    });


    // 监听数据变化，然后重新设置tag
    setTimeout(() => {
      const ob = new MutationObserver((records, observer) => {
        console.log('record--->');
        setTimeout(addStatusTag, 200)
      })
      ob.observe(document.querySelector('.shelf_list'), { childList: true, subtree: true });

    }, 5000);
  }
})