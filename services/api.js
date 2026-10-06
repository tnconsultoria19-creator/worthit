/**
 * SITE ACQUISITION ANGOLA — DATA & API SERVICE ABSTRACTION
 * ========================================================
 * Front-end data service layer providing a clean abstraction contract.
 * Future Cloudflare Workers / D1 / R2 integration will connect directly
 * to these function signatures without modifying the UI components.
 * 
 * Current implementation uses local client-side state (localStorage)
 * with robust seed data for demonstration and preview.
 */

const STORAGE_KEY = "siteacq_angola_v2";

/**
 * Seed data representing realistic Angolan telecommunications
 * and commercial infrastructure projects.
 */
export const INITIAL_DATA = {
  clients: [
    {
      id: "CL-001",
      name: "Unitel S.A.",
      industry: "Telecomunicações Móveis",
      contact: "Eng.ª Ana Manuel",
      email: "ana.manuel@unitel.co.ao",
      phone: "+244 923 112 233",
      status: "Ativo",
      owner: "Master Admin"
    },
    {
      id: "CL-002",
      name: "Africell Angola",
      industry: "Telecomunicações Móveis",
      contact: "Dr. Carlos Silva",
      email: "c.silva@africell.co.ao",
      phone: "+244 912 445 566",
      status: "Ativo",
      owner: "Gestor"
    },
    {
      id: "CL-003",
      name: "Angola Telecom",
      industry: "Infraestruturas & Fibra",
      contact: "Eng. Paulo Bento",
      email: "p.bento@angolatelecom.ao",
      phone: "+244 924 778 899",
      status: "Ativo",
      owner: "Master Admin"
    },
    {
      id: "CL-004",
      name: "Grupo Kwanza Retalho",
      industry: "Retalho Comercial & Logística",
      contact: "Teresa Quaresma",
      email: "teresa@grupokwanza.co.ao",
      phone: "+244 931 556 677",
      status: "Ativo",
      owner: "Gestor"
    }
  ],

  leads: [
    {
      id: "LD-001",
      company: "Paratus Angola",
      contact: "Rui Fontes",
      email: "rui.fontes@paratus.co.ao",
      phone: "+244 922 889 900",
      source: "Website",
      category: "Fibra & Dados",
      priority: "Alta",
      country: "Angola",
      province: "Luanda",
      status: "Qualificado",
      owner: "Master Admin",
      description: "Identificação de 6 rooftops para estações micro-wave em Luanda Sul.",
      createdDate: "02/10/2026",
      lastActivity: "05/10/2026"
    },
    {
      id: "LD-002",
      company: "MSTelcom",
      contact: "Eng. Fernando Dias",
      email: "f.dias@mstelcom.ao",
      phone: "+244 933 112 344",
      source: "Indicação",
      category: "Telecomunicações",
      priority: "Média",
      country: "Angola",
      province: "Cabinda",
      status: "Em contacto",
      owner: "Gestor",
      description: "Expansão de cobertura offshore e base terrestre em Cabinda.",
      createdDate: "28/09/2026",
      lastActivity: "04/10/2026"
    },
    {
      id: "LD-003",
      company: "Rede Logística do Sul",
      contact: "Maria dos Santos",
      email: "maria@logisticasul.co.ao",
      phone: "+244 945 667 890",
      source: "Prospeção Direta",
      category: "Comercial & Retalho",
      priority: "Alta",
      country: "Angola",
      province: "Benguela",
      status: "Novo",
      owner: "Staff",
      description: "Aquisição de 2 parcelas para centros logísticos no corredor do Lobito.",
      createdDate: "04/10/2026",
      lastActivity: "Hoje"
    }
  ],

  requests: [
    {
      id: "SR-001",
      client: "Unitel S.A.",
      region: "Luanda",
      municipality: "Talatona",
      preferredArea: "Benfica / Lar do Patriota",
      sites: 8,
      projectType: "Telefonia Móvel / BTS",
      deploymentUse: "Greenfield & Rooftop",
      timeframe: "1 a 3 meses",
      status: "Due Diligence",
      assigned: "Master Admin",
      created: "01/10/2026"
    },
    {
      id: "SR-002",
      client: "Africell Angola",
      region: "Huíla",
      municipality: "Lubango",
      preferredArea: "Zona Industrial & Arredores",
      sites: 4,
      projectType: "Telefonia Móvel / BTS",
      deploymentUse: "Greenfield Tower",
      timeframe: "Imediato (< 30 dias)",
      status: "Pesquisa",
      assigned: "Gestor",
      created: "03/10/2026"
    },
    {
      id: "SR-003",
      client: "Grupo Kwanza Retalho",
      region: "Benguela",
      municipality: "Lobito",
      preferredArea: "Acesso Porto do Lobito",
      sites: 2,
      projectType: "Comercial / Retalho",
      deploymentUse: "Terreno Comercial",
      timeframe: "3 a 6 meses",
      status: "Em análise",
      assigned: "Gestor",
      created: "05/10/2026"
    }
  ],

  projects: [
    {
      id: "PR-001",
      name: "Expansão Luanda Sul 5G/4G",
      client: "Unitel S.A.",
      province: "Luanda",
      municipality: "Talatona & Belas",
      sites: 8,
      status: "Em curso",
      progress: 68,
      owner: "Master Admin",
      startDate: "15/08/2026",
      targetDate: "15/12/2026",
      notes: "4 sites em Due Diligence e 4 em Negociação de contrato de arrendamento."
    },
    {
      id: "PR-002",
      name: "Cobertura Corredor Huíla",
      client: "Africell Angola",
      province: "Huíla",
      municipality: "Lubango & Chibia",
      sites: 4,
      status: "Em curso",
      progress: 40,
      owner: "Gestor",
      startDate: "01/09/2026",
      targetDate: "30/11/2026",
      notes: "Scouting de 6 localizações candidatas em curso com levantamento de coordenadas."
    },
    {
      id: "PR-003",
      name: "Interconexão Benguela - Lobito",
      client: "Angola Telecom",
      province: "Benguela",
      municipality: "Benguela",
      sites: 3,
      status: "Planeamento",
      progress: 15,
      owner: "Gestor",
      startDate: "25/09/2026",
      targetDate: "15/01/2027",
      notes: "Reunião de alinhamento com governo provincial para faixas de servidão."
    }
  ],

  sites: [
    {
      id: "ST-001",
      code: "LDA-TA-001",
      project: "Expansão Luanda Sul 5G/4G",
      client: "Unitel S.A.",
      province: "Luanda",
      municipality: "Talatona",
      coordinates: "-8.9245, 13.1872",
      siteType: "Greenfield Tower (45m)",
      status: "Due Diligence",
      owner: "Proprietário Privado",
      contact: "+244 923 888 777",
      ddStatus: "Em verificação de registo predial",
      docStatus: "Certidão emitida",
      negotiationStatus: "Minuta em revisão",
      approvalStatus: "Submetido à Administração Municipal",
      notes: "Acesso viário confirmado e ponto de ligação de energia a 120 metros."
    },
    {
      id: "ST-002",
      code: "LDA-BE-002",
      project: "Expansão Luanda Sul 5G/4G",
      client: "Unitel S.A.",
      province: "Luanda",
      municipality: "Belas",
      coordinates: "-8.9812, 13.1420",
      siteType: "Rooftop Mast (15m)",
      status: "Negociação",
      owner: "Edifício Comercial Patriota",
      contact: "+244 912 333 444",
      ddStatus: "Concluído favorável",
      docStatus: "Completo",
      negotiationStatus: "Valores acordados; minuta final",
      approvalStatus: "Autorização prévia obtida",
      notes: "Contrato de arrendamento de 10 anos com renovação automática."
    },
    {
      id: "ST-003",
      code: "HLA-LB-004",
      project: "Cobertura Corredor Huíla",
      client: "Africell Angola",
      province: "Huíla",
      municipality: "Lubango",
      coordinates: "-14.9180, 13.4925",
      siteType: "Greenfield Lattice (50m)",
      status: "Viabilidade",
      owner: "Fazenda Santo António",
      contact: "+244 934 555 666",
      ddStatus: "Levantamento topográfico iniciado",
      docStatus: "Pendente certidão de posse",
      negotiationStatus: "Contacto inicial estabelecido",
      approvalStatus: "Pendente parecer INACOM",
      notes: "Localização estratégica no cume com visibilidade para a cidade."
    },
    {
      id: "ST-004",
      code: "BGL-LB-001",
      project: "Interconexão Benguela - Lobito",
      client: "Angola Telecom",
      province: "Benguela",
      municipality: "Lobito",
      coordinates: "-12.3521, 13.5411",
      siteType: "Co-location",
      status: "Identificado",
      owner: "Caminhos de Ferro de Benguela",
      contact: "+244 922 111 222",
      ddStatus: "Pendente consulta",
      docStatus: "Pendente",
      negotiationStatus: "Em preparação de ofício",
      approvalStatus: "Não submetido",
      notes: "Possibilidade de partilha de infraestrutura existente."
    },
    {
      id: "ST-005",
      code: "LDA-CA-005",
      project: "Expansão Luanda Sul 5G/4G",
      client: "Unitel S.A.",
      province: "Luanda",
      municipality: "Cazenga",
      coordinates: "-8.8142, 13.2910",
      siteType: "Rooftop Tower",
      status: "Aprovação",
      owner: "Complexo Industrial Cazenga",
      contact: "+244 919 777 888",
      ddStatus: "Aprovado",
      docStatus: "Completo",
      negotiationStatus: "Contrato assinado",
      approvalStatus: "Parecer da Aviação Civil e Urbanismo",
      notes: "Aguardando despacho final da administração para início de obras."
    },
    {
      id: "ST-006",
      code: "CAB-CB-001",
      project: "Expansão Cabinda",
      client: "Unitel S.A.",
      province: "Cabinda",
      municipality: "Cabinda",
      coordinates: "-5.5562, 12.1950",
      siteType: "Greenfield (60m)",
      status: "Adquirido",
      owner: "Governo Provincial / Concessão",
      contact: "+244 923 000 111",
      ddStatus: "Totalmente concluído",
      docStatus: "Escritura e licenças emitidas",
      negotiationStatus: "Fechado",
      approvalStatus: "Todas licenças emitidas",
      notes: "Site entregue à equipa de engenharia de construção (Civil Works)."
    }
  ],

  tasks: [
    {
      id: "TK-001",
      title: "Validar certidão predial do site LDA-TA-001",
      due: "08/10/2026",
      assignee: "Master Admin",
      priority: "Alta",
      status: "Em curso"
    },
    {
      id: "TK-002",
      title: "Realizar levantamento topográfico em Lubango (HLA-LB-004)",
      due: "10/10/2026",
      assignee: "Gestor",
      priority: "Alta",
      status: "Pendente"
    },
    {
      id: "TK-003",
      title: "Redigir adenda ao contrato de arrendamento Patriota",
      due: "12/10/2026",
      assignee: "Staff",
      priority: "Média",
      status: "Em curso"
    },
    {
      id: "TK-004",
      title: "Submeter dossier ao INACOM para o site LDA-CA-005",
      due: "15/10/2026",
      assignee: "Master Admin",
      priority: "Alta",
      status: "Pendente"
    },
    {
      id: "TK-005",
      title: "Reunião com proprietário da Fazenda Santo António",
      due: "09/10/2026",
      assignee: "Gestor",
      priority: "Média",
      status: "Em curso"
    }
  ],

  documents: [
    {
      id: "DOC-001",
      name: "Perfil Institucional — Site Acquisition Angola",
      category: "Institucional",
      type: "PDF",
      url: "documents/perfil-empresa.pdf",
      visibility: "Público",
      status: "Ativo",
      client: "Todos",
      project: "Geral",
      site: "N/A",
      uploadDate: "01/10/2026"
    },
    {
      id: "DOC-002",
      name: "Brief de Aquisição de Sites e Parâmetros Técnicos",
      category: "Serviços",
      type: "PDF",
      url: "documents/brief-site-acquisition.pdf",
      visibility: "Público",
      status: "Ativo",
      client: "Todos",
      project: "Geral",
      site: "N/A",
      uploadDate: "01/10/2026"
    },
    {
      id: "DOC-003",
      name: "Catálogo de Pacotes e Estrutura de Serviços",
      category: "Serviços",
      type: "PDF",
      url: "documents/pacotes-servicos.pdf",
      visibility: "Público",
      status: "Ativo",
      client: "Todos",
      project: "Geral",
      site: "N/A",
      uploadDate: "01/10/2026"
    },
    {
      id: "DOC-004",
      name: "Relatório de Viabilidade Técnica LDA-TA-001",
      category: "Técnico",
      type: "PDF",
      url: "documents/brief-site-acquisition.pdf",
      visibility: "Cliente",
      status: "Ativo",
      client: "Unitel S.A.",
      project: "Expansão Luanda Sul 5G/4G",
      site: "LDA-TA-001",
      uploadDate: "03/10/2026"
    },
    {
      id: "DOC-005",
      name: "Auditoria Jurídica & Matrícula de Registo Patriota",
      category: "Due Diligence",
      type: "PDF",
      url: "documents/perfil-empresa.pdf",
      visibility: "Interno",
      status: "Ativo",
      client: "Unitel S.A.",
      project: "Expansão Luanda Sul 5G/4G",
      site: "LDA-BE-002",
      uploadDate: "04/10/2026"
    }
  ],

  packages: [
    {
      id: "PK-001",
      name: "Standard — Identificação",
      description: "Pesquisa de terrenos e edifícios candidatos, screening inicial e relatório preliminar de viabilidade de cobertura.",
      price: "Sob consulta",
      status: "Ativo"
    },
    {
      id: "PK-002",
      name: "Professional — Aquisição Completa",
      description: "End-to-end: scouting, viabilidade técnica, due diligence fundiária, negociação de arrendamento e apoio às licenças regulamentares.",
      price: "Sob consulta",
      status: "Ativo"
    },
    {
      id: "PK-003",
      name: "Enterprise — Operação Nacional",
      description: "Gestão dedicada de portfólio multi-site em todas as províncias de Angola, coordenação com INACOM e governos provinciais.",
      price: "Personalizado",
      status: "Ativo"
    }
  ],

  users: [
    {
      id: "USR-001",
      name: "Master Admin",
      email: "admin@siteacquisition.co.ao",
      role: "Master Admin",
      status: "Ativo",
      lastLogin: "Agora"
    },
    {
      id: "USR-002",
      name: "Eng. Pedro Mbala",
      email: "pedro.mbala@siteacquisition.co.ao",
      role: "Manager",
      status: "Ativo",
      lastLogin: "Hoje às 08:30"
    },
    {
      id: "USR-003",
      name: "Dra. Isabel Lourenço",
      email: "isabel.lourenco@siteacquisition.co.ao",
      role: "Staff",
      status: "Ativo",
      lastLogin: "Ontem às 16:45"
    },
    {
      id: "USR-004",
      name: "Eng.ª Ana Manuel (Unitel)",
      email: "ana.manuel@unitel.co.ao",
      role: "Client",
      status: "Ativo",
      lastLogin: "Hoje às 09:15"
    }
  ],

  audit: [
    {
      id: "AU-001",
      action: "Sessão iniciada na plataforma",
      user: "Master Admin",
      date: "06/10/2026 09:00",
      module: "Sistema",
      record: "SYS-INIT"
    },
    {
      id: "AU-002",
      action: "Pedido SR-001 aprovado para Due Diligence",
      user: "Master Admin",
      date: "06/10/2026 10:15",
      module: "Pedidos",
      record: "SR-001"
    },
    {
      id: "AU-003",
      action: "Site LDA-TA-001 atualizado com certidão predial",
      user: "Eng. Pedro Mbala",
      date: "06/10/2026 11:30",
      module: "Sites",
      record: "LDA-TA-001"
    },
    {
      id: "AU-004",
      action: "Documento DOC-004 disponibilizado para o cliente",
      user: "Master Admin",
      date: "06/10/2026 12:00",
      module: "Documentos",
      record: "DOC-004"
    }
  ],

  messages: [
    {
      id: "MSG-001",
      sender: "Eng. Pedro Mbala (Gestor)",
      recipient: "Unitel S.A.",
      date: "06/10/2026 11:00",
      subject: "Ponto de situação do site LDA-TA-001",
      content: "Exma. Eng.ª Ana, a certidão predial do site em Talatona foi validada com sucesso pelo nosso departamento jurídico. Estamos prontos para rubricar a minuta de arrendamento."
    },
    {
      id: "MSG-002",
      sender: "Unitel S.A.",
      recipient: "Eng. Pedro Mbala (Gestor)",
      date: "06/10/2026 11:45",
      subject: "Re: Ponto de situação do site LDA-TA-001",
      content: "Excelente notícia, Pedro. Aprovamos a minuta internamente. Por favor agendem a recolha de assinatura com o proprietário para esta quinta-feira."
    }
  ]
};

/**
 * Storage initialization and persistence
 */
function getStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return structuredClone(INITIAL_DATA);
    }
    const parsed = JSON.parse(raw);
    Object.keys(INITIAL_DATA).forEach(k => {
      if (!parsed[k]) parsed[k] = structuredClone(INITIAL_DATA[k]);
    });
    return parsed;
  } catch (e) {
    return structuredClone(INITIAL_DATA);
  }
}

function saveStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage save failed:", e);
  }
}

export function logAudit(action, module, record = "", user = "Master Admin") {
  const data = getStorage();
  const entry = {
    id: "AU-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
    action,
    user,
    date: new Date().toLocaleString("pt-PT"),
    module,
    record
  };
  data.audit.unshift(entry);
  if (data.audit.length > 200) data.audit.pop();
  saveStorage(data);
}

// -------------------------------------------------------------
// FRONT-END API CONTRACT / METHODS
// -------------------------------------------------------------

export const api = {
  resetData() {
    saveStorage(structuredClone(INITIAL_DATA));
    return structuredClone(INITIAL_DATA);
  },

  getOverview() {
    const data = getStorage();
    return {
      activeClients: data.clients.filter(c => c.status === "Ativo").length,
      activeProjects: data.projects.filter(p => p.status !== "Concluído").length,
      pendingRequests: data.requests.filter(r => r.status !== "Concluído").length,
      inProcessSites: data.sites.filter(s => ["Due Diligence", "Negociação", "Aprovação"].includes(s.status)).length,
      totalSites: data.sites.length,
      recentAudit: data.audit.slice(0, 8),
      upcomingTasks: data.tasks.slice(0, 8),
      pipelineBreakdown: [
        { stage: "Identificado", count: data.sites.filter(s => s.status === "Identificado").length },
        { stage: "Viabilidade", count: data.sites.filter(s => s.status === "Viabilidade").length },
        { stage: "Due Diligence", count: data.sites.filter(s => s.status === "Due Diligence").length },
        { stage: "Negociação", count: data.sites.filter(s => s.status === "Negociação").length },
        { stage: "Aprovação", count: data.sites.filter(s => s.status === "Aprovação").length },
        { stage: "Adquirido", count: data.sites.filter(s => s.status === "Adquirido").length }
      ]
    };
  },

  getClients() {
    return getStorage().clients;
  },
  saveClient(client, user = "Master Admin") {
    const data = getStorage();
    if (!client.id) {
      client.id = "CL-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      data.clients.unshift(client);
      logAudit(`Cliente ${client.name} criado`, "Clientes", client.id, user);
    } else {
      const idx = data.clients.findIndex(c => c.id === client.id);
      if (idx !== -1) {
        data.clients[idx] = { ...data.clients[idx], ...client };
        logAudit(`Cliente ${client.name} atualizado`, "Clientes", client.id, user);
      }
    }
    saveStorage(data);
    return client;
  },
  deleteClient(id, user = "Master Admin") {
    const data = getStorage();
    const target = data.clients.find(c => c.id === id);
    data.clients = data.clients.filter(c => c.id !== id);
    if (target) logAudit(`Cliente ${target.name} removido`, "Clientes", id, user);
    saveStorage(data);
    return true;
  },

  getLeads() {
    return getStorage().leads;
  },
  saveLead(lead, user = "Master Admin") {
    const data = getStorage();
    if (!lead.id) {
      lead.id = "LD-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      lead.createdDate = new Date().toLocaleDateString("pt-PT");
      lead.lastActivity = "Hoje";
      data.leads.unshift(lead);
      logAudit(`Lead ${lead.company} criado`, "Leads", lead.id, user);
    } else {
      const idx = data.leads.findIndex(l => l.id === lead.id);
      if (idx !== -1) {
        lead.lastActivity = "Hoje";
        data.leads[idx] = { ...data.leads[idx], ...lead };
        logAudit(`Lead ${lead.company} atualizado`, "Leads", lead.id, user);
      }
    }
    saveStorage(data);
    return lead;
  },
  deleteLead(id, user = "Master Admin") {
    const data = getStorage();
    const target = data.leads.find(l => l.id === id);
    data.leads = data.leads.filter(l => l.id !== id);
    if (target) logAudit(`Lead ${target.company} eliminado`, "Leads", id, user);
    saveStorage(data);
    return true;
  },

  getRequests() {
    return getStorage().requests;
  },
  saveRequest(req, user = "Master Admin") {
    const data = getStorage();
    if (!req.id) {
      req.id = "SR-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      req.created = new Date().toLocaleDateString("pt-PT");
      data.requests.unshift(req);
      logAudit(`Pedido de site ${req.id} registado`, "Pedidos", req.id, user);
    } else {
      const idx = data.requests.findIndex(r => r.id === req.id);
      if (idx !== -1) {
        data.requests[idx] = { ...data.requests[idx], ...req };
        logAudit(`Pedido de site ${req.id} atualizado`, "Pedidos", req.id, user);
      }
    }
    saveStorage(data);
    return req;
  },
  deleteRequest(id, user = "Master Admin") {
    const data = getStorage();
    data.requests = data.requests.filter(r => r.id !== id);
    logAudit(`Pedido de site ${id} eliminado`, "Pedidos", id, user);
    saveStorage(data);
    return true;
  },

  getProjects() {
    return getStorage().projects;
  },
  saveProject(proj, user = "Master Admin") {
    const data = getStorage();
    if (!proj.id) {
      proj.id = "PR-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      data.projects.unshift(proj);
      logAudit(`Projeto ${proj.name} criado`, "Projetos", proj.id, user);
    } else {
      const idx = data.projects.findIndex(p => p.id === proj.id);
      if (idx !== -1) {
        data.projects[idx] = { ...data.projects[idx], ...proj };
        logAudit(`Projeto ${proj.name} atualizado`, "Projetos", proj.id, user);
      }
    }
    saveStorage(data);
    return proj;
  },
  deleteProject(id, user = "Master Admin") {
    const data = getStorage();
    const target = data.projects.find(p => p.id === id);
    data.projects = data.projects.filter(p => p.id !== id);
    if (target) logAudit(`Projeto ${target.name} eliminado`, "Projetos", id, user);
    saveStorage(data);
    return true;
  },

  getSites() {
    return getStorage().sites;
  },
  saveSite(site, user = "Master Admin") {
    const data = getStorage();
    if (!site.id) {
      site.id = "ST-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      data.sites.unshift(site);
      logAudit(`Site ${site.code || site.id} registado`, "Sites", site.id, user);
    } else {
      const idx = data.sites.findIndex(s => s.id === site.id);
      if (idx !== -1) {
        data.sites[idx] = { ...data.sites[idx], ...site };
        logAudit(`Site ${site.code || site.id} atualizado`, "Sites", site.id, user);
      }
    }
    saveStorage(data);
    return site;
  },
  deleteSite(id, user = "Master Admin") {
    const data = getStorage();
    const target = data.sites.find(s => s.id === id);
    data.sites = data.sites.filter(s => s.id !== id);
    if (target) logAudit(`Site ${target.code || id} eliminado`, "Sites", id, user);
    saveStorage(data);
    return true;
  },

  getTasks() {
    return getStorage().tasks;
  },
  saveTask(task, user = "Master Admin") {
    const data = getStorage();
    if (!task.id) {
      task.id = "TK-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      data.tasks.unshift(task);
      logAudit(`Tarefa "${task.title}" criada`, "Tarefas", task.id, user);
    } else {
      const idx = data.tasks.findIndex(t => t.id === task.id);
      if (idx !== -1) {
        data.tasks[idx] = { ...data.tasks[idx], ...task };
        logAudit(`Tarefa "${task.title}" atualizada`, "Tarefas", task.id, user);
      }
    }
    saveStorage(data);
    return task;
  },
  deleteTask(id, user = "Master Admin") {
    const data = getStorage();
    data.tasks = data.tasks.filter(t => t.id !== id);
    logAudit(`Tarefa ${id} eliminada`, "Tarefas", id, user);
    saveStorage(data);
    return true;
  },

  getDocuments() {
    return getStorage().documents;
  },
  saveDocument(doc, user = "Master Admin") {
    const data = getStorage();
    if (!doc.id) {
      doc.id = "DOC-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      doc.uploadDate = new Date().toLocaleDateString("pt-PT");
      data.documents.unshift(doc);
      logAudit(`Documento "${doc.name}" carregado`, "Documentos", doc.id, user);
    } else {
      const idx = data.documents.findIndex(d => d.id === doc.id);
      if (idx !== -1) {
        data.documents[idx] = { ...data.documents[idx], ...doc };
        logAudit(`Documento "${doc.name}" atualizado`, "Documentos", doc.id, user);
      }
    }
    saveStorage(data);
    return doc;
  },
  deleteDocument(id, user = "Master Admin") {
    const data = getStorage();
    data.documents = data.documents.filter(d => d.id !== id);
    logAudit(`Documento ${id} removido`, "Documentos", id, user);
    saveStorage(data);
    return true;
  },

  getPackages() {
    return getStorage().packages;
  },
  savePackage(pkg, user = "Master Admin") {
    const data = getStorage();
    if (!pkg.id) {
      pkg.id = "PK-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      data.packages.unshift(pkg);
    } else {
      const idx = data.packages.findIndex(p => p.id === pkg.id);
      if (idx !== -1) data.packages[idx] = { ...data.packages[idx], ...pkg };
    }
    saveStorage(data);
    return pkg;
  },

  getUsers() {
    return getStorage().users;
  },
  saveUser(usr, user = "Master Admin") {
    const data = getStorage();
    if (!usr.id) {
      usr.id = "USR-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      usr.lastLogin = "Recém-criado";
      data.users.unshift(usr);
      logAudit(`Utilizador ${usr.name} (${usr.role}) criado`, "Utilizadores", usr.id, user);
    } else {
      const idx = data.users.findIndex(u => u.id === usr.id);
      if (idx !== -1) {
        data.users[idx] = { ...data.users[idx], ...usr };
        logAudit(`Utilizador ${usr.name} atualizado`, "Utilizadores", usr.id, user);
      }
    }
    saveStorage(data);
    return usr;
  },
  deleteUser(id, user = "Master Admin") {
    const data = getStorage();
    data.users = data.users.filter(u => u.id !== id);
    logAudit(`Utilizador ${id} removido`, "Utilizadores", id, user);
    saveStorage(data);
    return true;
  },

  getAudit() {
    return getStorage().audit;
  },

  getMessages(clientName) {
    const msgs = getStorage().messages || [];
    if (!clientName) return msgs;
    return msgs.filter(m => m.recipient === clientName || m.sender === clientName);
  },
  sendMessage(msg) {
    const data = getStorage();
    if (!data.messages) data.messages = [];
    msg.id = "MSG-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    msg.date = new Date().toLocaleString("pt-PT");
    data.messages.unshift(msg);
    saveStorage(data);
    return msg;
  }
};
