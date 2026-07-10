/* =========================================================
   Freelance Marketplace — script.js
   Handles: Fetch API calls to Django backend, session (mock
   login via localStorage), and DOM rendering for every page.
   ========================================================= */

const API_BASE = "http://127.0.0.1:8000";

/* ---------------- Generic API helper ---------------- */
async function api(path, options = {}) {
  try {
    const res = await fetch(API_BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  } catch (err) {
    toast(err.message || "Could not reach the server. Is Django running?", "error");
    throw err;
  }
}

const apiGet = (path) => api(path);
const apiPost = (path, body) => api(path, { method: "POST", body: JSON.stringify(body) });
const apiPut = (path, body) => api(path, { method: "PUT", body: JSON.stringify(body) });
const apiDelete = (path) => api(path, { method: "DELETE" });

/* ---------------- Toast ---------------- */
function toast(message, type = "success") {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast show ${type}`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ---------------- Session (mock login) ---------------- */
const Session = {
  get() {
    try { return JSON.parse(localStorage.getItem("fm_session")); } catch { return null; }
  },
  set(session) { localStorage.setItem("fm_session", JSON.stringify(session)); },
  clear() { localStorage.removeItem("fm_session"); },
};

function logout() {
  Session.clear();
  window.location.href = "index.html";
}

function guardDashboard() {
  if (!Session.get()) window.location.href = "login.html";
}

/* ---------------- Small utils ---------------- */
function fmtMoney(n) {
  const num = Number(n) || 0;
  return "₹" + num.toLocaleString("en-IN");
}
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

/* =========================================================
   NAVBAR (renders login state in every page's #nav-actions)
   ========================================================= */
function renderNavActions() {
  const el = document.getElementById("nav-actions");
  if (!el) return;
  const session = Session.get();
  if (session) {
    el.innerHTML = `
      <span class="chip chip-gold mono" style="color:#fff;background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.25)">${escapeHtml(session.role)}</span>
      <a class="btn btn-ghost btn-small" href="dashboard.html">Dashboard</a>
      <button class="btn btn-outline btn-small" style="border-color:rgba(255,255,255,0.35);color:#fff" onclick="logout()">Logout</button>
    `;
  } else {
    el.innerHTML = `
      <a class="btn btn-ghost btn-small" href="login.html">Login</a>
      <a class="btn btn-primary btn-small" href="register.html">Register</a>
    `;
  }
}

/* =========================================================
   HOME PAGE
   ========================================================= */
async function initHomePage() {
  const freelancerBox = document.getElementById("featured-freelancers");
  const projectBox = document.getElementById("featured-projects");
  if (!freelancerBox && !projectBox) return;

  try {
    if (freelancerBox) {
      const { data } = await apiGet("/freelancers/");
      freelancerBox.innerHTML = data.length
        ? data.slice(0, 3).map(f => `
          <div class="ticket">
            <span class="ticket-id">FRL-${String(f.freelancer_id).padStart(3, "0")}</span>
            <h3>${escapeHtml(f.full_name)}</h3>
            <p class="desc">${escapeHtml(f.skills)}</p>
            <div class="ticket-meta">
              <span class="chip">${f.experience} yrs experience</span>
              <span class="chip chip-gold">${fmtMoney(f.hourly_rate)}/hr</span>
            </div>
          </div>`).join("")
        : `<div class="empty-state">No freelancers yet — be the first to register.</div>`;
    }
    if (projectBox) {
      const { data } = await apiGet("/projects/");
      projectBox.innerHTML = data.length
        ? data.slice(0, 3).map(p => `
          <div class="ticket">
            <span class="ticket-id">PRJ-${String(p.project_id).padStart(3, "0")}</span>
            <h3>${escapeHtml(p.project_title)}</h3>
            <p class="desc">${escapeHtml(p.description).slice(0, 90)}${p.description.length > 90 ? "…" : ""}</p>
            <div class="ticket-meta">
              <span class="chip">${escapeHtml(p.category)}</span>
              <span class="chip ${p.status === 'Open' ? 'chip-green' : p.status === 'Completed' ? 'chip-red' : 'chip-gold'}">${escapeHtml(p.status)}</span>
            </div>
            <div class="ticket-foot">
              <span class="ticket-price">${fmtMoney(p.budget)}</span>
              <span class="muted mono" style="font-size:0.75rem">due ${p.deadline}</span>
            </div>
          </div>`).join("")
        : `<div class="empty-state">No projects posted yet.</div>`;
    }
    const stats = await apiGet("/dashboard/stats/");
    const s = stats.data;
    const statEls = {
      "stat-freelancers": s.total_freelancers,
      "stat-projects": s.total_projects,
      "stat-contracts": s.total_contracts,
    };
    Object.entries(statEls).forEach(([id, val]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = val;
    });
  } catch (e) { /* toast already shown */ }
}

/* =========================================================
   REGISTER PAGE
   ========================================================= */
function initRegisterPage() {
  const freelancerForm = document.getElementById("freelancer-register-form");
  const clientForm = document.getElementById("client-register-form");
  if (!freelancerForm && !clientForm) return;

  qsa(".reg-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      qsa(".reg-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      qsa(".tab-panel").forEach(p => p.classList.remove("active"));
      document.getElementById(btn.dataset.target).classList.add("active");
    });
  });

  if (freelancerForm) {
    freelancerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(freelancerForm);
      const payload = Object.fromEntries(fd.entries());
      payload.experience = Number(payload.experience || 0);
      payload.hourly_rate = Number(payload.hourly_rate || 0);
      try {
        const res = await apiPost("/freelancers/add/", payload);
        Session.set({ role: "Freelancer", id: res.data.freelancer_id, name: res.data.full_name, email: res.data.email });
        toast("Freelancer profile created!");
        setTimeout(() => window.location.href = "dashboard.html", 700);
      } catch {}
    });
  }

  if (clientForm) {
    clientForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(clientForm);
      const payload = Object.fromEntries(fd.entries());
      try {
        const res = await apiPost("/clients/add/", payload);
        Session.set({ role: "Client", id: res.data.client_id, name: res.data.company_name, email: res.data.email });
        toast("Client account created!");
        setTimeout(() => window.location.href = "dashboard.html", 700);
      } catch {}
    });
  }
}

/* =========================================================
   LOGIN PAGE (mock login — matches email against records)
   ========================================================= */
function initLoginPage() {
  const form = document.getElementById("login-form");
  if (!form) return;

  qsa(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      qsa(".role-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      form.dataset.role = btn.dataset.role;
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = qs("#login-email").value.trim();
    const role = form.dataset.role || "Freelancer";
    try {
      if (role === "Freelancer") {
        const { data } = await apiGet("/freelancers/");
        const match = data.find(f => f.email.toLowerCase() === email.toLowerCase());
        if (!match) return toast("No freelancer found with that email. Register first.", "error");
        Session.set({ role: "Freelancer", id: match.freelancer_id, name: match.full_name, email: match.email });
      } else {
        const { data } = await apiGet("/clients/");
        const match = data.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (!match) return toast("No client found with that email. Register first.", "error");
        Session.set({ role: "Client", id: match.client_id, name: match.company_name, email: match.email });
      }
      toast("Welcome back!");
      setTimeout(() => window.location.href = "dashboard.html", 500);
    } catch {}
  });
}

/* =========================================================
   PROJECTS PAGE
   ========================================================= */
function initProjectsPage() {
  const list = document.getElementById("projects-list");
  if (!list) return;

  async function loadProjects() {
    const search = qs("#search-input")?.value || "";
    const category = qs("#category-filter")?.value || "";
    const status = qs("#status-filter")?.value || "";
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    const { data } = await apiGet("/projects/?" + params.toString());
    list.innerHTML = data.length ? data.map(projectCard).join("") : `<div class="empty-state">No projects match your filters.</div>`;
  }

  function projectCard(p) {
    return `
      <div class="ticket">
        <span class="ticket-id">PRJ-${String(p.project_id).padStart(3, "0")}</span>
        <h3>${escapeHtml(p.project_title)}</h3>
        <p class="desc">${escapeHtml(p.description)}</p>
        <div class="ticket-meta">
          <span class="chip">${escapeHtml(p.category)}</span>
          <span class="chip ${p.status === 'Open' ? 'chip-green' : p.status === 'Completed' ? 'chip-red' : 'chip-gold'}">${escapeHtml(p.status)}</span>
          <span class="chip mono">by ${escapeHtml(p.client_name)}</span>
        </div>
        <div class="ticket-foot">
          <span class="ticket-price">${fmtMoney(p.budget)}</span>
          <a class="btn btn-primary btn-small" href="bids.html?project=${encodeURIComponent(p.project_title)}">Submit Bid</a>
        </div>
        <div class="mt-8 flex gap-8">
          <span class="muted mono" style="font-size:0.75rem">Deadline: ${p.deadline}</span>
        </div>
      </div>`;
  }

  const postForm = document.getElementById("post-project-form");
  if (postForm) {
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const session = Session.get();
      if (!session || session.role !== "Client") {
        return toast("Log in as a client to post a project.", "error");
      }
      const fd = new FormData(postForm);
      const payload = Object.fromEntries(fd.entries());
      payload.budget = Number(payload.budget || 0);
      payload.client_name = session.name;
      try {
        await apiPost("/projects/add/", payload);
        toast("Project posted!");
        postForm.reset();
        loadProjects();
      } catch {}
    });
  }

  qs("#search-input")?.addEventListener("input", debounce(loadProjects, 350));
  qs("#category-filter")?.addEventListener("change", loadProjects);
  qs("#status-filter")?.addEventListener("change", loadProjects);

  loadProjects();
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* =========================================================
   BIDS PAGE
   ========================================================= */
function initBidsPage() {
  const list = document.getElementById("bids-list");
  if (!list) return;

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedProject = urlParams.get("project");
  if (preselectedProject) {
    const input = qs("#bid-project-title");
    if (input) input.value = preselectedProject;
  }

  async function loadBids() {
    const { data } = await apiGet("/bids/");
    list.innerHTML = data.length ? data.map(bidRow).join("") : `<div class="empty-state">No bids submitted yet.</div>`;
    qsa(".bid-accept").forEach(btn => btn.addEventListener("click", () => decideBid(btn.dataset.id, "Accepted", btn.dataset.bid)));
    qsa(".bid-reject").forEach(btn => btn.addEventListener("click", () => decideBid(btn.dataset.id, "Rejected")));
  }

  function statusChip(status) {
    const cls = status === "Accepted" ? "chip-green" : status === "Rejected" ? "chip-red" : "chip-gold";
    return `<span class="chip ${cls}">${escapeHtml(status)}</span>`;
  }

  function bidRow(b) {
    const session = Session.get();
    const isClientOwner = session && session.role === "Client";
    return `
      <div class="ticket">
        <span class="ticket-id">BID-${String(b.bid_id).padStart(3, "0")}</span>
        <h3>${escapeHtml(b.project_title)}</h3>
        <p class="desc">${escapeHtml(b.proposal)}</p>
        <div class="ticket-meta">
          <span class="chip mono">from ${escapeHtml(b.freelancer_name)}</span>
          ${statusChip(b.status)}
        </div>
        <div class="ticket-foot">
          <span class="ticket-price">${fmtMoney(b.bid_amount)}</span>
          ${isClientOwner && b.status === "Pending" ? `
            <div class="flex gap-8">
              <button class="btn btn-outline btn-small bid-accept" data-id="${b.bid_id}" data-bid='${escapeHtml(JSON.stringify(b))}'>Accept</button>
              <button class="btn btn-danger btn-small bid-reject" data-id="${b.bid_id}">Reject</button>
            </div>` : ""}
        </div>
      </div>`;
  }

  async function decideBid(id, status, bidJson) {
    try {
      await apiPut(`/bids/update/${id}/`, { status });
      toast(`Bid ${status.toLowerCase()}.`);
      if (status === "Accepted" && bidJson) {
        const bid = JSON.parse(bidJson);
        const projRes = await apiGet(`/projects/?search=${encodeURIComponent(bid.project_title)}`);
        const project = projRes.data.find(p => p.project_title === bid.project_title) || {};
        const today = new Date().toISOString().slice(0, 10);
        await apiPost("/contracts/add/", {
          project_title: bid.project_title,
          freelancer_name: bid.freelancer_name,
          client_name: project.client_name || Session.get().name,
          agreed_budget: bid.bid_amount,
          start_date: today,
          end_date: project.deadline || today,
          contract_status: "Active",
        });
        if (project.project_id) {
          await apiPut(`/projects/update/${project.project_id}/`, { status: "In Progress" });
        }
        toast("Contract created!");
      }
      loadBids();
    } catch {}
  }

  const bidForm = document.getElementById("submit-bid-form");
  if (bidForm) {
    bidForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const session = Session.get();
      if (!session || session.role !== "Freelancer") {
        return toast("Log in as a freelancer to submit a bid.", "error");
      }
      const fd = new FormData(bidForm);
      const payload = Object.fromEntries(fd.entries());
      payload.bid_amount = Number(payload.bid_amount || 0);
      payload.freelancer_name = session.name;
      try {
        await apiPost("/bids/add/", payload);
        toast("Proposal submitted!");
        bidForm.reset();
        loadBids();
      } catch {}
    });
  }

  loadBids();
}

/* =========================================================
   CONTRACTS PAGE
   ========================================================= */
function initContractsPage() {
  const list = document.getElementById("contracts-list");
  if (!list) return;

  async function loadContracts() {
    const { data } = await apiGet("/contracts/");
    list.innerHTML = data.length ? data.map(contractRow).join("") : `<div class="empty-state">No contracts yet — accept a bid to create one.</div>`;
    qsa(".contract-complete").forEach(btn => btn.addEventListener("click", () => updateStatus(btn.dataset.id, "Completed")));
    qsa(".contract-cancel").forEach(btn => btn.addEventListener("click", () => updateStatus(btn.dataset.id, "Cancelled")));
  }

  function contractRow(c) {
    const cls = c.contract_status === "Active" ? "chip-green" : c.contract_status === "Cancelled" ? "chip-red" : "chip-gold";
    return `
      <div class="ticket">
        <span class="ticket-id">CTR-${String(c.contract_id).padStart(3, "0")}</span>
        <h3>${escapeHtml(c.project_title)}</h3>
        <div class="ticket-meta">
          <span class="chip mono">${escapeHtml(c.freelancer_name)} ↔ ${escapeHtml(c.client_name)}</span>
          <span class="chip ${cls}">${escapeHtml(c.contract_status)}</span>
        </div>
        <div class="ticket-foot">
          <span class="ticket-price">${fmtMoney(c.agreed_budget)}</span>
          <span class="muted mono" style="font-size:0.75rem">${c.start_date} → ${c.end_date}</span>
        </div>
        ${c.contract_status === "Active" ? `
          <div class="mt-16 flex gap-8">
            <button class="btn btn-outline btn-small contract-complete" data-id="${c.contract_id}">Mark Completed</button>
            <button class="btn btn-danger btn-small contract-cancel" data-id="${c.contract_id}">Cancel</button>
          </div>` : ""}
      </div>`;
  }

  async function updateStatus(id, status) {
    try {
      await apiPut(`/contracts/update/${id}/`, { contract_status: status });
      toast(`Contract marked ${status.toLowerCase()}.`);
      loadContracts();
    } catch {}
  }

  loadContracts();
}

/* =========================================================
   DASHBOARD PAGE
   ========================================================= */
async function initDashboardPage() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;
  guardDashboard();
  const session = Session.get();
  if (!session) return;

  qs("#dash-name").textContent = session.name;
  qs("#dash-role").textContent = session.role;

  try {
    const stats = (await apiGet("/dashboard/stats/")).data;
    if (session.role === "Freelancer") {
      qs("#dash-stats").innerHTML = statBlocks([
        ["Pending Bids", stats.pending_bids],
        ["Accepted Bids", stats.accepted_bids],
        ["Active Contracts", stats.active_contracts],
      ]);
      const [bidsRes, contractsRes] = await Promise.all([
        apiGet(`/bids/?freelancer_name=${encodeURIComponent(session.name)}`),
        apiGet(`/contracts/?freelancer_name=${encodeURIComponent(session.name)}`),
      ]);
      qs("#dash-list-1-title").textContent = "My Applied Projects (Bids)";
      qs("#dash-list-1").innerHTML = bidsRes.data.length ? bidsRes.data.map(b => `
        <tr><td class="mono">BID-${String(b.bid_id).padStart(3,"0")}</td><td>${escapeHtml(b.project_title)}</td>
        <td>${fmtMoney(b.bid_amount)}</td><td>${statusPill(b.status)}</td></tr>`).join("")
        : `<tr><td colspan="4" class="muted">No bids submitted yet.</td></tr>`;

      qs("#dash-list-2-title").textContent = "Active Contracts";
      qs("#dash-list-2").innerHTML = contractsRes.data.length ? contractsRes.data.map(c => `
        <tr><td class="mono">CTR-${String(c.contract_id).padStart(3,"0")}</td><td>${escapeHtml(c.project_title)}</td>
        <td>${fmtMoney(c.agreed_budget)}</td><td>${statusPill(c.contract_status)}</td></tr>`).join("")
        : `<tr><td colspan="4" class="muted">No contracts yet.</td></tr>`;
    } else {
      qs("#dash-stats").innerHTML = statBlocks([
        ["Open Projects", stats.open_projects],
        ["Pending Bids", stats.pending_bids],
        ["Active Contracts", stats.active_contracts],
      ]);
      const [projectsRes, contractsRes] = await Promise.all([
        apiGet(`/projects/?search=`),
        apiGet(`/contracts/?client_name=${encodeURIComponent(session.name)}`),
      ]);
      const myProjects = projectsRes.data.filter(p => p.client_name === session.name);
      qs("#dash-list-1-title").textContent = "My Projects";
      qs("#dash-list-1").innerHTML = myProjects.length ? myProjects.map(p => `
        <tr><td class="mono">PRJ-${String(p.project_id).padStart(3,"0")}</td><td>${escapeHtml(p.project_title)}</td>
        <td>${fmtMoney(p.budget)}</td><td>${statusPill(p.status)}</td></tr>`).join("")
        : `<tr><td colspan="4" class="muted">You haven't posted any projects yet.</td></tr>`;

      const bidsRes = await apiGet(`/bids/`);
      const myProjectTitles = new Set(myProjects.map(p => p.project_title));
      const receivedBids = bidsRes.data.filter(b => myProjectTitles.has(b.project_title));
      qs("#dash-list-2-title").textContent = "Received Bids";
      qs("#dash-list-2").innerHTML = receivedBids.length ? receivedBids.map(b => `
        <tr><td class="mono">BID-${String(b.bid_id).padStart(3,"0")}</td><td>${escapeHtml(b.project_title)}</td>
        <td>${fmtMoney(b.bid_amount)}</td><td>${statusPill(b.status)}</td></tr>`).join("")
        : `<tr><td colspan="4" class="muted">No bids received yet.</td></tr>`;

      qs("#dash-list-3-wrap")?.classList.remove("hidden");
      qs("#dash-list-3-title") && (qs("#dash-list-3-title").textContent = "Active Contracts");
      if (qs("#dash-list-3")) {
        qs("#dash-list-3").innerHTML = contractsRes.data.length ? contractsRes.data.map(c => `
          <tr><td class="mono">CTR-${String(c.contract_id).padStart(3,"0")}</td><td>${escapeHtml(c.project_title)}</td>
          <td>${fmtMoney(c.agreed_budget)}</td><td>${statusPill(c.contract_status)}</td></tr>`).join("")
          : `<tr><td colspan="4" class="muted">No contracts yet.</td></tr>`;
      }
    }
  } catch {}
}

function statBlocks(pairs) {
  return pairs.map(([label, val]) => `
    <div class="stat-card">
      <div class="num">${val ?? 0}</div>
      <div class="label">${escapeHtml(label)}</div>
    </div>`).join("");
}
function statusPill(status) {
  const cls = ["Accepted", "Active", "Completed", "Open"].includes(status) ? "chip-green"
    : ["Rejected", "Cancelled"].includes(status) ? "chip-red" : "chip-gold";
  return `<span class="chip ${cls}">${escapeHtml(status)}</span>`;
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  renderNavActions();
  initHomePage();
  initRegisterPage();
  initLoginPage();
  initProjectsPage();
  initBidsPage();
  initContractsPage();
  initDashboardPage();
});
