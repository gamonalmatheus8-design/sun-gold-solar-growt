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
    const open = mobileNav?.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(Boolean(open)));
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    }), { threshold: .12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  document.querySelectorAll('.faq-list details').forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-list details').forEach(other => {
      if (other !== item) other.open = false;
    });
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
  const phoneInput = document.getElementById('leadPhone');

  if (!steps.length || !resultStep || !nextBtn || !backBtn || !progress || !counter || !stepLabel || !resultSummary) return;

  const state = {
    profile: '',
    bill: '',
    goal: '',
    timeline: '',
    result: false
  };

  let current = 0;

  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  const visibleStep = () => state.result ? resultStep : steps[current];

  const updateStep = () => {
    [...steps, resultStep].forEach(step => step.classList.remove('active'));
    const active = visibleStep();
    active.classList.add('active');

    const number = state.result ? 5 : current + 1;
    progress.style.width = `${(number / 5) * 100}%`;
    counter.textContent = state.result ? 'PRONTO' : `0${number} / 05`;
    stepLabel.textContent = active.dataset.label || '';
    backBtn.disabled = current === 0 && !state.result;

    nextBtn.innerHTML = state.result
      ? 'Abrir no WhatsApp <span>→</span>'
      : current === 4
        ? 'Gerar meu resumo <span>→</span>'
        : 'Continuar <span>→</span>';
  };

  const selectChoice = button => {
    const group = button.dataset.group;
    if (!group || !(group in state)) return;

    form.querySelectorAll(`[data-group="${group}"]`).forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    state[group] = button.dataset.value || '';
  };

  form.querySelectorAll('.choice[data-group]').forEach(btn => {
    btn.addEventListener('click', () => selectChoice(btn));
  });

  document.querySelectorAll('[data-profile]').forEach(link => {
    link.addEventListener('click', () => {
      const value = link.dataset.profile || '';
      state.profile = value;
      form.querySelectorAll('[data-group="profile"]').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.value === value);
      });
    });
  });

  const validations = [
    () => state.profile ? true : 'Selecione residencial ou empresarial.',
    () => state.bill ? true : 'Selecione a faixa aproximada da conta.',
    () => state.goal ? true : 'Selecione seu objetivo principal.',
    () => state.timeline ? true : 'Selecione quando pretende avançar.',
    () => {
      const name = document.getElementById('leadName')?.value.trim() || '';
      const city = document.getElementById('leadCity')?.value.trim() || '';
      const phone = document.getElementById('leadPhone')?.value.trim() || '';
      const consent = Boolean(document.getElementById('leadConsent')?.checked);

      if (!name || !city) return 'Preencha seu nome e cidade.';
      if (phone.replace(/\D/g, '').length < 10) return 'Informe um WhatsApp válido.';
      if (!consent) return 'Confirme que deseja enviar os dados pelo WhatsApp.';
      return true;
    }
  ];

  const buildSummary = () => {
    const city = document.getElementById('leadCity')?.value.trim() || '';
    const phone = document.getElementById('leadPhone')?.value.trim() || '';

    const items = [
      ['TIPO DE PROJETO', state.profile],
      ['FAIXA DA CONTA', state.bill],
      ['OBJETIVO', state.goal],
      ['PRAZO', state.timeline],
      ['CIDADE', city],
      ['CONTATO', phone]
    ];

    resultSummary.innerHTML = items
      .map(([label, value]) => `<div class="result-item"><small>${label}</small><strong>${value}</strong></div>`)
      .join('');
  };

  const openWhatsApp = () => {
    const name = document.getElementById('leadName')?.value.trim() || '';
    const city = document.getElementById('leadCity')?.value.trim() || '';
    const phone = document.getElementById('leadPhone')?.value.trim() || '';

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

    const url = `https://wa.me/5532984494714?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  nextBtn.addEventListener('click', () => {
    if (state.result) {
      openWhatsApp();
      return;
    }

    const validationResult = validations[current]?.();
    if (validationResult !== true) {
      showToast(validationResult || 'Revise esta etapa para continuar.');
      return;
    }

    if (current < steps.length - 1) {
      current += 1;
      updateStep();
      return;
    }

    buildSummary();
    state.result = true;
    updateStep();
  });

  backBtn.addEventListener('click', () => {
    if (state.result) {
      state.result = false;
      current = steps.length - 1;
      updateStep();
      return;
    }

    if (current > 0) {
      current -= 1;
      updateStep();
    }
  });

  phoneInput?.addEventListener('input', event => {
    let value = event.target.value.replace(/\D/g, '').slice(0, 11);

    if (value.length > 6) value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    else if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    else if (value.length) value = `(${value}`;

    event.target.value = value;
  });

  updateStep();
})();
