(() => {
  "use strict";

  const services = [
    {
      id: "sites", number: "01", category: "LOCALIZAÇÃO",
      title: "Aquisição de Sites & Inteligência de Localização",
      image: "https://images.openai.com/static-rsc-4/IAt8KKE5yPNH6xchWF4s_OfPQ3SElJumRerTuE4sRyhLbJBocx88qPzoM_AsOh6ukKmftBEe_0YPfNR86l6q-vmDp4_aQq3SMOKyczTsYcg4Ri5uSwUlakvw8LtDWdchH8hXXAPoYGp7BmN2tYHnugZC_gWzpcfweQpDDsgw1Lk?purpose=inline",
      alt: "Torre de telecomunicações e infraestrutura de rede",
      intro: "Identificamos e avaliamos locais para telecomunicações, expansão comercial e projectos de desenvolvimento.",
      detail: "Organizamos informação relevante para o cliente avaliar opções e decidir os próximos passos.",
      bullets: ["Pesquisa e identificação de locais", "Coordenação de viabilidade técnica e comercial", "Coordenação de due diligence e documentação", "Facilitação de negociações com proprietários e coordenação de múltiplos locais"]
    },
    {
      id: "procurement", number: "02", category: "FORNECIMENTO", title: "Procurement & Sourcing",
      image: "https://images.openai.com/static-rsc-4/Kx9LSxW9arpxSLfzyp7-o7dIJK090z-VWJSPELmhTE74v95yjNyf8QRXSq965NhOOUt2Mvr7WNuIVh1vSXpooL-sKO8TSU0CQQTIvrpvOypXfkr_UZiPSeUYhzZwUJqR8xmRsBEPCWT3prFopJ_X0c-rHcZOAl9UitxPerahtLk?purpose=inline",
      alt: "Materiais e fornecimentos", intro: "Pesquisamos produtos, materiais e equipamentos, identificando fornecedores de acordo com os seus requisitos.",
      detail: "Reunimos alternativas e cotações para ajudar a comparar opções. O fornecimento final e as condições são confirmados com os fornecedores.",
      bullets: ["Materiais e equipamentos de construção", "Veículos, maquinaria e peças sobressalentes", "Equipamento de escritório e consumíveis", "Pesquisa de fornecedores, cotações e comparação de opções"]
    },
    {
      id: "expansion", number: "03", category: "NEGÓCIOS", title: "Instalação & Expansão de Negócios",
      image: "https://images.openai.com/static-rsc-4/lOFBNZQ_nJ4Fzy31WwMCmY74BuKCqp5UJqqYUtyzcSLWXrw282YiqnUR8VURTvy3SFBvNsHVdnO6xroznPACXQIxTBq72B73lE8ix7uS1ViDJXed6q6vzfNN_Mr0wEykPgO0KspbYzvmeyTmyDbhNvTXqhZtHDWJa9BHuaHU8Aw?purpose=inline",
      alt: "Espaço empresarial", intro: "Apoiamos empresas que pretendem estabelecer ou ampliar a sua presença em Angola.",
      detail: "Reunimos informação de mercado e ajudamos a encontrar recursos operacionais adequados ao plano do cliente.",
      bullets: ["Pesquisa de instalações e localizações", "Recolha de informação de mercado", "Identificação de fornecedores operacionais", "Coordenação de requisitos e serviços locais"]
    },
  ];

  const grid = document.getElementById("worthit-service-grid");
  if (!grid) return;
  const escapeHtml = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  grid.innerHTML = services.map(service => `
    <button type="button" class="worthit-service-card" id="service-${service.id}" data-service-open="${service.id}" aria-haspopup="dialog" aria-label="Saber mais sobre ${escapeHtml(service.title)}">
      <span class="worthit-service-image"><img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.alt)}" loading="lazy"></span>
      <span class="worthit-service-caption">${escapeHtml(service.title)}</span>
      <span class="worthit-service-action">SABER MAIS ↗</span>
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
        <h3>O que podemos coordenar</h3>
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
