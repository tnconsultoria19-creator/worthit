import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// In-memory data store replicating the D1 database
const inMemoryData = {
  clients: [
    { id: "CL-001", name: "Unitel", industry: "Telecomunicações", contact: "Ana Manuel", email: "ana@cliente.co.ao", status: "Ativo", owner: "Admin" },
    { id: "CL-002", name: "Grupo Kwanza", industry: "Retalho", contact: "Carlos Silva", email: "carlos@cliente.co.ao", status: "Ativo", owner: "Gestor" }
  ],
  leads: [
    { id: "LD-001", name: "Operadora Nacional", company: "Rede Telecom", source: "Website", priority: "Alta", status: "Novo", owner: "Admin" },
    { id: "LD-002", name: "Expansão Comercial", company: "Grupo Kwanza", source: "Indicação", priority: "Média", status: "Qualificado", owner: "Gestor" }
  ],
  requests: [
    { id: "SR-001", client: "Unitel", region: "Luanda", municipality: "Talatona", sites: 8, status: "Em análise", assigned: "Admin", created: "06/10/2026" },
    { id: "SR-002", client: "Rede Telecom", region: "Huíla", municipality: "Lubango", sites: 4, status: "Pesquisa", assigned: "Gestor", created: "05/10/2026" }
  ],
  projects: [
    { id: "PR-001", name: "Expansão Luanda", client: "Unitel", province: "Luanda", sites: 8, status: "Em curso", progress: 62, owner: "Admin" },
    { id: "PR-002", name: "Cobertura Huíla", client: "Rede Telecom", province: "Huíla", sites: 4, status: "Em curso", progress: 35, owner: "Gestor" }
  ],
  sites: [
    { id: "ST-001", code: "LDA-TA-001", project: "Expansão Luanda", province: "Luanda", municipality: "Talatona", status: "Due Diligence", owner: "Proprietário Privado" },
    { id: "ST-002", code: "HLA-LB-004", project: "Cobertura Huíla", province: "Huíla", municipality: "Lubango", status: "Negociação", owner: "Proprietário Privado" }
  ],
  tasks: [
    { id: "TK-001", title: "Validar documentos do site LDA-TA-001", due: "07/10/2026", assignee: "Admin", priority: "Alta", status: "Pendente" },
    { id: "TK-002", title: "Contactar proprietário - HLA-LB-004", due: "08/10/2026", assignee: "Gestor", priority: "Média", status: "Em curso" }
  ],
  documents: [
    { id: "DOC-001", name: "Perfil da Empresa", category: "Institucional", type: "PDF", url: "documents/perfil-empresa.pdf", visibility: "Público", status: "Ativo" },
    { id: "DOC-002", name: "Brief de Aquisição de Sites", category: "Serviços", type: "PDF", url: "documents/brief-site-acquisition.pdf", visibility: "Público", status: "Ativo" }
  ],
  packages: [
    { id: "PK-001", name: "Standard", description: "Identificação e avaliação inicial", price: "Sob consulta", status: "Ativo" },
    { id: "PK-002", name: "Professional", description: "Aquisição completa e suporte regulatório", price: "Sob consulta", status: "Ativo" },
    { id: "PK-003", name: "Enterprise", description: "Operação nacional e gestão dedicada", price: "Personalizado", status: "Ativo" }
  ],
  users: [
    { id: "USR-001", name: "Master Admin", email: "admin@empresa.co.ao", role: "Master Admin", status: "Ativo", lastLogin: "Agora" },
    { id: "USR-002", name: "Gestor de Projectos", email: "gestor@empresa.co.ao", role: "Manager", status: "Ativo", lastLogin: "Hoje" },
    { id: "USR-003", name: "Consultor de Sites", email: "consultor@empresa.co.ao", role: "Staff", status: "Ativo", lastLogin: "Hoje" }
  ],
  audit: [
    { id: "AU-001", action: "Sistema iniciado", user: "Master Admin", date: "06/10/2026 13:30", module: "Sistema" },
    { id: "AU-002", action: "Pedido SR-001 criado", user: "Master Admin", date: "06/10/2026 13:33", module: "Pedidos" }
  ]
};

// API endpoints (matching worker/index.js)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, role: 'Master Admin', email: 'admin@empresa.co.ao' });
});

app.get('/api/me', (req, res) => {
  res.json({ email: 'admin@empresa.co.ao', role: 'Master Admin' });
});

app.get('/api/bootstrap', (req, res) => {
  res.json({ role: 'Master Admin', data: inMemoryData });
});

app.post('/api/sync', (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  inMemoryData.audit.unshift({
    id: 'AU-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
    action: 'State sync via dashboard',
    user: 'admin@empresa.co.ao',
    date: new Date().toLocaleString('pt-PT'),
    module: 'System'
  });
  res.json({ ok: true });
});

app.post('/api/site-requests', (req, res) => {
  const item = req.body || {};
  const id = item.id || ('SR-' + Math.random().toString(36).slice(2, 7).toUpperCase());
  const newRequest = {
    id,
    client: item.client || 'Novo cliente',
    region: item.region || '',
    municipality: item.municipality || '',
    sites: Number(item.sites) || 1,
    status: item.status || 'Novo',
    assigned: item.assigned || 'Não atribuído',
    created: item.created || new Date().toLocaleDateString('pt-PT')
  };
  inMemoryData.requests.unshift(newRequest);
  inMemoryData.audit.unshift({
    id: 'AU-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
    action: `Pedido ${id} criado`,
    user: 'Website',
    date: new Date().toLocaleString('pt-PT'),
    module: 'Pedidos'
  });
  res.json({ ok: true, id });
});

// Serve static frontend assets
app.use(express.static(__dirname));

// Fallback to index.html for root or unknown route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
