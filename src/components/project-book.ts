/** Progressive enhancement: the server renders every project link before pagination is enabled. */
export function mountProjectBooks(): void {
  for (const book of document.querySelectorAll<HTMLElement>('[data-project-book]')) {
    if (book.dataset.bookReady) continue;
    const list = book.querySelector<HTMLElement>('[data-book-list]');
    const leaves = Array.from(book.querySelectorAll<HTMLElement>('[data-book-leaf]'));
    const controls = book.querySelector<HTMLElement>('[data-book-controls]');
    const previous = book.querySelector<HTMLButtonElement>('[data-book-prev]');
    const next = book.querySelector<HTMLButtonElement>('[data-book-next]');
    const status = book.querySelector<HTMLElement>('[data-book-status]');
    if (!list || !controls || !previous || !next || !status || leaves.length < 3) continue;

    let spread = 0;
    let turn: HTMLElement | null = null;
    let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
    let gesture: { id: number; x: number; y: number } | null = null;
    let suppressClickUntil = 0;
    const lastSpread = Math.ceil(leaves.length / 2) - 1;
    const clearTurn = () => {
      turn?.remove();
      turn = null;
      clearTimeout(cleanupTimer);
    };
    const render = () => {
      leaves.forEach((leaf, index) => { leaf.hidden = Math.floor(index / 2) !== spread; });
      previous.setAttribute('aria-disabled', String(spread === 0));
      next.setAttribute('aria-disabled', String(spread === lastSpread));
      status.textContent = `${book.dataset.bookPages} ${spread * 2 + 1}–${Math.min(spread * 2 + 2, leaves.length)} / ${leaves.length}`;
    };
    const goTo = (requested: number) => {
      const target = Math.max(0, Math.min(lastSpread, requested));
      if (target === spread) return;
      clearTurn();
      const forward = target > spread;
      const source = leaves[spread * 2 + (forward ? 1 : 0)] ?? leaves[spread * 2];
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion !== 'on';
      if (!reduced) {
        turn = source.cloneNode(true) as HTMLElement;
        turn.removeAttribute('data-book-leaf');
        turn.dataset.bookTurn = '';
        turn.setAttribute('aria-hidden', 'true');
        turn.inert = true;
        turn.classList.add('book-turn', forward ? 'book-turn-forward' : 'book-turn-back');
        turn.addEventListener('animationend', clearTurn, { once: true });
        list.append(turn);
        cleanupTimer = setTimeout(clearTurn, 600);
      }
      // A touch gesture may have focused an outgoing project; never leave focus in a hidden leaf.
      if (source.parentElement && leaves.some((leaf) => leaf.contains(document.activeElement))) {
        (forward ? next : previous).focus({ preventScroll: true });
      }
      spread = target;
      render();
    };
    previous.addEventListener('click', () => goTo(spread - 1));
    next.addEventListener('click', () => goTo(spread + 1));
    book.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const destinations: Record<string, number> = { ArrowLeft: spread - 1, ArrowRight: spread + 1, Home: 0, End: lastSpread };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      goTo(destinations[event.key]);
    });
    list.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch' || !event.isPrimary) return;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    list.addEventListener('pointerup', (event) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      gesture = null;
      if (Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
      suppressClickUntil = performance.now() + 400;
      goTo(spread + (dx < 0 ? 1 : -1));
    });
    list.addEventListener('pointercancel', () => { gesture = null; });
    list.addEventListener('click', (event) => {
      if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
    }, { capture: true });
    render();
    list.tabIndex = 0;
    controls.hidden = false;
    book.dataset.bookReady = 'true';
  }
}
