(() => {
  const header = document.querySelector('.site-header');
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const reveals = document.querySelectorAll('.reveal');
  const toast = document.getElementById('toast');

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 18);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  menuBtn?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }), { threshold: .12 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  document.querySelectorAll('.faq-list details').forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-list details').forEach(other => { if (other !== item) other.open = false; });
  }));

  const steps = [...document.querySelectorAll('.form-step')];
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');
  const progress = document.getElementById('simProgress');
  const counter = document.getElementById('stepCounter');
  const billRange = document.getElementById('billRange');
  const billValue = document.getElementById('billValue');
  let current = 0;
  let profile = '';

  const updateStep = () => {
    steps.forEach((s,i) => s.classList.toggle('active', i === current));
    progress.style.width = `${((current + 1) / steps.length) * 100}%`;
    counter.textContent = `0${current + 1} / 0${steps.length}`;
    backBtn.disabled = current === 0;
    nextBtn.innerHTML = current === steps.length - 1 ? 'Abrir no WhatsApp <span>→</span>' : 'Continuar <span>→</span>';
  };

  document.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.choice').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected'); profile = btn.dataset.value;
  }));

  document.querySelectorAll('[data-profile]').forEach(link => link.addEventListener('click', () => {
    const desired = link.dataset.profile; profile = desired;
    setTimeout(() => document.querySelectorAll('.choice').forEach(b => b.classList.toggle('selected', b.dataset.value === desired)), 250);
  }));

  billRange?.addEventListener('input', () => billValue.textContent = Number(billRange.value).toLocaleString('pt-BR'));

  const showToast = msg => { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); };
  const validPhone = v => v.replace(/\D/g,'').length >= 10;

  nextBtn?.addEventListener('click', () => {
    if (current === 0 && !profile) { showToast('Selecione residencial ou empresarial.'); return; }
    if (current < steps.length - 1) { current++; updateStep(); return; }
    const name = document.getElementById('leadName').value.trim();
    const city = document.getElementById('leadCity').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();
    if (!name || !city || !validPhone(phone)) { showToast('Preencha nome, cidade e um WhatsApp válido.'); return; }
    const bill = Number(billRange.value).toLocaleString('pt-BR');
    const msg = `Olá! Vim pelo simulador da SUN GOLD e gostaria de avaliar um projeto de energia solar.%0A%0A` +
      `Perfil: ${encodeURIComponent(profile)}%0A` +
      `Conta aproximada: R$ ${encodeURIComponent(bill)}/mês%0A` +
      `Nome: ${encodeURIComponent(name)}%0A` +
      `Cidade: ${encodeURIComponent(city)}%0A` +
      `Meu WhatsApp: ${encodeURIComponent(phone)}%0A%0A` +
      `Gostaria de receber uma análise do meu caso.`;
    window.open(`https://wa.me/5532984494714?text=${msg}`, '_blank', 'noopener');
  });

  backBtn?.addEventListener('click', () => { if (current > 0) { current--; updateStep(); } });

  const phoneInput = document.getElementById('leadPhone');
  phoneInput?.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g,'').slice(0,11);
    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length) v = `(${v}`;
    e.target.value = v;
  });

  updateStep();
})();
