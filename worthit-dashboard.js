import { api } from './services/api.js';

const root = document.getElementById('dashboardRoot');
const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
const SERVICES = [
  { id: 'sites', title: 'Aquisição de Sites & Inteligência de Localização', short: 'Aquisição de Sites' },
  { id: 'procurement', title: 'Procurement & Sourcing', short: 'Procurement & Sourcing' },
  { id: 'expansion', title: 'Expansão de Negócios & Facilitação de Projectos', short: 'Expansão & Facilitação' }
];
const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDays = (date, days) => { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
const esc = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const numberText = value => Number(value || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const defaultCompany = () => ({ name: 'WorthIt', tagline: 'Sourcing, Procurement & Facilitação em Angola', location: 'Angola · Cobertura nacional', email: '', phone: '', address: '', taxId: '' });
function loadCompany() {
  if (demoMode) return defaultCompany();
  try { return { ...defaultCompany(), ...JSON.parse(localStorage.getItem('worthit_invoice_company_v1') || '{}') }; }
  catch { return defaultCompany(); }
}
function makeDocumentNumber(type) {
  const prefix = type === 'quote' ? 'ORC' : 'FAT';
  return prefix + '-' + todayISO().replace(/-/g, '') + '-' + String(Date.now()).slice(-4);
}
const initialDate = todayISO();
const state = {
  selectedClientId: '',
  documentType: 'invoice',
  serviceId: 'sites',
  amount: '',
  currency: 'AOA',
  issueDate: initialDate,
  dueDate: plusDays(initialDate, 14),
  description: SERVICES[0].title,
  notes: 'Validade e condições conforme proposta acordada.',
  documentNumber: makeDocumentNumber('invoice'),
  company: loadCompany()
};

function getClients() {
  return api.getClients().slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt'));
}
function selectedClient() {
  const clients = getClients();
  if (!clients.some(c => c.id === state.selectedClientId)) state.selectedClientId = clients[0]?.id || '';
  return clients.find(c => c.id === state.selectedClientId) || null;
}
function persistCompany() {
  if (!demoMode) {
    try { localStorage.setItem('worthit_invoice_company_v1', JSON.stringify(state.company)); } catch {}
  }
}
function serviceById(id) { return SERVICES.find(s => s.id === id) || SERVICES[0]; }

function render() {
  if (!root) return;
  const clients = getClients();
  const client = selectedClient();
  const service = serviceById(state.serviceId);
  const selectedName = client ? client.name : 'Seleccione um cliente';
  root.innerHTML =
    '<div class="worthit-simple-dashboard">' +
      '<header class="worthit-simple-topbar">' +
        '<a class="worthit-simple-brand" href="index.html" aria-label="WorthIt início"><span class="worthit-logo-mark">W</span><span><strong>WorthIt</strong><small>ADMINISTRAÇÃO</small></span></a>' +
        '<div class="worthit-simple-top-actions"><a href="index.html">Website público <span aria-hidden="true">↗</span></a><button id="btnSimpleLogout" type="button">Terminar sessão</button></div>' +
      '</header>' +
      (demoMode ? '<div class="worthit-simple-demo"><strong>MODO DE DEMONSTRAÇÃO</strong><span>Dados de exemplo. As alterações não são guardadas na base de dados e desaparecem ao recarregar.</span></div>' : '') +
      '<main class="worthit-simple-main">' +
        '<div class="worthit-simple-heading"><div><span class="worthit-simple-eyebrow">GESTÃO ESSENCIAL</span><h1>Clientes e honorários</h1><p>Consulte os contactos e prepare uma proposta de honorários ou uma fatura em PDF.</p></div><span class="worthit-simple-count">' + clients.length + ' cliente(s)</span></div>' +
        '<div class="worthit-simple-columns">' +
          '<section class="worthit-simple-panel worthit-clients-panel">' +
            '<div class="worthit-simple-panel-head"><div><h2>Clientes</h2><p>Informação básica de contacto</p></div><button class="worthit-button worthit-button-dark" id="btnSimpleNewClient" type="button">+ Novo cliente</button></div>' +
            '<label class="worthit-search"><span aria-hidden="true">⌕</span><input id="simpleClientSearch" type="search" placeholder="Pesquisar nome, email ou telefone" aria-label="Pesquisar clientes"></label>' +
            '<div class="worthit-client-list" id="simpleClientList">' +
              (clients.length ? clients.map(c =>
                '<button class="worthit-client-row ' + (c.id === state.selectedClientId ? 'is-selected' : '') + '" type="button" data-client-id="' + esc(c.id) + '">' +
                  '<span class="worthit-client-avatar">' + esc((c.name || '?').trim().slice(0,1).toUpperCase()) + '</span>' +
                  '<span class="worthit-client-row-copy"><strong>' + esc(c.name || 'Cliente sem nome') + '</strong><span>' + esc(c.contact || c.industry || 'Contacto não indicado') + '</span><small>' + esc(c.email || c.phone || 'Sem contacto registado') + '</small></span>' +
                  '<span class="worthit-client-chevron" aria-hidden="true">›</span>' +
                '</button>'
              ).join('') : '<div class="worthit-empty-clients">Ainda não existem clientes. Adicione o primeiro cliente.</div>') +
            '</div>' +
            '<div class="worthit-client-detail" id="simpleClientDetail">' +
              (client ?
                '<div class="worthit-detail-top"><div><span class="worthit-simple-eyebrow">CLIENTE SELECCIONADO</span><h3>' + esc(client.name || '') + '</h3></div><button class="worthit-button worthit-button-light" id="btnSimpleEditClient" type="button">Editar dados</button></div>' +
                '<dl class="worthit-contact-list">' +
                  '<div><dt>Contacto</dt><dd>' + esc(client.contact || '—') + '</dd></div>' +
                  '<div><dt>Email</dt><dd>' + esc(client.email || '—') + '</dd></div>' +
                  '<div><dt>Telefone</dt><dd>' + esc(client.phone || '—') + '</dd></div>' +
                  (client.nif ? '<div><dt>NIF</dt><dd>' + esc(client.nif) + '</dd></div>' : '') +
                '</dl>'
                : '<div class="worthit-empty-clients">Seleccione um cliente ou adicione um novo.</div>') +
            '</div>' +
          '</section>' +
          '<section class="worthit-simple-panel worthit-invoice-panel">' +
            '<div class="worthit-simple-panel-head"><div><h2>Gerar documento</h2><p>Escolha o serviço, defina o valor e descarregue o PDF.</p></div></div>' +
            '<div class="worthit-doc-type" role="group" aria-label="Tipo de documento">' +
              '<button type="button" data-doc-type="quote" class="' + (state.documentType === 'quote' ? 'is-active' : '') + '">Proposta de honorários</button>' +
              '<button type="button" data-doc-type="invoice" class="' + (state.documentType === 'invoice' ? 'is-active' : '') + '">Fatura / Invoice</button>' +
            '</div>' +
            '<div class="worthit-invoice-form">' +
              '<div class="worthit-invoice-field full"><label>Cliente</label><div class="worthit-selected-client">' + esc(selectedName) + '</div><small>Escolha o cliente na lista à esquerda.</small></div>' +
              '<fieldset class="worthit-service-picker full"><legend>Serviço seleccionado</legend>' +
                SERVICES.map(s => '<button type="button" class="worthit-service-option ' + (state.serviceId === s.id ? 'is-active' : '') + '" data-service-id="' + s.id + '"><span class="worthit-service-radio" aria-hidden="true"></span><span>' + esc(s.short) + '</span><span class="worthit-service-check" aria-hidden="true">✓</span></button>').join('') +
              '</fieldset>' +
              '<div class="worthit-invoice-field full"><label for="simpleDescription">Descrição no documento</label><input id="simpleDescription" value="' + esc(state.description) + '" maxlength="180"></div>' +
              '<div class="worthit-invoice-field"><label for="simpleAmount">Honorários / valor *</label><div class="worthit-amount-input"><input id="simpleAmount" type="number" min="0.01" step="0.01" placeholder="0,00" value="' + esc(state.amount) + '" required><select id="simpleCurrency" aria-label="Moeda"><option value="AOA" ' + (state.currency === 'AOA' ? 'selected' : '') + '>AOA</option><option value="USD" ' + (state.currency === 'USD' ? 'selected' : '') + '>USD</option><option value="EUR" ' + (state.currency === 'EUR' ? 'selected' : '') + '>EUR</option><option value="ZAR" ' + (state.currency === 'ZAR' ? 'selected' : '') + '>ZAR</option></select></div></div>' +
              '<div class="worthit-invoice-field"><label for="simpleDocNumber">Número do documento</label><input id="simpleDocNumber" value="' + esc(state.documentNumber) + '" maxlength="40"></div>' +
              '<div class="worthit-invoice-field"><label for="simpleIssueDate">Data de emissão</label><input id="simpleIssueDate" type="date" value="' + esc(state.issueDate) + '"></div>' +
              '<div class="worthit-invoice-field"><label for="simpleDueDate">Data de vencimento</label><input id="simpleDueDate" type="date" value="' + esc(state.dueDate) + '"></div>' +
              '<div class="worthit-invoice-field full"><label for="simpleNotes">Notas / condições (opcional)</label><textarea id="simpleNotes" rows="2">' + esc(state.notes) + '</textarea></div>' +
            '</div>' +
            '<div class="worthit-invoice-total"><span>Total do documento</span><strong id="simpleLiveTotal">' + numberText(state.amount) + ' ' + esc(state.currency) + '</strong></div>' +
            '<button class="worthit-button worthit-button-dark worthit-download-button" id="btnDownloadWorthItPdf" type="button"><span aria-hidden="true">↓</span> Descarregar PDF</button>' +
            '<p class="worthit-pdf-hint">O PDF inclui a marca WorthIt, os dados do cliente, o serviço, os honorários e os dados da empresa configurados abaixo.</p>' +
            '<details class="worthit-company-details" open><summary>Dados da empresa no PDF</summary>' +
              '<div class="worthit-company-grid">' +
                '<div class="worthit-invoice-field"><label for="companyName">Nome da empresa</label><input id="companyName" value="' + esc(state.company.name) + '" maxlength="120"></div>' +
                '<div class="worthit-invoice-field"><label for="companyTaxId">NIF / Registo (opcional)</label><input id="companyTaxId" value="' + esc(state.company.taxId) + '" maxlength="80"></div>' +
                '<div class="worthit-invoice-field"><label for="companyEmail">Email</label><input id="companyEmail" type="email" value="' + esc(state.company.email) + '" maxlength="180" placeholder="Email da empresa"></div>' +
                '<div class="worthit-invoice-field"><label for="companyPhone">Telefone / WhatsApp</label><input id="companyPhone" value="' + esc(state.company.phone) + '" maxlength="80" placeholder="Contacto da empresa"></div>' +
                '<div class="worthit-invoice-field full"><label for="companyAddress">Endereço</label><input id="companyAddress" value="' + esc(state.company.address) + '" maxlength="200" placeholder="Endereço comercial (opcional)"></div>' +
              '</div>' +
              '<p class="worthit-company-note">Os dados preenchidos aqui aparecem nos próximos PDFs neste navegador.</p>' +
            '</details>' +
          '</section>' +
        '</div>' +
        '<div class="worthit-simple-footer"><span>WorthIt · Sourcing, Procurement & Facilitação em Angola</span><a href="index.html">Voltar ao website</a></div>' +
      '</main>' +
      '<dialog class="worthit-client-dialog" id="simpleClientDialog"><form id="simpleClientForm"><div class="worthit-dialog-head"><div><span class="worthit-simple-eyebrow">CONTACTOS</span><h2 id="simpleClientDialogTitle">Novo cliente</h2></div><button type="button" class="worthit-dialog-x" id="btnCloseClientDialog" aria-label="Fechar">×</button></div><input type="hidden" name="id"><div class="worthit-client-form-grid">' +
        '<div class="worthit-invoice-field full"><label for="formClientName">Nome da empresa / cliente *</label><input id="formClientName" name="name" required maxlength="160"></div>' +
        '<div class="worthit-invoice-field"><label for="formClientContact">Pessoa de contacto</label><input id="formClientContact" name="contact" maxlength="160"></div>' +
        '<div class="worthit-invoice-field"><label for="formClientIndustry">Sector (opcional)</label><input id="formClientIndustry" name="industry" maxlength="160"></div>' +
        '<div class="worthit-invoice-field"><label for="formClientEmail">Email</label><input id="formClientEmail" name="email" type="email" maxlength="180"></div>' +
        '<div class="worthit-invoice-field"><label for="formClientPhone">Telefone</label><input id="formClientPhone" name="phone" maxlength="80"></div>' +
        '<div class="worthit-invoice-field full"><label for="formClientNif">NIF (opcional)</label><input id="formClientNif" name="nif" maxlength="80"></div>' +
      '</div><div class="worthit-client-dialog-actions"><button type="button" class="worthit-button worthit-button-light" id="btnCancelClientDialog">Cancelar</button><button type="submit" class="worthit-button worthit-button-dark">Guardar cliente</button></div></form></dialog>' +
    '</div>';

  wireDashboardEvents();
}

function syncDocumentFields() {
  const amount = document.getElementById('simpleAmount');
  const currency = document.getElementById('simpleCurrency');
  const number = document.getElementById('simpleDocNumber');
  const issue = document.getElementById('simpleIssueDate');
  const due = document.getElementById('simpleDueDate');
  const description = document.getElementById('simpleDescription');
  const notes = document.getElementById('simpleNotes');
  if (amount) state.amount = amount.value;
  if (currency) state.currency = currency.value;
  if (number) state.documentNumber = number.value.trim();
  if (issue) state.issueDate = issue.value;
  if (due) state.dueDate = due.value;
  if (description) state.description = description.value;
  if (notes) state.notes = notes.value;
  const total = document.getElementById('simpleLiveTotal');
  if (total) total.textContent = numberText(state.amount) + ' ' + state.currency;
}
function syncCompanyFields() {
  const pairs = { companyName: 'name', companyTaxId: 'taxId', companyEmail: 'email', companyPhone: 'phone', companyAddress: 'address' };
  Object.entries(pairs).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) state.company[key] = el.value.trim();
  });
  persistCompany();
}

function wireDashboardEvents() {
  document.querySelectorAll('[data-client-id]').forEach(button => {
    button.addEventListener('click', () => { state.selectedClientId = button.dataset.clientId; render(); });
  });
  const search = document.getElementById('simpleClientSearch');
  if (search) search.addEventListener('input', () => {
    const query = search.value.toLowerCase().trim();
    document.querySelectorAll('.worthit-client-row').forEach(row => {
      row.hidden = !row.textContent.toLowerCase().includes(query);
    });
  });
  document.querySelectorAll('[data-doc-type]').forEach(button => {
    button.addEventListener('click', () => {
      syncDocumentFields();
      state.documentType = button.dataset.docType;
      state.documentNumber = makeDocumentNumber(state.documentType);
      render();
    });
  });
  document.querySelectorAll('[data-service-id]').forEach(button => {
    button.addEventListener('click', () => {
      syncDocumentFields();
      const previous = serviceById(state.serviceId).title;
      state.serviceId = button.dataset.serviceId;
      if (!state.description || state.description === previous) state.description = serviceById(state.serviceId).title;
      render();
    });
  });
  ['simpleAmount','simpleCurrency','simpleDocNumber','simpleIssueDate','simpleDueDate','simpleDescription','simpleNotes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', syncDocumentFields);
    if (el) el.addEventListener('change', syncDocumentFields);
  });
  ['companyName','companyTaxId','companyEmail','companyPhone','companyAddress'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', syncCompanyFields);
      el.addEventListener('change', syncCompanyFields);
    }
  });

  const dialog = document.getElementById('simpleClientDialog');
  const form = document.getElementById('simpleClientForm');
  const newButton = document.getElementById('btnSimpleNewClient');
  const editButton = document.getElementById('btnSimpleEditClient');
  function openClientForm(client) {
    if (!dialog || !form) return;
    form.reset();
    const values = client || {};
    Object.keys(values).forEach(key => { if (form.elements[key]) form.elements[key].value = values[key] || ''; });
    document.getElementById('simpleClientDialogTitle').textContent = client ? 'Editar cliente' : 'Novo cliente';
    dialog.showModal();
    setTimeout(() => document.getElementById('formClientName')?.focus(), 50);
  }
  if (newButton) newButton.addEventListener('click', () => openClientForm(null));
  if (editButton) editButton.addEventListener('click', () => openClientForm(selectedClient()));
  ['btnCloseClientDialog','btnCancelClientDialog'].forEach(id => {
    const button = document.getElementById(id);
    if (button) button.addEventListener('click', () => dialog.close());
  });
  if (dialog) dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const fd = new FormData(form);
    const client = {
      id: String(fd.get('id') || ''),
      name: String(fd.get('name') || '').trim(),
      contact: String(fd.get('contact') || '').trim(),
      industry: String(fd.get('industry') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      nif: String(fd.get('nif') || '').trim(),
      status: 'Ativo',
      owner: 'Admin'
    };
    if (!client.name) return;
    api.saveClient(client, 'Admin');
    state.selectedClientId = client.id || getClients()[0]?.id || '';
    dialog.close();
    render();
  });

  const download = document.getElementById('btnDownloadWorthItPdf');
  if (download) download.addEventListener('click', downloadPdf);
  const logout = document.getElementById('btnSimpleLogout');
  if (logout) logout.addEventListener('click', async () => {
    if (demoMode) { window.location.href = '/admin.html'; return; }
    try { await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' }); }
    finally { window.location.href = '/admin.html'; }
  });
}

function drawPdfLogo(doc, companyName) {
  doc.setFillColor(30,30,30);
  doc.roundedRect(14, 13, 17, 17, 2, 2, 'F');
  doc.setFont('helvetica','bold');
  doc.setFontSize(14);
  doc.setTextColor(255,255,255);
  doc.text('W', 22.5, 24.3, { align: 'center' });
  doc.setTextColor(25,25,25);
  doc.setFontSize(19);
  doc.text(companyName || 'WorthIt', 36, 20);
}

function downloadPdf() {
  syncDocumentFields();
  syncCompanyFields();
  const client = selectedClient();
  if (!client) { alert('Adicione ou seleccione um cliente antes de gerar o documento.'); return; }
  if (!state.amount || Number(state.amount) <= 0) { alert('Indique o valor dos honorários antes de gerar o PDF.'); document.getElementById('simpleAmount')?.focus(); return; }
  if (!state.documentNumber) state.documentNumber = makeDocumentNumber(state.documentType);
  const jsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDF) { alert('O gerador de PDF não ficou disponível. Verifique a ligação à internet e tente novamente.'); return; }
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const title = state.documentType === 'quote' ? 'PROPOSTA DE HONORÁRIOS' : 'FATURA / INVOICE';
  const service = serviceById(state.serviceId);
  const amount = Number(state.amount);
  const company = state.company;
  const formatDate = value => {
    if (!value) return '—';
    const bits = value.split('-');
    return bits.length === 3 ? bits[2] + '/' + bits[1] + '/' + bits[0] : value;
  };
  drawPdfLogo(doc, company.name);
  doc.setFont('helvetica','normal');
  doc.setFontSize(8);
  doc.setTextColor(95,95,95);
  doc.text(company.tagline, 36, 25);
  let companyY = 36;
  [company.location, company.address, company.email, company.phone, company.taxId ? 'NIF: ' + company.taxId : ''].filter(Boolean).forEach(line => {
    doc.text(String(line), 14, companyY, { maxWidth: 105 });
    companyY += 4.5;
  });
  doc.setFont('helvetica','bold');
  doc.setTextColor(30,30,30);
  doc.setFontSize(15);
  doc.text(title, pageWidth - 14, 20, { align: 'right' });
  doc.setFont('helvetica','normal');
  doc.setFontSize(9);
  doc.setTextColor(80,80,80);
  doc.text('N.º ' + state.documentNumber, pageWidth - 14, 27, { align: 'right' });
  doc.text('Emissão: ' + formatDate(state.issueDate), pageWidth - 14, 33, { align: 'right' });
  doc.text('Vencimento: ' + formatDate(state.dueDate), pageWidth - 14, 38, { align: 'right' });
  doc.setDrawColor(224,220,212);
  doc.line(14, 65, 196, 65);
  doc.setFont('helvetica','bold');
  doc.setTextColor(135,111,75);
  doc.setFontSize(9);
  doc.text('FACTURAR A / CLIENTE', 14, 75);
  doc.setFont('helvetica','bold');
  doc.setTextColor(30,30,30);
  doc.setFontSize(13);
  doc.text(String(client.name || 'Cliente'), 14, 83, { maxWidth: 115 });
  doc.setFont('helvetica','normal');
  doc.setFontSize(9);
  doc.setTextColor(75,75,75);
  let clientY = 90;
  [client.contact ? 'A/C: ' + client.contact : '', client.email, client.phone, client.nif ? 'NIF: ' + client.nif : ''].filter(Boolean).forEach(line => {
    doc.text(String(line), 14, clientY, { maxWidth: 140 });
    clientY += 5;
  });
  const tableY = Math.max(119, clientY + 10);
  doc.setFillColor(30,30,30);
  doc.rect(14, tableY, 182, 11, 'F');
  doc.setFont('helvetica','bold');
  doc.setFontSize(9);
  doc.setTextColor(255,255,255);
  doc.text('DESCRIÇÃO DO SERVIÇO', 19, tableY + 7);
  doc.text('QTD.', 151, tableY + 7, { align: 'center' });
  doc.text('VALOR (' + state.currency + ')', 192, tableY + 7, { align: 'right' });
  doc.setTextColor(35,35,35);
  doc.setFont('helvetica','normal');
  doc.setFontSize(10);
  const description = state.description || service.title;
  const lines = doc.splitTextToSize(description, 120);
  doc.text(lines, 19, tableY + 22);
  doc.text('1', 151, tableY + 22, { align: 'center' });
  doc.text(numberText(amount), 192, tableY + 22, { align: 'right' });
  const totalY = tableY + Math.max(34, lines.length * 5 + 18);
  doc.setDrawColor(224,220,212);
  doc.line(114, totalY - 2, 196, totalY - 2);
  doc.setFont('helvetica','normal');
  doc.setFontSize(10);
  doc.text('TOTAL', 141, totalY + 6);
  doc.setFont('helvetica','bold');
  doc.setFontSize(16);
  doc.text(numberText(amount) + ' ' + state.currency, 192, totalY + 7, { align: 'right' });
  let notesY = totalY + 27;
  if (state.notes) {
    doc.setFont('helvetica','bold');
    doc.setFontSize(9);
    doc.setTextColor(65,65,65);
    doc.text('NOTAS E CONDIÇÕES', 14, notesY);
    doc.setFont('helvetica','normal');
    doc.setFontSize(9);
    doc.setTextColor(90,90,90);
    doc.text(doc.splitTextToSize(state.notes, 178), 14, notesY + 7);
    notesY += 22;
  }
  doc.setDrawColor(224,220,212);
  doc.line(14, 276, 196, 276);
  doc.setFont('helvetica','normal');
  doc.setFontSize(8);
  doc.setTextColor(110,110,110);
  doc.text('WorthIt · Sourcing, Procurement & Facilitação em Angola', 14, 283);
  doc.text('Documento gerado digitalmente.', 196, 283, { align: 'right' });
  const filename = (state.documentType === 'quote' ? 'Proposta' : 'Fatura') + '-' + state.documentNumber.replace(/[^a-zA-Z0-9_-]/g,'-') + '.pdf';
  doc.save(filename);
}

async function boot() {
  if (!root) return;
  if (demoMode) { render(); return; }
  if (window.location.hostname.endsWith('github.io')) {
    window.location.replace('https://worthit.tnconsultoria19.workers.dev/admin.html');
    return;
  }
  try {
    const response = await fetch('/api/admin/session', { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('Admin session required');
    const session = await response.json();
    if (!session || !session.authenticated) throw new Error('Admin session required');
    render();
  } catch {
    window.location.replace('/admin.html');
  }
}
document.addEventListener('DOMContentLoaded', boot);
