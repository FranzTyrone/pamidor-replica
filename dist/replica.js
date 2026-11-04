/* Static replica compatibility. Original public presentation assets are preserved. */
(() => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, options) => {
    const raw = typeof input === 'string' ? input : input.url;
    const url = new URL(raw, location.href);
    if (url.searchParams.has('_rsc')) return originalFetch(input, options);
    if (url.pathname.startsWith('/api/')) {
      return Promise.resolve(new Response(JSON.stringify({error:'This replica has no live backend.'}), {status:503, headers:{'Content-Type':'application/json'}}));
    }
    return originalFetch(input, options);
  };
  window.addEventListener('load', () => setTimeout(() => {
    for (const form of document.querySelectorAll('form')) {
      const button = form.querySelector('[type="submit"]');
      if (button) button.textContent = 'Create Email Draft';
      const note = document.createElement('p');
      note.style.cssText='font-size:13px;line-height:1.5;margin-top:12px;opacity:.8';
      note.textContent='This replica prepares a draft in your email app. Review and send it there.';
      form.append(note);
    }
  }, 1500));
  // Full document navigation keeps every exported route independent of Next's server runtime.
  window.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.download || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname.replace(/\/$/,'') === location.pathname.replace(/\/$/,'')) return;
    event.preventDefault(); event.stopImmediatePropagation();
    location.assign(url.pathname.replace(/\/$/,'') + '/' + url.search + url.hash);
  }, true);
  window.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const email = form.querySelector('[name="email"]');
    const name = form.querySelector('[name="name"]');
    if (email) email.required = true;
    if (name) name.required = true;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = name ? String(data.get('reason') || 'Project inquiry') : 'Art drop updates inquiry';
    const body = name
      ? `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || ''}\n\n${data.get('message') || ''}`
      : `Please let me know about future art drops.\nEmail: ${data.get('email')}`;
    location.href = 'mailto:dor@pamidordesign.co?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    let note = form.querySelector('[data-replica-status]');
    if (!note) { note = document.createElement('p'); note.dataset.replicaStatus=''; note.role='status'; note.style.cssText='font-size:14px;line-height:1.5;margin-top:16px'; form.append(note); }
    note.textContent = 'Email draft prepared. Review and send it in your email app; no message has been sent by this replica.';
  }, true);
})();
