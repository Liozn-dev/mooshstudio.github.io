document.addEventListener('DOMContentLoaded', () => {

  /* ===== Tabs (Resume section) ===== */
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.resume-tab-content');

  if (tabs.length && contents.length) {
    const activate = (targetName) => {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.target === targetName));
      contents.forEach(c => c.classList.toggle('active', c.classList.contains(targetName)));
      const activeContent = document.querySelector('.resume-tab-content.active');
      if (activeContent) activeContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    tabs.forEach(tab => {
      tab.setAttribute('role', 'button');
      tab.setAttribute('tabindex', '0');

      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = tab.dataset.target;
        if (!target) return;
        activate(target);
      });

      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tab.click();
        }
      });
    });

    if (!document.querySelector('.tab-btn.active')) {
      const first = tabs[0];
      if (first) activate(first.dataset.target);
    }
  }

  /* ===== Service modal / widget ===== */
  const serviceButtons = document.querySelectorAll('.service-item');
  const serviceModal = document.getElementById('service-modal');
  const serviceModalTitle = serviceModal ? serviceModal.querySelector('#service-modal-title') : null;
  const serviceModalContent = serviceModal ? serviceModal.querySelector('#service-modal-content') : null;
  const serviceModalCloseBtn = serviceModal ? serviceModal.querySelector('.service-modal-close') : null;
  const serviceModalCta = serviceModal ? serviceModal.querySelector('.service-modal-cta') : null;

  function openServiceModal(title, description) {
    if (!serviceModal) return;

    // --- mapear programas para ícones (ajuste caminhos se necessário) ---
    const programMap = {
      'photoshop': 'assets/css/images/icons/icons8-adobe-50-2.svg',
      'illustrator': 'assets/css/images/icons/icons8-adobe-50.svg',
      'clip studio': 'assets/css/images/icons/icons8-clip-studio-paint-50.svg',
      'clipstudio': 'assets/css/images/icons/icons8-clip-studio-paint-50.svg',
      'krita': 'assets/css/images/icons/icons8-krita-50.svg',
      'procreate': '' // coloque caminho se tiver ícone
    };

    // detectar programas mencionados na descrição (case-insensitive)
    const foundPrograms = [];
    const descLower = (description || '').toLowerCase();
    for (const key of Object.keys(programMap)) {
      if (programMap[key] && descLower.includes(key)) foundPrograms.push(key);
    }

    // limpar menções simples dos nomes encontrados para evitar duplicação
    let cleanedDescription = description || '';
    if (foundPrograms.length) {
      foundPrograms.forEach(k => {
        const re = new RegExp('\\b' + k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'gi');
        cleanedDescription = cleanedDescription.replace(re, '').replace(/\s{2,}/g, ' ').trim();
      });
    }

    // popular título e descrição limpa
    if (serviceModalTitle) serviceModalTitle.textContent = title || '';
    if (serviceModalContent) serviceModalContent.textContent = cleanedDescription;

    // criar/atualizar container de icons dentro do modal (reaproveita .portfolio-tools CSS)
    let toolsContainer = serviceModal.querySelector('.portfolio-tools');
    if (!toolsContainer) {
      toolsContainer = document.createElement('div');
      toolsContainer.className = 'portfolio-tools';
      // insere antes das ações (se existir) para ficar acima do CTA
      const actions = serviceModal.querySelector('.service-modal-actions');
      if (actions) actions.parentNode.insertBefore(toolsContainer, actions);
      else serviceModal.appendChild(toolsContainer);
    }
    toolsContainer.innerHTML = '';

    // adicionar ícones
    foundPrograms.forEach(k => {
      const iconPath = programMap[k];
      if (!iconPath) return;
      const wrap = document.createElement('span');
      wrap.className = 'tool-icon';
      const img = document.createElement('img');
      img.src = iconPath;
      img.alt = k;
      img.title = k.charAt(0).toUpperCase() + k.slice(1);
      img.loading = 'lazy';
      wrap.appendChild(img);
      toolsContainer.appendChild(wrap);
    });

    // guarda o serviço (já existia) e abre modal
    serviceModal.dataset.service = title || '';
    serviceModal.setAttribute('aria-hidden', 'false');
    // adicionar classe global que indica modal aberto
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    serviceModal.focus();
  }

  function closeServiceModal() {
    if (!serviceModal) return;
    serviceModal.setAttribute('aria-hidden', 'true');
    // remover classe global
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    if (serviceModalTitle) serviceModalTitle.textContent = '';
    if (serviceModalContent) serviceModalContent.textContent = '';
    delete serviceModal.dataset.service;
    // remover container de tools para limpar estado
    const toolsContainer = serviceModal.querySelector('.portfolio-tools');
    if (toolsContainer) toolsContainer.remove();
  }

  serviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.title || '';
      const description = btn.dataset.description || '';
      openServiceModal(title, description);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // fechar quando clicar no overlay (ou em elementos marcados com data-close="true")
  if (serviceModal) {
    serviceModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('service-modal-overlay') || e.target.dataset.close === 'true') {
        closeServiceModal();
      }
    });
  }

  if (serviceModalCloseBtn) {
    serviceModalCloseBtn.addEventListener('click', closeServiceModal);
  }

  // fechar com ESC para service modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && serviceModal && serviceModal.getAttribute('aria-hidden') === 'false') {
      closeServiceModal();
    }
  });

  /* ===== CTA do service modal: rolar para a seção de contato e preencher serviço ===== */
  if (serviceModalCta) {
    serviceModalCta.addEventListener('click', (e) => {
      const targetSelector = serviceModalCta.dataset.target || '#contact';
      const serviceName = serviceModal && serviceModal.dataset.service ? serviceModal.dataset.service : '';

      // fechar modal primeiro
      closeServiceModal();

      // esperar um pouco para a UI atualizar/scroll
      setTimeout(() => {
        const targetEl = document.querySelector(targetSelector);
        if (!targetEl) return;

        // rola suavemente para a seção de contato
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // tenta focar o primeiro input/textarea/select/button disponível dentro da seção
        const focusable = targetEl.querySelector('input, textarea, select, button, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
          setTimeout(() => focusable.focus(), 300);
        }

        // preencher campo hidden "service" no formulário (cria se necessário)
        const form = targetEl.querySelector('form') || document.querySelector('#contact form');
        if (form) {
          const serviceSelect = form.querySelector('#contact-service');
          if (serviceSelect) {
            serviceSelect.value = serviceName;
          }
        }
      }, 180);
    });
  }

  /* ===== Portfolio modal + carousel ===== */
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const portfolioModal = document.getElementById('portfolio-modal');
  const pModalTitle = portfolioModal ? portfolioModal.querySelector('#portfolio-modal-title') : null;
  const pModalDescription = portfolioModal ? portfolioModal.querySelector('#portfolio-modal-description') : null;
  const track = portfolioModal ? portfolioModal.querySelector('.carousel-track') : null;
  const dotsWrap = portfolioModal ? portfolioModal.querySelector('.carousel-dots') : null;
  const prevBtn = portfolioModal ? portfolioModal.querySelector('.carousel-prev') : null;
  const nextBtn = portfolioModal ? portfolioModal.querySelector('.carousel-next') : null;
  const closeBtn = portfolioModal ? portfolioModal.querySelector('.portfolio-modal-close') : null;

  let slides = [];
  let current = 0;

  function openPortfolioModal(title, description, images) {
    if (!portfolioModal) return;
    if (!track || !dotsWrap) return;

    // limpar track e dots
    track.innerHTML = '';
    dotsWrap.innerHTML = '';
    slides = [];

    if (pModalTitle) pModalTitle.textContent = title || '';
    if (pModalDescription) pModalDescription.textContent = description || '';

    // --- detectar programas mencionados e mapear para ícones existentes ---
    const programMap = {
      'photoshop': 'assets/css/images/icons/icons8-adobe-50-2.svg',
      'illustrator': 'assets/css/images/icons/icons8-adobe-50.svg',
      'clip studio': 'assets/css/images/icons/icons8-clip-studio-paint-50.svg',
      'clipstudio': 'assets/css/images/icons/icons8-clip-studio-paint-50.svg',
      'krita': 'assets/css/images/icons/icons8-krita-50.svg',
      'procreate': '' // se tiver ícone, indique o caminho aqui
    };

    // detectar palavras (case-insensitive)
    const foundPrograms = [];
    const descLower = (description || '').toLowerCase();

    for (const key of Object.keys(programMap)) {
      if (programMap[key] && descLower.includes(key)) {
        foundPrograms.push(key);
      }
    }

    // se encontrou, remove menções básicas dos nomes (para evitar duplicação)
    let cleanedDescription = description || '';
    if (foundPrograms.length) {
      foundPrograms.forEach(k => {
        // remover ocorrência simples (caso sensível ao idioma); usa regex global
        const re = new RegExp('\\b' + k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'gi');
        cleanedDescription = cleanedDescription.replace(re, '').replace(/\s{2,}/g, ' ').trim();
      });
    }

    if (pModalDescription) {
      pModalDescription.textContent = cleanedDescription;
    }

    // criar slides
    images.forEach((src, idx) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      if (idx === 0) slide.classList.add('active');
      const img = document.createElement('img');
      img.src = src;
      img.alt = title + ' — ' + (idx + 1);
      img.loading = 'lazy';
      slide.appendChild(img);
      track.appendChild(slide);
      slides.push(slide);

      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Slide ' + (idx + 1));
      dot.addEventListener('click', () => goTo(idx));
      dotsWrap.appendChild(dot);
    });

    // criar/atualizar a área de icons dos programas (portfolio-tools)
    // garante que exista um container na .portfolio-info
    let toolsContainer = portfolioModal.querySelector('.portfolio-tools');
    if (!toolsContainer) {
      toolsContainer = document.createElement('div');
      toolsContainer.className = 'portfolio-tools';
      if (portfolioModal.querySelector('.portfolio-info')) {
        portfolioModal.querySelector('.portfolio-info').appendChild(toolsContainer);
      }
    }
    toolsContainer.innerHTML = ''; // limpa

    foundPrograms.forEach(k => {
      const iconPath = programMap[k];
      if (!iconPath) return;
      const wrap = document.createElement('span');
      wrap.className = 'tool-icon';
      const img = document.createElement('img');
      img.src = iconPath;
      img.alt = k;
      img.title = k.charAt(0).toUpperCase() + k.slice(1);
      img.loading = 'lazy';
      wrap.appendChild(img);
      toolsContainer.appendChild(wrap);
    });

    // ativar primeiro dot
    current = 0;
    updateDots();

    portfolioModal.setAttribute('aria-hidden', 'false');
    // adicionar classe global que indica modal aberto
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    portfolioModal.focus();
  }

  function closePortfolioModal() {
    if (!portfolioModal) return;
    portfolioModal.setAttribute('aria-hidden', 'true');
    // remover classe global
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    if (track) track.innerHTML = '';
    if (dotsWrap) dotsWrap.innerHTML = '';
    slides = [];
    current = 0;
  }

  function goTo(index) {
    if (!slides.length) return;
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
    current = index;
    updateDots();
  }

  function updateDots() {
    if (!dotsWrap) return;
    const dots = Array.from(dotsWrap.children);
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() {
    if (!slides.length) return;
    const nextIndex = (current + 1) % slides.length;
    goTo(nextIndex);
  }
  function prev() {
    if (!slides.length) return;
    const prevIndex = (current - 1 + slides.length) % slides.length;
    goTo(prevIndex);
  }

  // bind items
  if (portfolioItems && portfolioItems.length && portfolioModal) {
    portfolioItems.forEach(item => {
      const title = item.dataset.title || '';
      const desc = item.dataset.description || '';
      const raw = item.dataset.images || '';
      const images = raw.split(',').map(s => s.trim()).filter(Boolean);

      function handlerOpen() {
        openPortfolioModal(title, desc, images);
      }
      item.addEventListener('click', handlerOpen);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlerOpen();
        }
      });
    });

    // controls
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (closeBtn) closeBtn.addEventListener('click', closePortfolioModal);

    // click overlay to close
    portfolioModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('portfolio-modal-overlay')) closePortfolioModal();
    });

    // keyboard support while portfolio modal open
    document.addEventListener('keydown', (e) => {
      if (!portfolioModal || portfolioModal.getAttribute('aria-hidden') === 'true') return;
      if (e.key === 'Escape') closePortfolioModal();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

});

/* ===== Contact Form Setup ===== */
(function contactFormSetup() {
    const FORM = document.getElementById('contact-form');
    const NOTE = document.getElementById('contact-form-note');

    if (FORM) {
        FORM.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = FORM.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            
            if (NOTE) NOTE.textContent = 'Enviando mensagem...';
            
            try {
                const templateParams = {
                    from_name: document.getElementById('contact-name').value,
                    from_email: document.getElementById('contact-email').value,
                    message: document.getElementById('contact-message').value,
                    service: document.getElementById('contact-service').value // Agora usando o select
                };

                console.log('Enviando email com params:', templateParams);

                const response = await emailjs.send(
                    'service_alon9ns',
                    'template_veowb0s',
                    templateParams
                );

                console.log('Email enviado!', response);
                if (NOTE) NOTE.textContent = 'Mensagem enviada com sucesso!';
                FORM.reset();
            } catch (error) {
                console.error('Erro ao enviar:', error);
                if (NOTE) NOTE.textContent = 'Erro ao enviar. Por favor, tente novamente.';
            } finally {
                submitButton.disabled = false;
            }
        });
    }
})();

// Inject modal-related CSS into the document to avoid raw CSS inside the JS file
(function injectModalCSS() {
  const css = `
/* Forçar modais acima de tudo e esconder bottom-nav enquanto eles estiverem abertos */
.service-modal,
.portfolio-modal {
  z-index: 200000 !important;
  position: fixed; /* garantir posição de empilhamento */
}

/* modal panels acima do overlay */
.service-modal-panel,
.portfolio-modal-panel {
  z-index: 200001 !important;
  position: relative;
}

/* tornar o bottom nav e o show-btn mais "baixos" (seguro) */
.bottom-nav,
.menu-show-btn,
.bottom-nav-container {
  z-index: 1000 !important;
}

/* quando um modal estiver aberto, esconder o bottom nav/btn para evitar sobreposição */
body.modal-open .bottom-nav,
body.modal-open .menu-show-btn,
body.modal-open .bottom-nav-container {
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
  transform: translateY(8px);
  transition: visibility .15s, opacity .15s, transform .15s;
}

/* pequeno ajuste visual caso queira que o overlay cubra também header fixo */
body.modal-open .moosh-header {
  /* opcional: ocultar header também se preferir */
  /* visibility: hidden; pointer-events: none; */
}
`;
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
})();

(function setFooterYear() {
  try {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  } catch (e) {
    // noop
  }
})();