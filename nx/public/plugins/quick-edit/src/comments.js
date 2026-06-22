export function findBlockForProseIndex(proseIndex, root = document) {
  let best = null;
  let bestIndex = -1;
  root.querySelectorAll('[data-prose-index]').forEach((el) => {
    const idx = parseInt(el.getAttribute('data-prose-index'), 10);
    if (Number.isNaN(idx) || idx > proseIndex) return;
    if (idx > bestIndex) {
      bestIndex = idx;
      best = el;
    }
  });
  return best;
}

export function scrollToProseIndex(proseIndex, root = document) {
  findBlockForProseIndex(proseIndex, root)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearCommentMarkers(root = document) {
  root.querySelectorAll('[data-comment-marker]').forEach((el) => {
    el.removeAttribute('data-comment-marker');
    el.querySelector(':scope > .qe-comment-marker')?.remove();
  });
}

export function applyCommentMarkers(ctx) {
  const root = document;
  clearCommentMarkers(root);
  (ctx.commentMarkers || []).forEach(({ proseIndex, threadId }) => {
    const block = findBlockForProseIndex(proseIndex, root);
    // One marker per block; first thread wins.
    if (!block || block.hasAttribute('data-comment-marker')) return;
    block.setAttribute('data-comment-marker', threadId);
    if (getComputedStyle(block).position === 'static') block.style.position = 'relative';
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'qe-comment-marker';
    dot.contentEditable = 'false';
    dot.setAttribute('aria-label', 'Open comment');
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      ctx.port?.postMessage({ type: 'comment-marker-click', threadId });
    });
    block.prepend(dot);
  });
}

export function setCommentMarkers(markers, ctx) {
  ctx.commentMarkers = markers || [];
  applyCommentMarkers(ctx);
}
