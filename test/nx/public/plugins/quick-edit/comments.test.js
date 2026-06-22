import { expect } from '@esm-bundle/chai';
import {
  findBlockForProseIndex,
  scrollToProseIndex,
  setCommentMarkers,
} from '../../../../../nx/public/plugins/quick-edit/src/comments.js';

function buildBody() {
  document.body.innerHTML = `
    <main>
      <p data-prose-index="1">first</p>
      <p data-prose-index="20">second</p>
      <p data-prose-index="50">third</p>
    </main>`;
}

describe('quick-edit comments', () => {
  beforeEach(buildBody);
  afterEach(() => { document.body.innerHTML = ''; });

  it('findBlockForProseIndex picks the closest block at or before pos', () => {
    expect(findBlockForProseIndex(1).textContent).to.equal('first');
    expect(findBlockForProseIndex(25).textContent).to.equal('second');
    expect(findBlockForProseIndex(999).textContent).to.equal('third');
    expect(findBlockForProseIndex(0)).to.equal(null);
  });

  it('scrollToProseIndex scrolls the matching block into view', () => {
    let scrolled = null;
    const block = findBlockForProseIndex(25);
    block.scrollIntoView = () => { scrolled = block; };
    scrollToProseIndex(25);
    expect(scrolled).to.equal(block);
  });

  it('setCommentMarkers marks the right blocks and a click posts comment-marker-click', () => {
    const posted = [];
    const ctx = { port: { postMessage: (m) => posted.push(m) } };
    setCommentMarkers([{ proseIndex: 25, threadId: 't2' }], ctx);
    const marked = document.querySelector('[data-comment-marker]');
    expect(marked.getAttribute('data-prose-index')).to.equal('20');
    marked.querySelector('.qe-comment-marker').click();
    expect(posted[0]).to.deep.equal({ type: 'comment-marker-click', threadId: 't2' });
  });

  it('re-applying markers clears the previous set', () => {
    const ctx = { port: { postMessage() {} } };
    setCommentMarkers([{ proseIndex: 25, threadId: 't2' }], ctx);
    setCommentMarkers([{ proseIndex: 50, threadId: 't3' }], ctx);
    const marked = document.querySelectorAll('[data-comment-marker]');
    expect(marked).to.have.lengthOf(1);
    expect(marked[0].getAttribute('data-prose-index')).to.equal('50');
  });
});
