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
    {
      id: "partners", number: "04", category: "LIGAÇÕES LOCAIS", title: "Correspondência de Parceiros & Fornecedores",
      image: "https://images.openai.com/static-rsc-4/jNWRjcYjxUlaTf-5BnP3iBja5bjpBJGmR5kgBJ9tNPODpJEnZ3o6qwXQL_d1LmFWMcF8XacvoU1eUDJ5Qljx8KuPXCG4rtDHZ5Lcjqpsu89P_Xo23FoIyPbUgyrC8wekwfnLtAYcj0Fuyd5jYT9y39iPauAAjMzUFrb07O3DocTQ?purpose=inline",
      alt: "Parceiros de negócios", intro: "Ligamos clientes a potenciais prestadores de serviços, fornecedores, empreiteiros e parceiros comerciais.",
      detail: "Apoiamos a pesquisa e apresentação de contactos relevantes. A escolha e contratação final dos prestadores cabe ao cliente.",
      bullets: ["Identificação de fornecedores locais", "Pesquisa de empreiteiros e prestadores de serviços", "Introduções comerciais", "Pesquisa de parceiros para projectos específicos"]
    },
    {
      id: "agriculture", number: "05", category: "AGRICULTURA", title: "Agricultura & Agro-Sourcing",
      image: "https://images.openai.com/static-rsc-4/UNLw5pFt4qL4zX?purpose=inline",
      alt: "Insumos e fornecimentos agrícolas", intro: "Facilitamos o acesso a recursos agrícolas, insumos, compradores, fornecedores e oportunidades comerciais.",
      detail: "Clarificamos as necessidades do projecto e pesquisamos potenciais fontes de fornecimento ou parceiros adequados.",
      bullets: ["Equipamentos e insumos agrícolas", "Pesquisa de terrenos e instalações agrícolas", "Sistemas de irrigação e fornecimentos", "Identificação de compradores e parceiros de processamento"]
    },
    {
      id: "energy", number: "06", category: "ENERGIA", title: "Energia & Solar",
      image: "https://images.openai.com/static-rsc-4/gHQL8v4HX0Rc1TEeJuQDnW9I9b04vgkT6ZW7CpOGfo-q_PeNQ7_OYcAQ_eWVcmt4jnFjoB9HprrEpVTrNYLSPozd4COLkIAAin3WalqpLUyVJ5UHDzKvIna3D52mDZ8iGayysrCHFWZLMphVX0Cs-neg4g1jS5w-T2QX41BzWJc?purpose=inline",
      alt: "Painéis solares", intro: "Ajudamos a localizar fornecedores e equipamento para necessidades energéticas de empresas e projectos.",
      detail: "Apoiamos a pesquisa e coordenação com fornecedores qualificados. Instalações e trabalhos técnicos são executados pelos prestadores contratados para esse fim.",
      bullets: ["Painéis solares e prestadores de instalação", "Inversores, baterias e geradores", "Soluções energéticas comerciais", "Procurement de equipamentos relacionados com energia"]
    },
    {
      id: "construction", number: "07", category: "DESENVOLVIMENTO", title: "Construção & Facilitação de Desenvolvimento",
      image: "https://images.openai.com/static-rsc-4/fczNNKvklcDV7m9-rYf6GEXrExpWS3kgeRpVNpiV-E4BdwL24GEhvUzTcPe8sY3SrrweJlhtlYwyAeOmp07Hm5lKIeM4qb2TQnpuy-VVBxUAKp9QNwmTLDJ9PcsFAVkz66R31pa3lzi5yw4M4ykpbIMHDEQQGpumURz9Xr-kAe4?purpose=inline",
      alt: "Materiais e trabalho de construção civil", intro: "Apoiamos a pesquisa dos recursos necessários a projectos de construção e desenvolvimento.",
      detail: "Ajudamos a identificar prestadores e fornecedores adequados. O âmbito é acordado caso a caso; a WorthIt não presume executar directamente os trabalhos.",
      bullets: ["Engenheiros, arquitectos e empreiteiros", "Materiais e equipamentos", "Terrenos, instalações e espaços", "Coordenação de fornecedores e intervenientes"]
    }
  ];

  const grid = document.getElementById("worthit-service-grid");
  if (!grid) return;
  const escapeHtml = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  grid.innerHTML = services.map(service => `
    <button type="button" class="worthit-service-card" data-service-open="${service.id}" aria-haspopup="dialog" aria-label="Saber mais sobre ${escapeHtml(service.title)}">
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
          <a id="worthit-dialog-top-request" class="worthit-dialog-request" href="#">Solicitar este serviço ↗</a>
        </div>
      </div>
      <div class="worthit-dialog-body">
        <p id="worthit-dialog-detail" class="worthit-dialog-detail"></p>
        <h3>O que podemos coordenar</h3>
        <ul id="worthit-dialog-list" class="worthit-dialog-list"></ul>
      </div>
      <div class="worthit-dialog-footer">
        <button type="button" class="worthit-dialog-close-text" data-dialog-close>Fechar</button>
        <a id="worthit-dialog-bottom-request" class="worthit-dialog-request worthit-dialog-request-dark" href="#">Solicitar este serviço ↗</a>
      </div>
    </div>`;
  document.body.appendChild(dialog);

  const createRequestLink = service => {
    const subject = encodeURIComponent("Pedido de serviço WorthIt — " + service.title);
    const body = encodeURIComponent("Olá WorthIt,\n\nTenho interesse no serviço: " + service.title + ".\n\nNome / Empresa:\nLocalização:\nDescrição do pedido:\n\nObrigado.");
    return "mailto:?subject=" + subject + "&body=" + body;
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
      const requestLink = createRequestLink(service);
      dialog.querySelector("#worthit-dialog-top-request").href = requestLink;
      dialog.querySelector("#worthit-dialog-bottom-request").href = requestLink;
      dialog.showModal();
    });
  });

  dialog.querySelectorAll("[data-dialog-close]").forEach(button => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
})();
