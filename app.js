/**
 * Educational Bloom™ | One-File Logic
 * Optimized for AariNAT Mobile Development
 */

// 1. CONFIG & STATE
const FB_KEY = "AIzaSyCVEdunn3AZndDP5Rm1Z3Kv1e6G6W2mB_o";
const FB_PID = "educationbloom-699ed";
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FB_PID}/databases/(default)/documents`;

let _state = {
    token: null, uid: null, schoolId: null,
    cache: { students: [], payments: [], teachers: [] }
};

const el = id => document.getElementById(id);

// 2. UI HELPERS
const ui = {
    toast: (m) => { const t = el('toast'); t.textContent = m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 3000); },
    loading: (s) => el('loading-overlay').classList.toggle('hidden', !s),
    toggleSidebar: () => el('main-sidebar').classList.toggle('active')
};

// 3. DATABASE ENGINE
const db = {
    headers: () => ({ 'Authorization': `Bearer ${_state.token}`, 'Content-Type': 'application/json' }),
    
    async fetch(path) {
        const r = await fetch(`${FS_BASE}/${path}`, { headers: this.headers() });
        return r.ok ? await r.json() : null;
    },

    async list(col) {
        const d = await this.fetch(`schools/${_state.schoolId}/${col}`);
        return d?.documents ? d.documents.map(doc => ({
            id: doc.name.split('/').pop(),
            ...this.parse(doc.fields)
        })) : [];
    },

    parse: (f) => {
        const o = {};
        for (const [k, v] of Object.entries(f || {})) o[k] = v.stringValue || v.integerValue || v.doubleValue || v.booleanValue || "";
        return o;
    }
};

// 4. AUTHENTICATION
async function doLogin() {
    const email = el('login-email').value;
    const pass = el('login-pass').value;
    if (!email || !pass) return ui.toast("Enter credentials");

    ui.loading(true);
    try {
        const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FB_KEY}`, {
            method: 'POST', body: JSON.stringify({ email, password: pass, returnSecureToken: true })
        });
        const d = await r.json();
        if (d.error) throw new Error(d.error.message);

        _state.token = d.idToken;
        _state.uid = d.localId;

        // Simple Mapping Logic
        _state.schoolId = "sch_" + _state.uid.slice(0, 10);
        
        initializeSystem();
    } catch (e) { ui.toast("Login Failed"); }
    finally { ui.loading(false); }
}

// 5. DATA INITIALIZATION
async function initializeSystem() {
    el('login-screen').classList.add('hidden');
    el('app-screen').classList.remove('hidden');
    
    ui.toast("Syncing cloud...");
    const [stu, pay] = await Promise.all([db.list('students'), db.list('payments')]);
    
    _state.cache.students = stu;
    _state.cache.payments = pay;
    
    renderDashboard();
}

// 6. VIEW RENDERING
function nav(view) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (view === 'dash') renderDashboard();
    if (view === 'students') renderStudents();
    if (window.innerWidth < 1024) ui.toggleSidebar();
}

function renderDashboard() {
    const total = _state.cache.students.length;
    const rev = _state.cache.payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

    el('main-content').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h2>${total}</h2><p>Students</p></div>
            <div class="stat-card"><h2>₦${rev.toLocaleString()}</h2><p>Revenue</p></div>
        </div>
        <div class="card">
            <h3>Recent Students</h3>
            ${_state.cache.students.slice(0, 5).map(s => `
                <div class="list-item"><span>${s.name}</span><small>${s.class}</small></div>
            `).join('') || '<p>No data yet</p>'}
        </div>
    `;
}

function renderStudents() {
    el('main-content').innerHTML = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Student List</h3>
                <button onclick="ui.toast('Add Student feature coming next')" style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:5px;">+ Add</button>
            </div>
            <div style="margin-top:15px;">
                ${_state.cache.students.map(s => `
                    <div class="list-item"><span>${s.name}</span><small>${s.class}</small></div>
                `).join('') || '<p>List is empty</p>'}
            </div>
        </div>
    `;
}

// Sidebar Toggles
function toggleSidebar() { ui.toggleSidebar(); }
function toggleFabMenu() { ui.toast("Quick Actions menu opened"); }
