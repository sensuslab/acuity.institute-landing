export function libraryArticleUrl(id: string) {
  return `https://acuity.institute/library/${encodeURIComponent(id)}/`;
}

export function showArticleShare(trigger: HTMLElement, url: string, title: string) {
  const dialog = document.createElement('dialog');
  dialog.className = 'article-share-dialog';
  dialog.setAttribute('aria-labelledby', 'article-share-title');
  dialog.setAttribute('aria-describedby', 'article-share-work');
  dialog.innerHTML = `
    <div class="article-share-panel">
      <header>
        <h2 id="article-share-title">Share this entry</h2>
        <form method="dialog"><button type="submit" aria-label="Close share dialog">×</button></form>
      </header>
      <p id="article-share-work"></p>
      <label for="article-share-url">Article link</label>
      <div class="article-share-controls">
        <input id="article-share-url" type="url" readonly spellcheck="false" />
        <button class="article-share-copy" type="button">Copy link</button>
      </div>
      <p class="article-share-status" role="status"></p>
    </div>
  `;

  const work = dialog.querySelector<HTMLElement>('#article-share-work')!;
  const input = dialog.querySelector<HTMLInputElement>('input')!;
  const copy = dialog.querySelector<HTMLButtonElement>('.article-share-copy')!;
  const status = dialog.querySelector<HTMLElement>('[role="status"]')!;
  work.textContent = title;
  input.value = url;

  let pressedBackdrop = false;
  dialog.addEventListener('pointerdown', event => { pressedBackdrop = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (pressedBackdrop && event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog.remove();
    trigger.focus({ preventScroll: true });
  }, { once: true });

  input.addEventListener('click', () => input.select());
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url);
      status.textContent = 'Link copied.';
    } catch {
      input.focus();
      input.select();
      status.textContent = 'Link selected. Copy it to share.';
    }
  });

  document.body.append(dialog);
  dialog.showModal();
  copy.focus();
}

if (typeof document !== 'undefined') {
  const articleTrigger = document.querySelector<HTMLButtonElement>('[data-article-share]');
  const articleCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const articleHeading = document.querySelector('article h1');
  if (articleTrigger && articleCanonical && articleHeading) {
    articleTrigger.addEventListener('click', () =>
      showArticleShare(articleTrigger, articleCanonical.href, articleHeading.textContent ?? ''),
    );
    articleTrigger.hidden = false;
  }
}
