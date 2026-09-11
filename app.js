(() => {
  const header = document.querySelector('.site-header');
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const reveals = document.querySelectorAll('.reveal');
  const toast = document.getElementById('toast');

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 18);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  menuBtn?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
    }), { threshold: .12 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  document.querySelectorAll('.faq-list details').forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-list details').forEach(other => { if (other !== item) other.open = false; });
  }));

  const form = document.getElementById('solarForm');
  if (!form) return;

  const steps = [...form.querySelectorAll('.form-step[data-step]:not([data-step="result"])')];
  const resultStep = form.querySelector('.form-step[data-step="result"]');
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');
  const progress = document.getElementById('simProgress');
  const counter = document.getElementById('stepCounter');
  const stepLabel = document.getElementById('stepLabel');
  const resultSummary = document.getElementById('resultSummary');

  const state = { profile: '', bill: '', goal: '', timeline: '', result: false };
  let current = 0;

  const showToast = message => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  const visibleStep = () => state.result ? resultStep : steps[current];

  const updateStep = () => {
    [...steps, resultStep].forEach(step => step.classList.remove('active'));
    visibleStep().classList.add('active');
    const number = state.result ? 5 : current + 1;
    progress.style.width = `${(number / 5) * 100}%`;
    counter.textContent = state.result ? 'PRONTO' : `0${number} / 05`;
    stepLabel.textContent = visibleStep().dataset.label || '';
    backBtn.disabled = current === 0 && !state.result;
    nextBtn.innerHTML = state.result ? 'Abrir no WhatsApp <span>→</span>' : (current === 4 ? 'Gerar meu resumo <span>→</span>' : 'Continuar <span>→</span>');
  };

  const selectChoice = button => {
    const group = button.dataset.group;
    if (!group) return;
    form.querySelectorAll(`[data-group="${group}"]`).forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    state[group] = button.dataset.value || '';
  };

  form.querySelectorAll('.choice[data-group]').forEach(btn => btn.addEventListener('click', () => selectChoice(btn)));

  document.querySelectorAll('[data-profile]').forEach(link => link.addEventListener('click', () => {
    const value = link.dataset.profile;
    state.profile = value;
    setTimeout(() => {
      form.querySelectorAll('[data-group="profile"]').forEach(btn => btn.classList.toggle('selected', btn.dataset.value === value));
    }, 250);
  }));

  const validations = [
    () => state.profile || 'Selecione residencial ou empresarial.',
    () => state.bill || 'Selecione a faixa aproximada da conta.',
    () => state.goal || 'Selecione seu objetivo principal.',
    () => state.timeline || 'Selecione quando pretende avançar.',
    () => {
      const name = document.getElementById('leadName').value.trim();
      const city = document.getElementById('leadCity').value.trim();
      const phone = document.getElementById('leadPhone').value.trim();
      const consent = document.getElementById('leadConsent').checked;
      if (!name || !city) return 'Preencha seu nome e cidade.';
      if (phone.replace(/\D/g, '').length < 10) return 'Informe um WhatsApp válido.';
      if (!consent) return 'Confirme que deseja enviar os dados pelo WhatsApp.';
      return true;
    }
  ];

  const buildSummary = () => {
    const items = [
      ['TIPO DE PROJETO', state.profile],
      ['FAIXA DA CONTA', state.bill],
      ['OBJETIVO', state.goal],
      ['PRAZO', state.timeline],
      ['CIDADE', document.getElementById('leadCity').value.trim()],
      ['CONTATO', document.getElementById('leadPhone').value.trim()]
    ];
    resultSummary.innerHTML = items.map(([label, value]) => `<div class="result-item"><small>${label}</small><strong>${value}</strong></div>`).join('');
  };

  const openWhatsApp = () => {
    const name = document.getElementById('leadName').value.trim();
    const city = document.getElementById('leadCity').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();
    const message = [
      'Olá! Vim pela análise de perfil da SUN GOLD e gostaria de avaliar um projeto de energia solar.',
      '',
      `Perfil: ${state.profile}`,
      `Faixa da conta: ${state.bill}`,
      `Objetivo: ${state.goal}`,
      `Prazo: ${state.timeline}`,
      `Nome: ${name}`,
      `Cidade: ${city}`,
      `Meu WhatsApp: ${phone}`,
      '',
      'Gostaria de receber uma análise inicial do meu caso.'
    ].join('\n');
    window.open(`https://wa.me/5532984494714?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  };

  nextBtn.addEventListener('click', () => {
    if (state.result) { openWhatsApp(); return; }
    const result = validations[current]();
    if (result !== true) { showToast(result); return; }
    if (current < steps.length - 1) { current++; updateStep(); return; }
    buildSummary();
    state.result = true;
    updateStep();
  });

  backBtn.addEventListener('click', () => {
    if (state.result) { state.result = false; current = 4; updateStep(); return; }
    if (current > 0) { current--; updateStep(); }
  });

  const phoneInput = document.getElementById('leadPhone');
  phoneInput.addEventListener('input', event => {
    let value = event.target.value.replace(/\D/g, '').slice(0, 11);
    if (value.length > 6) value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    else if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    else if (value.length) value = `(${value}`;
    event.target.value = value;
  });

  updateStep();
})();
