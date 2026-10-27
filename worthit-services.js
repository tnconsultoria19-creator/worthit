(() => {
  "use strict";

  const services = [
    {
      id: "sites", number: "01", category: "LOCALIZAÇÃO",
      title: "Aquisição de Sites & Inteligência de Localização",
      image: "https://images.pexels.com/photos/13801685/pexels-photo-13801685.jpeg?auto=compress&dpr=1&h=750&w=1260",
      cardTitle: "Localização de sites",
      alt: "Duas pessoas a apertar as mãos, representando a coordenação com proprietários e parceiros.",
      intro: "Procuramos terrenos, edifícios, rooftops e outros locais adequados ao projecto, incluindo pontos para telecomunicações.",
      detail: "Reunimos informação disponível, requisitos e contactos para comparar opções. Estudos técnicos, avaliações formais e diligências específicas são definidos à parte.",
      bullets: ["Pesquisa de terrenos, edifícios e rooftops", "Localização de sites para telecomunicações", "Levantamento inicial de informação e documentação", "Contacto e coordenação com proprietários"]
    },
    {
      id: "procurement", number: "02", category: "FORNECIMENTO", title: "Procurement & Sourcing",
      image: "https://images.pexels.com/photos/4483860/pexels-photo-4483860.jpeg?auto=compress&dpr=1&h=750&w=1260",
      cardTitle: "Produtos e fornecedores",
      alt: "Trabalhadores a organizar mercadoria numa área de armazém.", intro: "Procuramos produtos, materiais e equipamentos com base nas especificações, quantidades, prazo e orçamento.",
      detail: "Comparamos fornecedores e cotações quando disponíveis. Preços, stock, transporte e condições são confirmados antes da compra.",
      bullets: ["Materiais e equipamentos de construção", "Veículos, maquinaria e peças sobressalentes", "Equipamento de escritório e consumíveis", "Pesquisa, cotações e comparação de fornecedores"]
    },
    {
      id: "expansion", number: "03", category: "NEGÓCIOS", title: "Instalação & Expansão de Negócios",
      image: "https://images.pexels.com/photos/14589851/pexels-photo-14589851.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=750&w=1260",
      cardTitle: "Instalação e expansão",
      alt: "Edifícios modernos numa zona urbana.", intro: "Apoiamos empresas que querem abrir uma operação, instalar instalações ou crescer em Angola.",
      detail: "Coordenamos pesquisa local, fornecedores e contactos para organizar os passos acordados. Registos, licenças e serviços especializados dependem do âmbito e das entidades responsáveis.",
      bullets: ["Pesquisa de instalações e zonas comerciais ou industriais", "Identificação de serviços locais necessários", "Contacto com fornecedores e prestadores", "Coordenação dos passos de entrada ou expansão"]
    },
  ];

  const grid = document.getElementById("worthit-service-grid");
  if (!grid) return;
  const escapeHtml = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  grid.innerHTML = services.map(service => `
    <button type="button" class="worthit-service-card" id="service-${service.id}" data-service-open="${service.id}" aria-haspopup="dialog" aria-label="Saber mais sobre ${escapeHtml(service.title)}">
      <span class="worthit-service-image"><img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.alt)}" loading="lazy"></span>
      <span class="worthit-service-caption">${escapeHtml(service.cardTitle || service.title)}</span>
      <span class="worthit-service-action">VER O QUE INCLUI ↗</span>
    </button>
  `).join("");

  const dialog = document.createElement("dialog");
  dialog.id = "worthit-service-dialog";
  dialog.className = "worthit-service-dialog";
  dialog.setAttribute("aria-labelledby", "worthit-dialog-title");
  dialog.innerHTML = `
    <div class="worthit-dialog-shell">
      <div class="worthit-dialog-hero">
        <img id="worthit-dialog-image" src="" alt="">
        <div class="worthit-dialog-hero-shade"></div>
        <button type="button" class="worthit-dialog-close" aria-label="Fechar detalhes do serviço" data-dialog-close>×</button>
        <div class="worthit-dialog-hero-content">
          <p id="worthit-dialog-category" class="worthit-dialog-eyebrow"></p>
          <h2 id="worthit-dialog-title"></h2>
          <p id="worthit-dialog-intro"></p>
          <button type="button" id="worthit-dialog-top-request" class="worthit-dialog-request" data-request-service>Solicitar este serviço ↗</button>
        </div>
      </div>
      <div class="worthit-dialog-body">
        <p id="worthit-dialog-detail" class="worthit-dialog-detail"></p>
        <h3>O que está incluído</h3>
        <ul id="worthit-dialog-list" class="worthit-dialog-list"></ul>
      </div>
      <section class="worthit-service-request-wrap" id="worthit-service-request-wrap" hidden>
        <div class="worthit-request-form-header">
          <p class="worthit-dialog-eyebrow">PEDIDO DE SERVIÇO</p>
          <h3>Solicitar este serviço</h3>
          <p id="worthit-request-service-name" class="worthit-request-service-name"></p>
        </div>
        <form id="worthit-service-request-form" class="worthit-service-request-form">
          <div class="worthit-request-fields">
            <div class="worthit-request-field">
              <label for="worthit-request-name">Nome completo *</label>
              <input id="worthit-request-name" name="name" autocomplete="name" required maxlength="160">
            </div>
            <div class="worthit-request-field">
              <label for="worthit-request-company">Empresa</label>
              <input id="worthit-request-company" name="company" autocomplete="organization" maxlength="180">
            </div>
            <div class="worthit-request-field">
              <label for="worthit-request-email">Email</label>
              <input id="worthit-request-email" name="email" type="email" autocomplete="email" maxlength="200" aria-describedby="worthit-request-contact-hint">
            </div>
            <div class="worthit-request-field">
              <label for="worthit-request-phone">Telefone / WhatsApp</label>
              <input id="worthit-request-phone" name="phone" type="tel" autocomplete="tel" maxlength="60" aria-describedby="worthit-request-contact-hint">
            </div>
            <div class="worthit-request-field full">
              <label for="worthit-request-location">Localização do projecto</label>
              <input id="worthit-request-location" name="location" autocomplete="address-level2" maxlength="180" placeholder="Província, município ou país">
            </div>
            <div class="worthit-request-field full">
              <label for="worthit-request-details">Descreva o que precisa *</label>
              <textarea id="worthit-request-details" name="details" rows="4" required maxlength="4000" placeholder="Partilhe os requisitos, quantidades, prazos ou outros detalhes relevantes."></textarea>
            </div>
          </div>
          <p class="worthit-request-hint" id="worthit-request-contact-hint">Indique pelo menos um contacto: email ou telefone.</p>
          <p id="worthit-request-status" class="worthit-request-status" role="status" aria-live="polite"></p>
          <div class="worthit-request-form-actions">
            <button type="button" class="worthit-dialog-close-text" data-request-cancel>Cancelar</button>
            <button type="submit" class="worthit-dialog-request worthit-dialog-request-dark" id="worthit-request-submit">Enviar pedido ↗</button>
          </div>
        </form>
      </section>
      <div class="worthit-dialog-footer">
        <button type="button" class="worthit-dialog-close-text" data-dialog-close>Fechar</button>
        <button type="button" id="worthit-dialog-bottom-request" class="worthit-dialog-request worthit-dialog-request-dark" data-request-service>Solicitar este serviço ↗</button>
      </div>
    </div>`;
  document.body.appendChild(dialog);

  let activeService = null;
  const requestWrap = dialog.querySelector("#worthit-service-request-wrap");
  const requestForm = dialog.querySelector("#worthit-service-request-form");
  const requestStatus = dialog.querySelector("#worthit-request-status");
  const requestSubmit = dialog.querySelector("#worthit-request-submit");

  const openRequestForm = () => {
    if (!activeService) return;
    requestWrap.hidden = false;
    requestStatus.textContent = "";
    requestStatus.className = "worthit-request-status";
    dialog.querySelector("#worthit-request-service-name").textContent = activeService.title;
    requestWrap.scrollIntoView({ behavior: "smooth", block: "start" });
    dialog.querySelector("#worthit-request-name").focus({ preventScroll: true });
  };

  grid.querySelectorAll("[data-service-open]").forEach(button => {
    button.addEventListener("click", () => {
      const service = services.find(item => item.id === button.dataset.serviceOpen);
      if (!service) return;
      dialog.querySelector("#worthit-dialog-image").src = service.image;
      dialog.querySelector("#worthit-dialog-image").alt = service.alt;
      dialog.querySelector("#worthit-dialog-category").textContent = service.number + " · " + service.category;
      dialog.querySelector("#worthit-dialog-title").textContent = service.title;
      dialog.querySelector("#worthit-dialog-intro").textContent = service.intro;
      dialog.querySelector("#worthit-dialog-detail").textContent = service.detail;
      dialog.querySelector("#worthit-dialog-list").innerHTML = service.bullets.map(item => "<li>" + escapeHtml(item) + "</li>").join("");
      activeService = service;
      requestForm.reset();
      requestWrap.hidden = true;
      requestStatus.textContent = "";
      requestStatus.className = "worthit-request-status";
      requestSubmit.disabled = false;
      requestSubmit.textContent = "Enviar pedido ↗";
      dialog.showModal();
    });
  });

  dialog.querySelectorAll("[data-request-service]").forEach(button => button.addEventListener("click", openRequestForm));
  dialog.querySelector("[data-request-cancel]").addEventListener("click", () => {
    requestWrap.hidden = true;
    requestStatus.textContent = "";
    requestStatus.className = "worthit-request-status";
  });

  requestForm.addEventListener("submit", async event => {
    event.preventDefault();
    requestStatus.textContent = "";
    requestStatus.className = "worthit-request-status";
    const data = Object.fromEntries(new FormData(requestForm).entries());
    if (!String(data.email || "").trim() && !String(data.phone || "").trim()) {
      requestStatus.textContent = "Indique pelo menos um contacto: email ou telefone.";
      requestStatus.classList.add("is-error");
      return;
    }
    requestSubmit.disabled = true;
    requestSubmit.setAttribute("aria-busy", "true");
    requestSubmit.textContent = "A enviar...";
    try {
      const response = await fetch("https://worthit.tnconsultoria19.workers.dev/api/service-requests", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: activeService?.title || "",
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          location: data.location,
          details: data.details
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível registar o pedido.");
      requestStatus.textContent = "Pedido registado com sucesso. Referência: " + result.id + ".";
      requestStatus.classList.add("is-success");
      requestForm.reset();
      requestSubmit.textContent = "Pedido enviado ✓";
      requestSubmit.removeAttribute("aria-busy");
    } catch (error) {
      requestStatus.textContent = error.message || "Não foi possível enviar o pedido. Tente novamente.";
      requestStatus.classList.add("is-error");
      requestSubmit.disabled = false;
      requestSubmit.removeAttribute("aria-busy");
      requestSubmit.textContent = "Tentar novamente ↗";
    }
  });

  dialog.querySelectorAll("[data-dialog-close]").forEach(button => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
})();
