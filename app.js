import { api, logAudit } from './services/api.js';

/**
 * SITE ACQUISITION ANGOLA — APPLICATION & PORTAL CONTROLLER
 * ========================================================
 * Implements the complete Internal Operational Portal and Client Portal
 * interfaces with exact typographic and visual fidelity to the prototype.
 */

// Helper to escape HTML safely
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Subtle editorial status indicator
function badge(val) {
  const s = String(val || '');
  let cls = 'neutral';
  if (/ativo|curso|conclu|qualificado|adquirido|aprovado/i.test(s)) cls = 'success';
  else if (/pend|análise|negociação|novo|pesquisa|média|diligence|viabilidade/i.test(s)) cls = 'warning';
  else if (/cancel|suspens|bloque|rejeit|alta|inativo/i.test(s)) cls = 'danger';
  return `<span class="badge ${cls}">${esc(s)}</span>`;
}

function kpi(label, value, note) {
  return `
    <div class="kpi">
      <div class="label">${esc(label)}</div>
      <strong>${esc(value)}</strong>
      <span>${esc(note)}</span>
    </div>
  `;
}

function canDelete(role) {
  return role === 'Master Admin' || role === 'Admin';
}

function canManageUsers(role) {
  return role === 'Master Admin';
}

// -------------------------------------------------------------
// INTERNAL MANAGEMENT PORTAL MODULES
// -------------------------------------------------------------

function renderPipelineBar(pipeline) {
  return `
    <div class="pipeline-bar">
      <div class="pipeline-bar-title">Pipeline de Aquisição de Sites</div>
      <div class="pipeline-stages">
        ${pipeline.map(st => `
          <div class="pipeline-stage-step ${st.count > 0 ? 'active' : ''}">
            <span class="stage-name">${esc(st.stage)}</span>
            <span class="stage-count">${st.count}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function viewOverview(role) {
  const ov = api.getOverview();
  return `
    <div class="kpis">
      ${kpi("Clientes Ativos", ov.activeClients, "Base comercial")}
      ${kpi("Projetos Ativos", ov.activeProjects, "Em execução")}
      ${kpi("Pedidos Pendentes", ov.pendingRequests, "Novos & Em análise")}
      ${kpi("Sites em Processo", ov.inProcessSites, "Due Diligence & Negociação")}
    </div>

    ${renderPipelineBar(ov.pipelineBreakdown)}

    <div class="admin-grid">
      <div class="panel">
        <div class="panel-head">
          <h3>Atividade Recente</h3>
          <span class="muted">Últimos registos de auditoria</span>
        </div>
        <div class="list" style="padding: 16px;">
          ${ov.recentAudit.map(a => `
            <div class="list-item">
              <strong>${esc(a.action)}</strong>
              <div class="activity">${esc(a.user)} · ${esc(a.date)} · ${esc(a.module)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Próximas Tarefas Operacionais</h3>
          <span class="muted">${ov.upcomingTasks.length} tarefas pendentes</span>
        </div>
        <div class="list" style="padding: 16px;">
          ${ov.upcomingTasks.map(t => `
            <div class="list-item">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <strong>${esc(t.title)}</strong>
                ${badge(t.priority)}
              </div>
              <div class="activity">
                Prazo: ${esc(t.due)} · Responsável: ${esc(t.assignee)} · ${badge(t.status)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function viewLeads(role) {
  const leads = api.getLeads();
  const rows = leads.map(l => `
    <tr data-filter="${esc(l.status)} ${esc(l.priority)} ${esc(l.owner)} ${esc(l.province)}">
      <td><strong>${esc(l.id)}</strong></td>
      <td><strong>${esc(l.company)}</strong><br><span class="muted">${esc(l.contact)}</span></td>
      <td>${esc(l.email)}<br><span class="muted">${esc(l.phone)}</span></td>
      <td>${esc(l.province)}</td>
      <td>${esc(l.source)}</td>
      <td>${esc(l.category)}</td>
      <td>${badge(l.priority)}</td>
      <td>${badge(l.status)}</td>
      <td>${esc(l.owner)}</td>
      <td>${esc(l.lastActivity)}</td>
      <td>
        <button class="btn small ghost btn-edit-lead" data-id="${esc(l.id)}">Editar</button>
        ${canDelete(role) ? `<button class="btn small danger btn-del-lead" data-id="${esc(l.id)}">Eliminar</button>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    <div class="toolbar">
      <input id="tableSearch" placeholder="Pesquisar leads (empresa, contacto)...">
      <select id="filterStatus">
        <option value="">Todos os Estados</option>
        <option value="Novo">Novo</option>
        <option value="Qualificado">Qualificado</option>
        <option value="Em contacto">Em contacto</option>
        <option value="Em negociação">Em negociação</option>
        <option value="Convertido">Convertido</option>
      </select>
      <select id="filterPriority">
        <option value="">Todas as Prioridades</option>
        <option value="Alta">Alta</option>
        <option value="Média">Média</option>
        <option value="Baixa">Baixa</option>
      </select>
      <button class="btn small" id="btnNewLead">+ Novo Lead</button>
      <span class="toolbar-count">${leads.length} lead(s)</span>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Gestão de Leads & Oportunidades</h3>
          <div class="muted">Prospeção e qualificação de clientes institucionais e operadoras.</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Empresa & Contacto</th>
              <th>Email / Tel</th>
              <th>Província</th>
              <th>Origem</th>
              <th>Categoria</th>
              <th>Prioridade</th>
              <th>Estado</th>
              <th>Responsável</th>
              <th>Última Atividade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="11" class="empty">Nenhum lead registado</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewClients(role) {
  const clients = api.getClients();
  const rows = clients.map(c => `
    <tr data-filter="${esc(c.status)} ${esc(c.industry)}">
      <td><strong>${esc(c.id)}</strong></td>
      <td><strong>${esc(c.name)}</strong></td>
      <td>${esc(c.industry)}</td>
      <td>${esc(c.contact)}</td>
      <td>${esc(c.email)}</td>
      <td>${esc(c.phone || '-')}</td>
      <td>${badge(c.status)}</td>
      <td>${esc(c.owner)}</td>
      <td>
        <button class="btn small ghost btn-edit-client" data-id="${esc(c.id)}">Editar</button>
        ${canDelete(role) ? `<button class="btn small danger btn-del-client" data-id="${esc(c.id)}">Eliminar</button>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    <div class="toolbar">
      <input id="tableSearch" placeholder="Pesquisar clientes...">
      <select id="filterStatus">
        <option value="">Todos os Estados</option>
        <option value="Ativo">Ativo</option>
        <option value="Inativo">Inativo</option>
      </select>
      <button class="btn small" id="btnNewClient">+ Novo Cliente</button>
      <span class="toolbar-count">${clients.length} cliente(s)</span>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Carteira de Clientes</h3>
          <div class="muted">Operadoras de telecomunicações e contas corporativas.</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome da Empresa</th>
              <th>Setor / Indústria</th>
              <th>Ponto de Contacto</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Estado</th>
              <th>Gestor de Conta</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="9" class="empty">Nenhum cliente registado</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewRequests(role) {
  const requests = api.getRequests();
  const rows = requests.map(r => `
    <tr data-filter="${esc(r.status)} ${esc(r.region)} ${esc(r.client)}">
      <td><strong>${esc(r.id)}</strong></td>
      <td><strong>${esc(r.client)}</strong></td>
      <td>${esc(r.region)}<br><span class="muted">${esc(r.municipality)}</span></td>
      <td>${esc(r.preferredArea || '-')}</td>
      <td><strong>${esc(r.sites)}</strong></td>
      <td>${esc(r.projectType || 'BTS')}</td>
      <td>${esc(r.deploymentUse || 'Greenfield')}</td>
      <td>${esc(r.timeframe || '1 a 3 meses')}</td>
      <td>${badge(r.status)}</td>
      <td>${esc(r.assigned)}</td>
      <td>${esc(r.created)}</td>
      <td>
        <button class="btn small ghost btn-edit-req" data-id="${esc(r.id)}">Editar</button>
        ${canDelete(role) ? `<button class="btn small danger btn-del-req" data-id="${esc(r.id)}">Eliminar</button>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    <div class="toolbar">
      <input id="tableSearch" placeholder="Pesquisar pedidos (cliente, província)...">
      <select id="filterStatus">
        <option value="">Todos os Estados</option>
        <option value="Novo">Novo</option>
        <option value="Em análise">Em análise</option>
        <option value="Pesquisa">Pesquisa</option>
        <option value="Due Diligence">Due Diligence</option>
        <option value="Negociação">Negociação</option>
        <option value="Aprovado">Aprovado</option>
        <option value="Concluído">Concluído</option>
      </select>
      <select id="filterRegion">
        <option value="">Todas as Províncias</option>
        <option value="Luanda">Luanda</option>
        <option value="Benguela">Benguela</option>
        <option value="Huíla">Huíla</option>
        <option value="Cabinda">Cabinda</option>
      </select>
      <button class="btn small" id="btnNewReq">+ Novo Pedido</button>
      <span class="toolbar-count">${requests.length} pedido(s)</span>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Pedidos de Aquisição de Sites</h3>
          <div class="muted">Entrada de novos pedidos de expansão territorial e cobertura técnica.</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Província / Município</th>
              <th>Área Preferencial</th>
              <th>Nº Sites</th>
              <th>Tipo Projeto</th>
              <th>Tipologia</th>
              <th>Prazo</th>
              <th>Estado</th>
              <th>Responsável</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="12" class="empty">Nenhum pedido registado</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewProjects(role) {
  const projects = api.getProjects();
  const rows = projects.map(p => `
    <tr data-filter="${esc(p.status)} ${esc(p.province)} ${esc(p.client)}">
      <td><strong>${esc(p.id)}</strong></td>
      <td><strong>${esc(p.name)}</strong><br><span class="muted">${esc(p.notes || '')}</span></td>
      <td>${esc(p.client)}</td>
      <td>${esc(p.province)} / ${esc(p.municipality || '')}</td>
      <td><strong>${esc(p.sites)}</strong></td>
      <td>${badge(p.status)}</td>
      <td style="min-width: 140px;">
        <div style="display:flex; justify-content:space-between; font-size:11px;">
          <span>${esc(p.progress)}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${Number(p.progress || 0)}%;"></div></div>
      </td>
      <td>${esc(p.owner)}</td>
      <td>${esc(p.startDate || '-')} → ${esc(p.targetDate || '-')}</td>
      <td>
        <button class="btn small ghost btn-edit-proj" data-id="${esc(p.id)}">Editar</button>
        ${canDelete(role) ? `<button class="btn small danger btn-del-proj" data-id="${esc(p.id)}">Eliminar</button>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    <div class="toolbar">
      <input id="tableSearch" placeholder="Pesquisar projetos...">
      <select id="filterStatus">
        <option value="">Todos os Estados</option>
        <option value="Planeamento">Planeamento</option>
        <option value="Em curso">Em curso</option>
        <option value="Em aprovação">Em aprovação</option>
        <option value="Concluído">Concluído</option>
        <option value="Suspenso">Suspenso</option>
      </select>
      <button class="btn small" id="btnNewProj">+ Novo Projeto</button>
      <span class="toolbar-count">${projects.length} projeto(s)</span>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Projetos de Expansão</h3>
          <div class="muted">Programas e clusters de aquisição de infraestrutura por cliente e região.</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Projeto</th>
              <th>Cliente</th>
              <th>Província / Município</th>
              <th>Sites</th>
              <th>Estado</th>
              <th>Progresso</th>
              <th>Gestor</th>
              <th>Cronograma</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="10" class="empty">Nenhum projeto registado</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewSites(role) {
  const sites = api.getSites();
  const stages = ["Identificado", "Viabilidade", "Due Diligence", "Negociação", "Aprovação", "Adquirido"];
  const stageCounts = stages.map(st => ({
    stage: st,
    count: sites.filter(s => s.status === st).length
  }));

  const rows = sites.map(s => `
    <tr data-filter="${esc(s.status)} ${esc(s.province)} ${esc(s.project)}">
      <td><strong>${esc(s.code || s.id)}</strong></td>
      <td>${esc(s.project)}</td>
      <td>${esc(s.client || 'Unitel')}</td>
      <td><strong>${esc(s.province)}</strong><br><span class="muted">${esc(s.municipality)}</span></td>
      <td><span class="font-mono text-xs">${esc(s.coordinates || '-')}</span></td>
      <td>${esc(s.siteType || 'Greenfield')}</td>
      <td>${badge(s.status)}</td>
      <td>${esc(s.owner || 'Privado')}<br><span class="muted">${esc(s.contact || '')}</span></td>
      <td><span class="muted">${esc(s.ddStatus || '-')}</span></td>
      <td><span class="muted">${esc(s.approvalStatus || '-')}</span></td>
      <td>
        <button class="btn small ghost btn-edit-site" data-id="${esc(s.id)}">Editar</button>
        ${canDelete(role) ? `<button class="btn small danger btn-del-site" data-id="${esc(s.id)}">Eliminar</button>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    ${renderPipelineBar(stageCounts)}

    <div class="toolbar">
      <input id="tableSearch" placeholder="Pesquisar sites (código, município, projeto)...">
      <select id="filterStatus">
        <option value="">Todas as Fases</option>
        ${stages.map(st => `<option value="${st}">${st}</option>`).join('')}
      </select>
      <select id="filterProvince">
        <option value="">Todas as Províncias</option>
        <option value="Luanda">Luanda</option>
        <option value="Benguela">Benguela</option>
        <option value="Huíla">Huíla</option>
        <option value="Cabinda">Cabinda</option>
      </select>
      <button class="btn small" id="btnNewSite">+ Novo Site</button>
      <span class="toolbar-count">${sites.length} site(s)</span>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Inventário & Pipeline de Sites</h3>
          <div class="muted">Acompanhamento granular do ciclo de aquisição por nó de telecomunicações.</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Projeto</th>
              <th>Cliente</th>
              <th>Localização</th>
              <th>Coordenadas GPS</th>
              <th>Tipologia</th>
              <th>Fase Pipeline</th>
              <th>Proprietário do Solo</th>
              <th>Due Diligence</th>
              <th>Aprovações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="11" class="empty">Nenhum site registado</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewTasks(role) {
  const tasks = api.getTasks();
  const rows = tasks.map(t => `
    <tr data-filter="${esc(t.status)} ${esc(t.priority)} ${esc(t.assignee)}">
      <td><strong>${esc(t.id)}</strong></td>
      <td><strong>${esc(t.title)}</strong></td>
      <td>${esc(t.due)}</td>
      <td>${esc(t.assignee)}</td>
      <td>${badge(t.priority)}</td>
      <td>${badge(t.status)}</td>
      <td>
        <button class="btn small ghost btn-edit-task" data-id="${esc(t.id)}">Editar</button>
        ${canDelete(role) ? `<button class="btn small danger btn-del-task" data-id="${esc(t.id)}">Eliminar</button>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    <div class="toolbar">
      <input id="tableSearch" placeholder="Pesquisar tarefas...">
      <select id="filterStatus">
        <option value="">Todos os Estados</option>
        <option value="Pendente">Pendente</option>
        <option value="Em curso">Em curso</option>
        <option value="Concluída">Concluída</option>
        <option value="Atrasada">Atrasada</option>
      </select>
      <select id="filterPriority">
        <option value="">Todas as Prioridades</option>
        <option value="Alta">Alta</option>
        <option value="Média">Média</option>
        <option value="Baixa">Baixa</option>
      </select>
      <button class="btn small" id="btnNewTask">+ Nova Tarefa</button>
      <span class="toolbar-count">${tasks.length} tarefa(s)</span>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Tarefas Operacionais</h3>
          <div class="muted">Gestão de entregáveis técnicos, vistorias de campo e validações legais.</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título da Tarefa</th>
              <th>Prazo</th>
              <th>Responsável</th>
              <th>Prioridade</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7" class="empty">Nenhuma tarefa registada</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewDocuments(role) {
  const docs = api.getDocuments();
  const rows = docs.map(d => `
    <tr data-filter="${esc(d.visibility)} ${esc(d.category)} ${esc(d.client)}">
      <td><strong>${esc(d.id)}</strong></td>
      <td><strong>${esc(d.name)}</strong></td>
      <td>${esc(d.category)}</td>
      <td><span class="badge neutral">${esc(d.type)}</span></td>
      <td>${badge(d.visibility)}</td>
      <td>${esc(d.client || 'Todos')}</td>
      <td>${esc(d.project || 'Geral')}</td>
      <td>${esc(d.uploadDate || '-')}</td>
      <td>${badge(d.status)}</td>
      <td>
        <a class="btn small ghost" href="${esc(d.url)}" download>Download</a>
        <button class="btn small ghost btn-edit-doc" data-id="${esc(d.id)}">Editar</button>
        ${canDelete(role) ? `<button class="btn small danger btn-del-doc" data-id="${esc(d.id)}">Eliminar</button>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    <div class="toolbar">
      <input id="tableSearch" placeholder="Pesquisar documentos...">
      <select id="filterVisibility">
        <option value="">Todas as Visibilidades</option>
        <option value="Público">Público</option>
        <option value="Cliente">Cliente</option>
        <option value="Interno">Interno</option>
      </select>
      <button class="btn small" id="btnNewDoc">+ Carregar Documento</button>
      <span class="toolbar-count">${docs.length} documento(s)</span>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Gestão Documental & Biblioteca Técnica</h3>
          <div class="muted">Auditorias jurídicas, certidões prediais, relatórios de viabilidade e briefs.</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Ficheiro</th>
              <th>Categoria</th>
              <th>Formato</th>
              <th>Visibilidade</th>
              <th>Cliente</th>
              <th>Projeto</th>
              <th>Data Envio</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="10" class="empty">Nenhum documento registado</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewPackages(role) {
  const pkgs = api.getPackages();
  return `
    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Pacotes de Serviço & Preçário</h3>
          <div class="muted">Configuração das soluções comerciais de aquisição de sites em Angola.</div>
        </div>
      </div>
      <div class="pricing-grid" style="padding: 24px;">
        ${pkgs.map(p => `
          <div class="price-card ${p.id === 'PK-002' ? 'featured' : ''}">
            <div class="eyebrow">${esc(p.name)}</div>
            <div class="price">${esc(p.price)}</div>
            <p style="font-size: 13px; margin-bottom: 20px;">${esc(p.description)}</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              ${badge(p.status)}
              <button class="btn small ${p.id === 'PK-002' ? 'light' : 'ghost'} btn-edit-pkg" data-id="${esc(p.id)}">Editar Pacote</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function viewUsers(role) {
  if (!canManageUsers(role)) {
    return `
      <div class="panel">
        <div class="panel-head"><h3>Acesso Restrito</h3></div>
        <div class="panel-body">Apenas o perfil <strong>Master Admin</strong> tem permissão para gerir os utilizadores da plataforma.</div>
      </div>
    `;
  }

  const users = api.getUsers();
  const rows = users.map(u => `
    <tr>
      <td><strong>${esc(u.id)}</strong></td>
      <td><strong>${esc(u.name)}</strong></td>
      <td>${esc(u.email)}</td>
      <td><span class="badge neutral">${esc(u.role)}</span></td>
      <td>${badge(u.status)}</td>
      <td>${esc(u.lastLogin)}</td>
      <td>
        <button class="btn small ghost btn-edit-user" data-id="${esc(u.id)}">Editar</button>
        <button class="btn small danger btn-del-user" data-id="${esc(u.id)}">Eliminar</button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="toolbar">
      <input id="tableSearch" placeholder="Pesquisar utilizadores...">
      <button class="btn small" id="btnNewUser">+ Novo Utilizador</button>
      <span class="toolbar-count">${users.length} utilizador(es)</span>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Gestão de Acessos & Utilizadores</h3>
          <div class="muted">Configuração de contas, perfis RBAC e permissões de segurança.</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil (Role)</th>
              <th>Estado</th>
              <th>Último Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function viewReports() {
  const sites = api.getSites();
  const projects = api.getProjects();
  const requests = api.getRequests();

  const provMap = {};
  sites.forEach(s => {
    provMap[s.province] = (provMap[s.province] || 0) + 1;
  });

  return `
    <div class="kpis">
      ${kpi("Total de Sites", sites.length, "Cadastrados em Angola")}
      ${kpi("Projetos Globais", projects.length, "Em carteira")}
      ${kpi("Taxa Conclusão", Math.round((sites.filter(s => s.status === 'Adquirido').length / (sites.length || 1)) * 100) + "%", "Sites adquiridos / total")}
      ${kpi("Tempo Médio Aprovação", "45 dias", "Média nacional")}
    </div>

    <div class="admin-grid">
      <div class="panel">
        <div class="panel-head">
          <h3>Distribuição Territorial por Província</h3>
          <span class="muted">Concentração de infraestrutura</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Província</th>
                <th>Nº de Sites</th>
                <th>Percentagem</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(provMap).map(([prov, cnt]) => `
                <tr>
                  <td><strong>${esc(prov)}</strong></td>
                  <td>${cnt} site(s)</td>
                  <td>${Math.round((cnt / sites.length) * 100)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Progresso Médio por Projeto</h3>
          <span class="muted">Execução física e legal</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Cliente</th>
                <th>Progresso</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(p => `
                <tr>
                  <td><strong>${esc(p.name)}</strong></td>
                  <td>${esc(p.client)}</td>
                  <td>
                    <span>${esc(p.progress)}%</span>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${Number(p.progress || 0)}%;"></div></div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function viewAudit() {
  const audit = api.getAudit();
  const rows = audit.map(a => `
    <tr data-filter="${esc(a.module)} ${esc(a.user)}">
      <td><strong>${esc(a.id)}</strong></td>
      <td><strong>${esc(a.action)}</strong></td>
      <td>${esc(a.user)}</td>
      <td>${esc(a.date)}</td>
      <td><span class="badge neutral">${esc(a.module)}</span></td>
      <td>${esc(a.record || '-')}</td>
    </tr>
  `).join('');

  return `
    <div class="toolbar">
      <input id="tableSearch" placeholder="Pesquisar registos de auditoria...">
      <select id="filterModule">
        <option value="">Todos os Módulos</option>
        <option value="Sistema">Sistema</option>
        <option value="Pedidos">Pedidos</option>
        <option value="Sites">Sites</option>
        <option value="Projetos">Projetos</option>
        <option value="Clientes">Clientes</option>
        <option value="Leads">Leads</option>
      </select>
      <span class="toolbar-count">${audit.length} registo(s)</span>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Registo de Auditoria Operacional (Audit Trail)</h3>
          <div class="muted">Rastreabilidade integral de modificações, acessos e transições de estado.</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ação Executada</th>
              <th>Utilizador</th>
              <th>Data & Hora</th>
              <th>Módulo</th>
              <th>Referência</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function viewSettings(role) {
  return `
    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Definições da Plataforma</h3>
          <div class="muted">Configurações gerais e parâmetros operacionais de Angola.</div>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field">
            <label>Nome da Organização</label>
            <input value="Site Acquisition Angola" ${role === 'Master Admin' ? '' : 'disabled'}>
          </div>
          <div class="field">
            <label>Moeda Padrão de Contratos</label>
            <select ${role === 'Master Admin' ? '' : 'disabled'}>
              <option selected>Kz — Kwanzas (AOA)</option>
              <option>USD — Dólares Americanos</option>
            </select>
          </div>
          <div class="field">
            <label>Camada de Persistência</label>
            <select ${role === 'Master Admin' ? '' : 'disabled'}>
              <option selected>Armazenamento Local (Mock State v2)</option>
              <option disabled>Cloudflare D1 + Workers (A Conectar)</option>
            </select>
          </div>
          <div class="field">
            <label>Notificações por Email</label>
            <select ${role === 'Master Admin' ? '' : 'disabled'}>
              <option selected>Ativas (contacto@siteacquisition.co.ao)</option>
              <option>Desativadas</option>
            </select>
          </div>
        </div>

        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--line);">
          <h4 style="margin-bottom: 8px;">Reposição de Dados de Demonstração</h4>
          <p class="muted" style="margin-bottom: 14px;">Repõe os clientes, projetos, sites e leads oficiais de Angola no estado inicial.</p>
          <button class="btn small alt" id="btnResetSeed">Repor Dados Iniciais</button>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h3>Matriz de Permissões (RBAC)</h3>
      </div>
      <div class="panel-body text-xs" style="line-height: 1.8;">
        <p><strong>Master Admin:</strong> Acesso irrestrito a todos os módulos, utilizadores, auditoria e eliminação de registos.</p>
        <p><strong>Admin:</strong> Gestão operacional completa de leads, clientes, projetos, sites, tarefas e documentos.</p>
        <p><strong>Manager:</strong> Coordenação de projetos, atribuição de tarefas e supervisão do avanço dos sites.</p>
        <p><strong>Staff:</strong> Acompanhamento de campo, due diligence e atualização de estados de sites atribuídos.</p>
        <p><strong>Client:</strong> Acesso restrito ao Portal do Cliente exclusivamente com dados próprios da conta.</p>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// INTERNAL PORTAL SHELL & ROUTER
// -------------------------------------------------------------

function renderInternalPortal(role, activeView) {
  const root = document.getElementById('dashboardRoot');
  if (!root) return;

  const navItems = [
    ["overview", "Visão Geral"],
    ["leads", "Leads"],
    ["clients", "Clientes"],
    ["requests", "Pedidos de Site"],
    ["projects", "Projetos"],
    ["sites", "Sites"],
    ["tasks", "Tarefas"],
    ["documents", "Documentos"],
    ["packages", "Pacotes & Preços"],
    ["users", "Utilizadores"],
    ["reports", "Relatórios"],
    ["audit", "Auditoria"],
    ["settings", "Definições"]
  ];

  let viewHtml = '';
  switch (activeView) {
    case 'leads': viewHtml = viewLeads(role); break;
    case 'clients': viewHtml = viewClients(role); break;
    case 'requests': viewHtml = viewRequests(role); break;
    case 'projects': viewHtml = viewProjects(role); break;
    case 'sites': viewHtml = viewSites(role); break;
    case 'tasks': viewHtml = viewTasks(role); break;
    case 'documents': viewHtml = viewDocuments(role); break;
    case 'packages': viewHtml = viewPackages(role); break;
    case 'users': viewHtml = viewUsers(role); break;
    case 'reports': viewHtml = viewReports(); break;
    case 'audit': viewHtml = viewAudit(); break;
    case 'settings': viewHtml = viewSettings(role); break;
    default: viewHtml = viewOverview(role); break;
  }

  const titleMap = {
    overview: "Visão Geral Operacional",
    leads: "Gestão de Leads",
    clients: "Clientes Corporativos",
    requests: "Pedidos de Aquisição de Sites",
    projects: "Projetos de Expansão",
    sites: "Inventário de Sites & Pipeline",
    tasks: "Tarefas & Vistorias",
    documents: "Documentação & Pareceres",
    packages: "Pacotes de Serviços",
    users: "Gestão de Utilizadores",
    reports: "Relatórios & Estatísticas",
    audit: "Auditoria do Sistema",
    settings: "Definições Gerais"
  };

  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <a href="index.html">SITE ACQUISITION</a>
        </div>
        <div class="role-badge">
          <span>PERFIL: ${esc(role)}</span>
          <span style="opacity:0.5;">ONLINE</span>
        </div>
        <nav class="menu">
          ${navItems.map(([id, label]) => `
            <button class="${id === activeView ? 'active' : ''}" data-nav="${id}">
              <span>${esc(label)}</span>
            </button>
          `).join('')}
        </nav>
        <div class="sidebar-bottom">
          <a href="client.html" id="linkClientPortal">→ Portal do Cliente</a>
          <a href="index.html">← Website Público</a>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="title">${esc(titleMap[activeView] || "Visão Geral")}</div>
          <div class="topbar-actions">
            <span class="muted" style="font-size:11px;">Mudar Perfil:</span>
            <select class="role-switcher-select" id="roleSelector">
              <option value="Master Admin" ${role === 'Master Admin' ? 'selected' : ''}>Master Admin</option>
              <option value="Admin" ${role === 'Admin' ? 'selected' : ''}>Admin</option>
              <option value="Manager" ${role === 'Manager' ? 'selected' : ''}>Manager</option>
              <option value="Staff" ${role === 'Staff' ? 'selected' : ''}>Staff</option>
            </select>
            <div class="avatar" title="${esc(role)}">
              ${role === 'Master Admin' ? 'MA' : role === 'Manager' ? 'MG' : role === 'Staff' ? 'ST' : 'AD'}
            </div>
          </div>
        </header>

        <section class="content">
          ${viewHtml}
        </section>
      </main>
    </div>
  `;

  // Attach navigation listeners
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.onclick = () => {
      const target = btn.dataset.nav;
      history.pushState(null, '', `dashboard.html?view=${target}&role=${encodeURIComponent(role)}`);
      renderInternalPortal(role, target);
    };
  });

  // Role selector listener
  const roleSel = document.getElementById('roleSelector');
  if (roleSel) {
    roleSel.onchange = (e) => {
      const newRole = e.target.value;
      history.pushState(null, '', `dashboard.html?view=${activeView}&role=${encodeURIComponent(newRole)}`);
      renderInternalPortal(newRole, activeView);
    };
  }

  // Reset seed button
  const resetBtn = document.getElementById('btnResetSeed');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm("Deseja repor todos os dados iniciais? As alterações personalizadas serão repostas.")) {
        api.resetData();
        renderInternalPortal(role, activeView);
      }
    };
  }

  // Generic table search listener
  const searchInput = document.getElementById('tableSearch');
  if (searchInput) {
    searchInput.oninput = () => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll('tbody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none';
      });
    };
  }

  // Filter dropdown listeners
  const filterDropdowns = document.querySelectorAll('.toolbar select');
  filterDropdowns.forEach(sel => {
    sel.onchange = () => {
      const val = sel.value.toLowerCase();
      document.querySelectorAll('tbody tr').forEach(row => {
        const filterData = (row.dataset.filter || row.innerText).toLowerCase();
        row.style.display = (!val || filterData.includes(val)) ? '' : 'none';
      });
    };
  });

  // Attach modal handlers for current view
  wireEntityModals(role, activeView);
}

// -------------------------------------------------------------
// CLIENT PORTAL IMPLEMENTATION
// -------------------------------------------------------------

function renderClientPortal(activeView = 'overview') {
  const root = document.getElementById('clientRoot');
  if (!root) return;

  const clients = api.getClients();
  const currentClient = clients[0] || { name: "Unitel S.A." };

  const allProjects = api.getProjects().filter(p => p.client === currentClient.name || p.client === "Unitel");
  const allRequests = api.getRequests().filter(r => r.client === currentClient.name || r.client === "Unitel");
  const allSites = api.getSites().filter(s => s.client === currentClient.name || s.client === "Unitel");
  const allDocs = api.getDocuments().filter(d => d.visibility !== 'Interno');
  const allMessages = api.getMessages(currentClient.name);

  let viewHtml = '';

  if (activeView === 'requests') {
    viewHtml = `
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Meus Pedidos de Aquisição</h3>
            <div class="muted">Acompanhamento de novos nós de cobertura solicitados.</div>
          </div>
          <button class="btn small" id="btnClientNewReq">+ Novo Pedido</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Província / Município</th>
                <th>Área Preferencial</th>
                <th>Sites</th>
                <th>Tipologia</th>
                <th>Estado</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              ${allRequests.map(r => `
                <tr>
                  <td><strong>${esc(r.id)}</strong></td>
                  <td>${esc(r.region)} / ${esc(r.municipality)}</td>
                  <td>${esc(r.preferredArea || '-')}</td>
                  <td><strong>${esc(r.sites)}</strong></td>
                  <td>${esc(r.deploymentUse || 'Greenfield')}</td>
                  <td>${badge(r.status)}</td>
                  <td>${esc(r.created)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (activeView === 'projects') {
    viewHtml = `
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Meus Projetos de Expansão</h3>
            <div class="muted">Programas contratados com a Site Acquisition Angola.</div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Província</th>
                <th>Sites Alocados</th>
                <th>Estado</th>
                <th>Progresso</th>
                <th>Data Alvo</th>
              </tr>
            </thead>
            <tbody>
              ${allProjects.map(p => `
                <tr>
                  <td><strong>${esc(p.name)}</strong></td>
                  <td>${esc(p.province)}</td>
                  <td>${esc(p.sites)}</td>
                  <td>${badge(p.status)}</td>
                  <td style="min-width: 140px;">
                    <span>${esc(p.progress)}%</span>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${Number(p.progress || 0)}%;"></div></div>
                  </td>
                  <td>${esc(p.targetDate || '-')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (activeView === 'sites') {
    viewHtml = `
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Meus Sites em Aquisição</h3>
            <div class="muted">Estado de cada localização candidata e fase do pipeline legal.</div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código do Site</th>
                <th>Projeto</th>
                <th>Província / Município</th>
                <th>Coordenadas GPS</th>
                <th>Tipologia</th>
                <th>Fase Atual</th>
                <th>Due Diligence</th>
              </tr>
            </thead>
            <tbody>
              ${allSites.map(s => `
                <tr>
                  <td><strong>${esc(s.code || s.id)}</strong></td>
                  <td>${esc(s.project)}</td>
                  <td>${esc(s.province)} / ${esc(s.municipality)}</td>
                  <td><span class="font-mono text-xs">${esc(s.coordinates)}</span></td>
                  <td>${esc(s.siteType)}</td>
                  <td>${badge(s.status)}</td>
                  <td>${esc(s.ddStatus || '-')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (activeView === 'documents') {
    viewHtml = `
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Documentos & Relatórios Disponibilizados</h3>
            <div class="muted">Dossiers de viabilidade técnica, pareceres e documentação legal.</div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Categoria</th>
                <th>Formato</th>
                <th>Projeto / Site</th>
                <th>Data</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              ${allDocs.map(d => `
                <tr>
                  <td><strong>${esc(d.name)}</strong></td>
                  <td>${esc(d.category)}</td>
                  <td><span class="badge neutral">${esc(d.type)}</span></td>
                  <td>${esc(d.project || 'Geral')} (${esc(d.site || 'N/A')})</td>
                  <td>${esc(d.uploadDate || '-')}</td>
                  <td><a class="btn small ghost" href="${esc(d.url)}" download>Descarregar</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (activeView === 'messages') {
    viewHtml = `
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Comunicação com Gestor de Conta</h3>
            <div class="muted">Canal direto para alinhamento operacional e esclarecimento de dúvidas.</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="list" style="margin-bottom: 24px;">
            ${allMessages.map(m => `
              <div class="list-item">
                <div style="display:flex; justify-content:space-between;">
                  <strong>${esc(m.subject)}</strong>
                  <span class="muted">${esc(m.date)}</span>
                </div>
                <div class="activity" style="font-weight:600; color:#333;">De: ${esc(m.sender)}</div>
                <p style="font-size:12.5px; margin: 4px 0 0; color:#444;">${esc(m.content)}</p>
              </div>
            `).join('')}
          </div>

          <form id="clientMsgForm" class="form-grid">
            <div class="field full">
              <label>Assunto</label>
              <input name="subject" required placeholder="Ex: Dúvida sobre certidão do site Talatona">
            </div>
            <div class="field full">
              <label>Mensagem</label>
              <textarea name="content" required placeholder="Escreva a sua mensagem para a equipa de aquisição..."></textarea>
            </div>
            <div class="field full">
              <button class="btn small" type="submit">Enviar Mensagem</button>
            </div>
          </form>
        </div>
      </div>
    `;
  } else if (activeView === 'profile') {
    viewHtml = `
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Perfil da Conta Corporativa</h3>
            <div class="muted">Dados de faturação e interlocutor oficial.</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="form-grid">
            <div class="field">
              <label>Empresa</label>
              <input value="${esc(currentClient.name)}" disabled>
            </div>
            <div class="field">
              <label>Setor de Atividade</label>
              <input value="${esc(currentClient.industry)}" disabled>
            </div>
            <div class="field">
              <label>Pessoa de Contacto</label>
              <input value="${esc(currentClient.contact)}">
            </div>
            <div class="field">
              <label>Email de Notificações</label>
              <input value="${esc(currentClient.email)}">
            </div>
            <div class="field">
              <label>Telefone</label>
              <input value="${esc(currentClient.phone || '+244 923 112 233')}">
            </div>
            <div class="field">
              <label>Gestor Dedicado Site Acquisition</label>
              <input value="Eng. Pedro Mbala (pedro.mbala@siteacquisition.co.ao)" disabled>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // Overview
    viewHtml = `
      <div class="kpis">
        ${kpi("Meus Projetos", allProjects.length, "Ativos em Angola")}
        ${kpi("Pedidos Efetuados", allRequests.length, "Registados no sistema")}
        ${kpi("Sites em Processo", allSites.length, "Localizações")}
        ${kpi("Documentos", allDocs.length, "Disponíveis para download")}
      </div>

      <div class="panel" style="margin-bottom: 24px;">
        <div class="panel-head">
          <div>
            <h3>Bem-vindo ao Portal do Cliente</h3>
            <div class="muted">${esc(currentClient.name)} · Acompanhamento de aquisição de infraestrutura em Angola.</div>
          </div>
          <button class="btn small" id="btnClientNewReq">+ Solicitar Novo Site</button>
        </div>
      </div>

      <div class="admin-grid">
        <div class="panel">
          <div class="panel-head">
            <h3>Projetos em Curso</h3>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Província</th>
                  <th>Estado</th>
                  <th>Progresso</th>
                </tr>
              </thead>
              <tbody>
                ${allProjects.map(p => `
                  <tr>
                    <td><strong>${esc(p.name)}</strong></td>
                    <td>${esc(p.province)}</td>
                    <td>${badge(p.status)}</td>
                    <td>${esc(p.progress)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <h3>Documentos Recentes</h3>
          </div>
          <div class="list" style="padding: 16px;">
            ${allDocs.slice(0, 4).map(d => `
              <div class="list-item">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong>${esc(d.name)}</strong>
                    <div class="activity">${esc(d.category)} · ${esc(d.type)}</div>
                  </div>
                  <a class="btn small ghost" href="${esc(d.url)}" download>Download</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <a href="index.html">SITE ACQUISITION</a>
        </div>
        <div class="role-badge">
          <span>PORTAL DO CLIENTE</span>
        </div>
        <nav class="menu">
          <button class="${activeView === 'overview' ? 'active' : ''}" data-cnav="overview">Visão Geral</button>
          <button class="${activeView === 'requests' ? 'active' : ''}" data-cnav="requests">Meus Pedidos</button>
          <button class="${activeView === 'projects' ? 'active' : ''}" data-cnav="projects">Meus Projetos</button>
          <button class="${activeView === 'sites' ? 'active' : ''}" data-cnav="sites">Meus Sites</button>
          <button class="${activeView === 'documents' ? 'active' : ''}" data-cnav="documents">Documentos</button>
          <button class="${activeView === 'messages' ? 'active' : ''}" data-cnav="messages">Mensagens</button>
          <button class="${activeView === 'profile' ? 'active' : ''}" data-cnav="profile">Perfil</button>
        </nav>
        <div class="sidebar-bottom">
          <a href="dashboard.html">→ Acesso Operacional (CRM)</a>
          <a href="index.html">← Website Público</a>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="title">Portal do Cliente — ${esc(currentClient.name)}</div>
          <div class="topbar-actions">
            <a class="btn small ghost" href="index.html">Website</a>
            <div class="avatar">CL</div>
          </div>
        </header>

        <section class="content">
          ${viewHtml}
        </section>
      </main>
    </div>
  `;

  // Attach navigation listeners for client
  document.querySelectorAll('[data-cnav]').forEach(btn => {
    btn.onclick = () => renderClientPortal(btn.dataset.cnav);
  });

  // Client new request button
  const reqBtn = document.getElementById('btnClientNewReq');
  if (reqBtn) {
    reqBtn.onclick = () => openClientRequestModal(currentClient.name);
  }

  // Client message submit
  const msgForm = document.getElementById('clientMsgForm');
  if (msgForm) {
    msgForm.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(msgForm);
      api.sendMessage({
        sender: currentClient.name,
        recipient: "Eng. Pedro Mbala (Gestor)",
        subject: fd.get('subject'),
        content: fd.get('content')
      });
      alert("Mensagem enviada com sucesso ao seu gestor de projeto.");
      renderClientPortal('messages');
    };
  }
}

// -------------------------------------------------------------
// MODALS SYSTEM (ADD & EDIT)
// -------------------------------------------------------------

function openClientRequestModal(clientName) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  modal.querySelector('.modal-card').innerHTML = `
    <div class="modal-head">
      <h3>Novo Pedido de Aquisição de Site</h3>
      <button class="close" id="closeModal">&times;</button>
    </div>
    <form id="modalClientReqForm" class="form-grid">
      <div class="field">
        <label>Cliente</label>
        <input name="client" value="${esc(clientName)}" readonly>
      </div>
      <div class="field">
        <label>Província Pretendida</label>
        <select name="region">
          <option>Luanda</option>
          <option>Benguela</option>
          <option>Huíla</option>
          <option>Cabinda</option>
          <option>Cuanza Sul</option>
          <option>Huambo</option>
        </select>
      </div>
      <div class="field">
        <label>Município</label>
        <input name="municipality" required placeholder="Ex: Talatona, Belas, Lobito...">
      </div>
      <div class="field">
        <label>Área / Bairro Preferencial</label>
        <input name="preferredArea" placeholder="Ex: Zona Industrial, Eixo Viário principal">
      </div>
      <div class="field">
        <label>Nº de Sites</label>
        <input name="sites" type="number" min="1" value="1" required>
      </div>
      <div class="field">
        <label>Tipologia de Estrutura</label>
        <select name="deploymentUse">
          <option>Greenfield Tower (Torre em Solo)</option>
          <option>Rooftop Mast (Topo de Edifício)</option>
          <option>Co-location (Partilha)</option>
        </select>
      </div>
      <div class="field full">
        <label>Prazo Desejado</label>
        <select name="timeframe">
          <option>Imediato (&lt; 30 dias)</option>
          <option selected>1 a 3 meses</option>
          <option>3 a 6 meses</option>
        </select>
      </div>
      <div class="field full">
        <div class="form-actions">
          <button class="btn" type="submit">Submeter Pedido</button>
          <button class="btn alt" type="button" id="cancelModal">Cancelar</button>
        </div>
      </div>
    </form>
  `;

  modal.classList.add('show');
  document.getElementById('closeModal').onclick = () => modal.classList.remove('show');
  document.getElementById('cancelModal').onclick = () => modal.classList.remove('show');

  document.getElementById('modalClientReqForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    api.saveRequest({
      client: fd.get('client'),
      region: fd.get('region'),
      municipality: fd.get('municipality'),
      preferredArea: fd.get('preferredArea'),
      sites: Number(fd.get('sites')),
      projectType: "Telefonia Móvel / BTS",
      deploymentUse: fd.get('deploymentUse'),
      timeframe: fd.get('timeframe'),
      status: "Novo",
      assigned: "Não atribuído"
    }, clientName);
    modal.classList.remove('show');
    renderClientPortal('requests');
  };
}

function wireEntityModals(role, activeView) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  function closeModal() {
    modal.classList.remove('show');
  }

  // --- LEADS ---
  const btnNewLead = document.getElementById('btnNewLead');
  if (btnNewLead) {
    btnNewLead.onclick = () => showLeadModal(null);
  }
  document.querySelectorAll('.btn-edit-lead').forEach(b => {
    b.onclick = () => {
      const lead = api.getLeads().find(l => l.id === b.dataset.id);
      showLeadModal(lead);
    };
  });
  document.querySelectorAll('.btn-del-lead').forEach(b => {
    b.onclick = () => {
      if (confirm(`Eliminar o lead ${b.dataset.id}?`)) {
        api.deleteLead(b.dataset.id, role);
        renderInternalPortal(role, activeView);
      }
    };
  });

  function showLeadModal(lead) {
    const isEdit = !!lead;
    modal.querySelector('.modal-card').innerHTML = `
      <div class="modal-head">
        <h3>${isEdit ? 'Editar Lead' : 'Novo Lead'}</h3>
        <button class="close" id="closeModal">&times;</button>
      </div>
      <form id="leadModalForm" class="form-grid">
        <div class="field">
          <label>Empresa *</label>
          <input name="company" required value="${esc(lead?.company || '')}">
        </div>
        <div class="field">
          <label>Contacto *</label>
          <input name="contact" required value="${esc(lead?.contact || '')}">
        </div>
        <div class="field">
          <label>Email *</label>
          <input name="email" type="email" required value="${esc(lead?.email || '')}">
        </div>
        <div class="field">
          <label>Telefone</label>
          <input name="phone" value="${esc(lead?.phone || '')}">
        </div>
        <div class="field">
          <label>Província</label>
          <select name="province">
            ${["Luanda", "Benguela", "Huíla", "Cabinda", "Cuanza Sul", "Huambo"].map(p => `
              <option value="${p}" ${lead?.province === p ? 'selected' : ''}>${p}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label>Origem</label>
          <select name="source">
            ${["Website", "Indicação", "Prospeção Direta", "Concurso"].map(s => `
              <option value="${s}" ${lead?.source === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label>Prioridade</label>
          <select name="priority">
            ${["Alta", "Média", "Baixa"].map(p => `
              <option value="${p}" ${lead?.priority === p ? 'selected' : ''}>${p}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label>Estado</label>
          <select name="status">
            ${["Novo", "Qualificado", "Em contacto", "Em negociação", "Convertido", "Perdido"].map(s => `
              <option value="${s}" ${lead?.status === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>
        </div>
        <div class="field full">
          <label>Descrição do Pedido / Notas</label>
          <textarea name="description">${esc(lead?.description || '')}</textarea>
        </div>
        <div class="field full">
          <div class="form-actions">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn alt" type="button" id="cancelModal">Cancelar</button>
          </div>
        </div>
      </form>
    `;
    modal.classList.add('show');
    document.getElementById('closeModal').onclick = closeModal;
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('leadModalForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      api.saveLead({
        id: lead?.id,
        company: fd.get('company'),
        contact: fd.get('contact'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        province: fd.get('province'),
        source: fd.get('source'),
        category: "Telecomunicações",
        priority: fd.get('priority'),
        status: fd.get('status'),
        owner: role,
        description: fd.get('description')
      }, role);
      closeModal();
      renderInternalPortal(role, activeView);
    };
  }

  // --- CLIENTS ---
  const btnNewClient = document.getElementById('btnNewClient');
  if (btnNewClient) btnNewClient.onclick = () => showClientModal(null);
  document.querySelectorAll('.btn-edit-client').forEach(b => {
    b.onclick = () => showClientModal(api.getClients().find(c => c.id === b.dataset.id));
  });
  document.querySelectorAll('.btn-del-client').forEach(b => {
    b.onclick = () => {
      if (confirm(`Eliminar o cliente ${b.dataset.id}?`)) {
        api.deleteClient(b.dataset.id, role);
        renderInternalPortal(role, activeView);
      }
    };
  });

  function showClientModal(client) {
    const isEdit = !!client;
    modal.querySelector('.modal-card').innerHTML = `
      <div class="modal-head">
        <h3>${isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h3>
        <button class="close" id="closeModal">&times;</button>
      </div>
      <form id="clientModalForm" class="form-grid">
        <div class="field">
          <label>Nome da Empresa *</label>
          <input name="name" required value="${esc(client?.name || '')}">
        </div>
        <div class="field">
          <label>Setor / Indústria</label>
          <input name="industry" value="${esc(client?.industry || 'Telecomunicações')}">
        </div>
        <div class="field">
          <label>Pessoa de Contacto *</label>
          <input name="contact" required value="${esc(client?.contact || '')}">
        </div>
        <div class="field">
          <label>Email *</label>
          <input name="email" type="email" required value="${esc(client?.email || '')}">
        </div>
        <div class="field">
          <label>Telefone</label>
          <input name="phone" value="${esc(client?.phone || '')}">
        </div>
        <div class="field">
          <label>Estado</label>
          <select name="status">
            <option value="Ativo" ${client?.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
            <option value="Inativo" ${client?.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
          </select>
        </div>
        <div class="field full">
          <div class="form-actions">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn alt" type="button" id="cancelModal">Cancelar</button>
          </div>
        </div>
      </form>
    `;
    modal.classList.add('show');
    document.getElementById('closeModal').onclick = closeModal;
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('clientModalForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      api.saveClient({
        id: client?.id,
        name: fd.get('name'),
        industry: fd.get('industry'),
        contact: fd.get('contact'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        status: fd.get('status'),
        owner: role
      }, role);
      closeModal();
      renderInternalPortal(role, activeView);
    };
  }

  // --- SITES ---
  const btnNewSite = document.getElementById('btnNewSite');
  if (btnNewSite) btnNewSite.onclick = () => showSiteModal(null);
  document.querySelectorAll('.btn-edit-site').forEach(b => {
    b.onclick = () => showSiteModal(api.getSites().find(s => s.id === b.dataset.id));
  });
  document.querySelectorAll('.btn-del-site').forEach(b => {
    b.onclick = () => {
      if (confirm(`Eliminar o site ${b.dataset.id}?`)) {
        api.deleteSite(b.dataset.id, role);
        renderInternalPortal(role, activeView);
      }
    };
  });

  function showSiteModal(site) {
    const isEdit = !!site;
    const stages = ["Identificado", "Viabilidade", "Due Diligence", "Negociação", "Aprovação", "Adquirido"];
    modal.querySelector('.modal-card').innerHTML = `
      <div class="modal-head">
        <h3>${isEdit ? 'Editar Site' : 'Registar Novo Site'}</h3>
        <button class="close" id="closeModal">&times;</button>
      </div>
      <form id="siteModalForm" class="form-grid">
        <div class="field">
          <label>Código do Site *</label>
          <input name="code" required value="${esc(site?.code || 'LDA-TA-00' + (api.getSites().length + 1))}">
        </div>
        <div class="field">
          <label>Projeto Associado</label>
          <input name="project" required value="${esc(site?.project || 'Expansão Luanda Sul 5G/4G')}">
        </div>
        <div class="field">
          <label>Província *</label>
          <select name="province">
            ${["Luanda", "Benguela", "Huíla", "Cabinda", "Cuanza Sul", "Huambo"].map(p => `
              <option value="${p}" ${site?.province === p ? 'selected' : ''}>${p}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label>Município *</label>
          <input name="municipality" required value="${esc(site?.municipality || 'Talatona')}">
        </div>
        <div class="field">
          <label>Coordenadas GPS (Lat, Long)</label>
          <input name="coordinates" placeholder="-8.9245, 13.1872" value="${esc(site?.coordinates || '')}">
        </div>
        <div class="field">
          <label>Tipologia de Site</label>
          <select name="siteType">
            ${["Greenfield Tower (45m)", "Greenfield Lattice (50m)", "Rooftop Mast (15m)", "Co-location", "Terreno Comercial"].map(t => `
              <option value="${t}" ${site?.siteType === t ? 'selected' : ''}>${t}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label>Fase do Pipeline *</label>
          <select name="status">
            ${stages.map(st => `
              <option value="${st}" ${site?.status === st ? 'selected' : ''}>${st}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label>Proprietário do Solo</label>
          <input name="owner" value="${esc(site?.owner || '')}">
        </div>
        <div class="field">
          <label>Contacto do Proprietário</label>
          <input name="contact" value="${esc(site?.contact || '')}">
        </div>
        <div class="field">
          <label>Estado Due Diligence</label>
          <input name="ddStatus" value="${esc(site?.ddStatus || 'Em verificação')}">
        </div>
        <div class="field full">
          <label>Notas Técnicas & Acessos</label>
          <textarea name="notes">${esc(site?.notes || '')}</textarea>
        </div>
        <div class="field full">
          <div class="form-actions">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn alt" type="button" id="cancelModal">Cancelar</button>
          </div>
        </div>
      </form>
    `;
    modal.classList.add('show');
    document.getElementById('closeModal').onclick = closeModal;
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('siteModalForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      api.saveSite({
        id: site?.id,
        code: fd.get('code'),
        project: fd.get('project'),
        client: site?.client || "Unitel S.A.",
        province: fd.get('province'),
        municipality: fd.get('municipality'),
        coordinates: fd.get('coordinates'),
        siteType: fd.get('siteType'),
        status: fd.get('status'),
        owner: fd.get('owner'),
        contact: fd.get('contact'),
        ddStatus: fd.get('ddStatus'),
        notes: fd.get('notes')
      }, role);
      closeModal();
      renderInternalPortal(role, activeView);
    };
  }

  // --- PROJECTS ---
  const btnNewProj = document.getElementById('btnNewProj');
  if (btnNewProj) btnNewProj.onclick = () => showProjectModal(null);
  document.querySelectorAll('.btn-edit-proj').forEach(b => {
    b.onclick = () => showProjectModal(api.getProjects().find(p => p.id === b.dataset.id));
  });
  document.querySelectorAll('.btn-del-proj').forEach(b => {
    b.onclick = () => {
      if (confirm(`Eliminar o projeto ${b.dataset.id}?`)) {
        api.deleteProject(b.dataset.id, role);
        renderInternalPortal(role, activeView);
      }
    };
  });

  function showProjectModal(proj) {
    const isEdit = !!proj;
    modal.querySelector('.modal-card').innerHTML = `
      <div class="modal-head">
        <h3>${isEdit ? 'Editar Projeto' : 'Novo Projeto'}</h3>
        <button class="close" id="closeModal">&times;</button>
      </div>
      <form id="projModalForm" class="form-grid">
        <div class="field">
          <label>Nome do Projeto *</label>
          <input name="name" required value="${esc(proj?.name || '')}">
        </div>
        <div class="field">
          <label>Cliente Associado *</label>
          <input name="client" required value="${esc(proj?.client || 'Unitel S.A.')}">
        </div>
        <div class="field">
          <label>Província</label>
          <input name="province" value="${esc(proj?.province || 'Luanda')}">
        </div>
        <div class="field">
          <label>Nº de Sites</label>
          <input name="sites" type="number" min="1" value="${esc(proj?.sites || 4)}">
        </div>
        <div class="field">
          <label>Progresso (%)</label>
          <input name="progress" type="number" min="0" max="100" value="${esc(proj?.progress || 0)}">
        </div>
        <div class="field">
          <label>Estado</label>
          <select name="status">
            ${["Planeamento", "Em curso", "Em aprovação", "Concluído", "Suspenso"].map(s => `
              <option value="${s}" ${proj?.status === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>
        </div>
        <div class="field full">
          <label>Notas de Coordenação</label>
          <textarea name="notes">${esc(proj?.notes || '')}</textarea>
        </div>
        <div class="field full">
          <div class="form-actions">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn alt" type="button" id="cancelModal">Cancelar</button>
          </div>
        </div>
      </form>
    `;
    modal.classList.add('show');
    document.getElementById('closeModal').onclick = closeModal;
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('projModalForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      api.saveProject({
        id: proj?.id,
        name: fd.get('name'),
        client: fd.get('client'),
        province: fd.get('province'),
        sites: Number(fd.get('sites')),
        progress: Number(fd.get('progress')),
        status: fd.get('status'),
        owner: role,
        notes: fd.get('notes')
      }, role);
      closeModal();
      renderInternalPortal(role, activeView);
    };
  }

  // --- TASKS ---
  const btnNewTask = document.getElementById('btnNewTask');
  if (btnNewTask) btnNewTask.onclick = () => showTaskModal(null);
  document.querySelectorAll('.btn-edit-task').forEach(b => {
    b.onclick = () => showTaskModal(api.getTasks().find(t => t.id === b.dataset.id));
  });
  document.querySelectorAll('.btn-del-task').forEach(b => {
    b.onclick = () => {
      if (confirm(`Eliminar a tarefa ${b.dataset.id}?`)) {
        api.deleteTask(b.dataset.id, role);
        renderInternalPortal(role, activeView);
      }
    };
  });

  function showTaskModal(task) {
    const isEdit = !!task;
    modal.querySelector('.modal-card').innerHTML = `
      <div class="modal-head">
        <h3>${isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
        <button class="close" id="closeModal">&times;</button>
      </div>
      <form id="taskModalForm" class="form-grid">
        <div class="field full">
          <label>Título da Tarefa *</label>
          <input name="title" required value="${esc(task?.title || '')}">
        </div>
        <div class="field">
          <label>Prazo</label>
          <input name="due" value="${esc(task?.due || '15/10/2026')}">
        </div>
        <div class="field">
          <label>Responsável</label>
          <input name="assignee" value="${esc(task?.assignee || role)}">
        </div>
        <div class="field">
          <label>Prioridade</label>
          <select name="priority">
            <option value="Alta" ${task?.priority === 'Alta' ? 'selected' : ''}>Alta</option>
            <option value="Média" ${task?.priority === 'Média' ? 'selected' : ''}>Média</option>
            <option value="Baixa" ${task?.priority === 'Baixa' ? 'selected' : ''}>Baixa</option>
          </select>
        </div>
        <div class="field">
          <label>Estado</label>
          <select name="status">
            <option value="Pendente" ${task?.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
            <option value="Em curso" ${task?.status === 'Em curso' ? 'selected' : ''}>Em curso</option>
            <option value="Concluída" ${task?.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
          </select>
        </div>
        <div class="field full">
          <div class="form-actions">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn alt" type="button" id="cancelModal">Cancelar</button>
          </div>
        </div>
      </form>
    `;
    modal.classList.add('show');
    document.getElementById('closeModal').onclick = closeModal;
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('taskModalForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      api.saveTask({
        id: task?.id,
        title: fd.get('title'),
        due: fd.get('due'),
        assignee: fd.get('assignee'),
        priority: fd.get('priority'),
        status: fd.get('status')
      }, role);
      closeModal();
      renderInternalPortal(role, activeView);
    };
  }

  // --- DOCUMENTS ---
  const btnNewDoc = document.getElementById('btnNewDoc');
  if (btnNewDoc) btnNewDoc.onclick = () => showDocModal(null);
  document.querySelectorAll('.btn-edit-doc').forEach(b => {
    b.onclick = () => showDocModal(api.getDocuments().find(d => d.id === b.dataset.id));
  });
  document.querySelectorAll('.btn-del-doc').forEach(b => {
    b.onclick = () => {
      if (confirm(`Remover o documento ${b.dataset.id}?`)) {
        api.deleteDocument(b.dataset.id, role);
        renderInternalPortal(role, activeView);
      }
    };
  });

  function showDocModal(doc) {
    const isEdit = !!doc;
    modal.querySelector('.modal-card').innerHTML = `
      <div class="modal-head">
        <h3>${isEdit ? 'Editar Documento' : 'Carregar Documento'}</h3>
        <button class="close" id="closeModal">&times;</button>
      </div>
      <form id="docModalForm" class="form-grid">
        <div class="field full">
          <label>Nome do Documento *</label>
          <input name="name" required value="${esc(doc?.name || '')}">
        </div>
        <div class="field">
          <label>Categoria</label>
          <select name="category">
            ${["Institucional", "Serviços", "Técnico", "Due Diligence", "Legal"].map(c => `
              <option value="${c}" ${doc?.category === c ? 'selected' : ''}>${c}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label>Visibilidade</label>
          <select name="visibility">
            ${["Público", "Cliente", "Interno"].map(v => `
              <option value="${v}" ${doc?.visibility === v ? 'selected' : ''}>${v}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label>Cliente Associado</label>
          <input name="client" value="${esc(doc?.client || 'Todos')}">
        </div>
        <div class="field">
          <label>URL / Ficheiro</label>
          <input name="url" value="${esc(doc?.url || 'documents/brief-site-acquisition.pdf')}">
        </div>
        <div class="field full">
          <div class="form-actions">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn alt" type="button" id="cancelModal">Cancelar</button>
          </div>
        </div>
      </form>
    `;
    modal.classList.add('show');
    document.getElementById('closeModal').onclick = closeModal;
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('docModalForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      api.saveDocument({
        id: doc?.id,
        name: fd.get('name'),
        category: fd.get('category'),
        type: "PDF",
        visibility: fd.get('visibility'),
        client: fd.get('client'),
        url: fd.get('url'),
        status: "Ativo"
      }, role);
      closeModal();
      renderInternalPortal(role, activeView);
    };
  }

  // --- USERS ---
  const btnNewUser = document.getElementById('btnNewUser');
  if (btnNewUser) btnNewUser.onclick = () => showUserModal(null);
  document.querySelectorAll('.btn-edit-user').forEach(b => {
    b.onclick = () => showUserModal(api.getUsers().find(u => u.id === b.dataset.id));
  });
  document.querySelectorAll('.btn-del-user').forEach(b => {
    b.onclick = () => {
      if (confirm(`Remover o utilizador ${b.dataset.id}?`)) {
        api.deleteUser(b.dataset.id, role);
        renderInternalPortal(role, activeView);
      }
    };
  });

  function showUserModal(usr) {
    const isEdit = !!usr;
    modal.querySelector('.modal-card').innerHTML = `
      <div class="modal-head">
        <h3>${isEdit ? 'Editar Utilizador' : 'Novo Utilizador'}</h3>
        <button class="close" id="closeModal">&times;</button>
      </div>
      <form id="userModalForm" class="form-grid">
        <div class="field">
          <label>Nome Completo *</label>
          <input name="name" required value="${esc(usr?.name || '')}">
        </div>
        <div class="field">
          <label>Email Profissional *</label>
          <input name="email" type="email" required value="${esc(usr?.email || '')}">
        </div>
        <div class="field">
          <label>Perfil (Role) *</label>
          <select name="role">
            ${["Master Admin", "Admin", "Manager", "Staff", "Client"].map(r => `
              <option value="${r}" ${usr?.role === r ? 'selected' : ''}>${r}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label>Estado</label>
          <select name="status">
            <option value="Ativo" ${usr?.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
            <option value="Suspenso" ${usr?.status === 'Suspenso' ? 'selected' : ''}>Suspenso</option>
            <option value="Inativo" ${usr?.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
          </select>
        </div>
        <div class="field full">
          <div class="form-actions">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn alt" type="button" id="cancelModal">Cancelar</button>
          </div>
        </div>
      </form>
    `;
    modal.classList.add('show');
    document.getElementById('closeModal').onclick = closeModal;
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('userModalForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      api.saveUser({
        id: usr?.id,
        name: fd.get('name'),
        email: fd.get('email'),
        role: fd.get('role'),
        status: fd.get('status')
      }, role);
      closeModal();
      renderInternalPortal(role, activeView);
    };
  }
}

// -------------------------------------------------------------
// INITIALIZATION ON DOM LOAD
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // If in internal dashboard (dashboard.html)
  if (document.getElementById('dashboardRoot')) {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role') || 'Master Admin';
    const view = params.get('view') || 'overview';
    renderInternalPortal(role, view);
  }

  // If in client portal (client.html)
  if (document.getElementById('clientRoot')) {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || 'overview';
    renderClientPortal(view);
  }
});