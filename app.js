/** * EDUCATIONAL BLOOM™ | CORE ERP
 * AariNAT Development Build
 */

const FB_KEY = "AIzaSyCVEdunn3AZndDP5Rm1Z3Kv1e6G6W2mB_o";
const FB_PID = "educationbloom-699ed";
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FB_PID}/databases/(default)/documents`;

const PRICING_TABLE = [
    { min: 1, max: 50, price: 10000 },
    { min: 51, max: 100, price: 20000 },
    { min: 101, max: 200, price: 35000 },
    { min: 201, max: 350, price: 55000 },
    { min: 351, max: 9999, price: 75000 }
];

let _state = {
    token: null, uid: null, schoolId: null, plan: 'normal',
    cache: { students: [], payments: [] },
    referredBy: 'direct' // Default agent source
};

const el = id => document.getElementById(id);

// 1. UI ENGINE
const ui = {
    toast: (m) => { const t = el('toast'); t.textContent = m; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 3000); },
    loading: (s) => el('loading-overlay').classList.toggle('hidden', !s),
    sidebar: () => el('main-sidebar').classList.toggle('active')
};

// 2. DATABASE ENGINE
const db = {
    headers: () => ({ 'Authorization': `Bearer ${_state.token}`, 'Content-Type': 'application/json' }),
    async list(col) {
        try {
            const r = await fetch(`${FS_BASE}/schools/${_state.schoolId}/${col}`, { headers: this.headers() });
            const d = await r.json();
            return d.documents ? d.documents.map(doc => this.parse(doc)) : [];
        } catch (e) { return []; }
    },
    async save(col, data, id = null) {
        const method = id ? 'PATCH' : 'POST';
        const url = id ? `${FS_BASE}/schools/${_state.schoolId}/${col}/${id}` : `${FS_BASE}/schools/${_state.schoolId}/${col}`;
        const r = await fetch(url, { method, headers: this.headers(), body: JSON.stringify({ fields: this.serialize(data) }) });
        return r.ok;
    },
    parse: (doc) => {
        const o = { id: doc.name.split('/').pop() };
        for (const [k, v] of Object.entries(doc.fields || {})) o[k] = v.stringValue || v.integerValue || v.doubleValue || v.booleanValue || "";
        return o;
    },
    serialize: (obj) => {
        const f = {};
        for (const [k, v] of Object.entries(obj)) {
            if (typeof v === 'number') f[k] = { doubleValue: v };
            else if (typeof v === 'boolean') f[k] = { booleanValue: v };
            else f[k] = { stringValue: String(v) };
        }
        return f;
    }
};

// 3. COMMERCIAL ENGINE
function calculateQuote(count, terms, plan) {
    const tier = PRICING_TABLE.find(p => count >= p.min && count <= p.max) || PRICING_TABLE[0];
    const base = (plan === 'premium') ? tier.price * 1.5 : tier.price;
    const total = (terms >= 2) ? (base * 0.5) + (base * (terms - 1)) : base;
    const commission = (base * 0.20) * terms; // 20% on full price
    return { total, commission, base };
}

// 4. AUTH & CORE FLOW
async function doLogin() {
    const email = el('login-email').value;
    const pass = el('login-pass').value;
    ui.loading(true);
    try {
        const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FB_KEY}`, {
            method: 'POST', body: JSON.stringify({ email, password: pass, returnSecureToken: true })
        });
        const d = await r.json();
        if (d.error) throw d.error;

        _state.token = d.idToken;
        _state.uid = d.localId;
        _state.schoolId = "sch_" + _state.uid.slice(0, 10);
        
        await syncData();
        el('login-screen').classList.add('hidden');
        el('app-screen').classList.remove('hidden');
    } catch (e) { ui.toast("Auth Error"); }
    finally { ui.loading(false); }
}

async function syncData() {
    _state.cache.students = await db.list('students');
    _state.cache.payments = await db.list('payments');
    renderDashboard();
}

// 5. VIEW ROUTER
function nav(view) {
    ui.sidebar(); // Auto-close menu
    if (view === 'dash') renderDashboard();
    if (view === 'students') renderStudents();
    if (view === 'opps') renderOpps();
    if (view === 'analytics') renderAnalytics();
    if (view === 'pay') renderPay();
}

// 6. MODULES
function renderDashboard() {
    const inv = calculateQuote(_state.cache.students.length, 1, _state.plan);
    el('main-content').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h2>${_state.cache.students.length}</h2><p>Students</p></div>
            <div class="stat-card"><h2>₦${inv.total.toLocaleString()}</h2><p>Term Fee</p></div>
        </div>
        <div class="card" onclick="nav('pay')">
            <p>Plan Status: <span class="badge" style="color:var(--success)">Active</span></p>
            <button class="btn-primary" style="margin-top:10px; background:var(--warning)">Pay for Next Term (-50%)</button>
        </div>
    `;
}

function renderAnalytics() {
    el('main-content').innerHTML = `
        <div class="card">
            <h3>📈 Student SWOT Analysis</h3>
            <div class="swot-grid">
                <div class="swot-box" style="background:#d1fae5; color:#065f46">S: Mathematics</div>
                <div class="swot-box" style="background:#fee2e2; color:#991b1b">W: Hand-writing</div>
                <div class="swot-box" style="background:#eef2ff; color:#4f46e5">O: Coding Club</div>
                <div class="swot-box" style="background:#fef3c7; color:#92400e">T: Low Attendance</div>
            </div>
        </div>
    `;
}

function renderOpps() {
    el('main-content').innerHTML = `
        <div class="card">
            <h3>🌟 Growth Opportunities</h3>
            <div class="list-item">
                <span><strong>Edu-Grant 2026</strong><br><small>Support for Private Schools</small></span>
                <button class="btn-primary" style="width:auto; margin:0; padding:5px 10px;">Apply</button>
            </div>
            <div class="list-item">
                <span><strong>Scholarship: JSS3 Students</strong><br><small>Funded by AariNAT Tech</small></span>
                <span style="color:var(--primary); font-weight:700;">Details</span>
            </div>
        </div>
    `;
}

function renderPay() {
    const q = calculateQuote(_state.cache.students.length, 2, _state.plan);
    el('main-content').innerHTML = `
        <div class="card">
            <h3>💳 Payment Portal</h3>
            <p>Paying for 2 Terms (50% Disc. Applied)</p>
            <h2 style="margin:10px 0; color:var(--success)">₦${q.total.toLocaleString()}</h2>
            <div style="background:var(--light-bg); padding:10px; border-radius:10px; font-size:0.85rem;">
                <strong>Bank:</strong> Moniepoint<br><strong>Acct:</strong> 8145073941<br><strong>Name:</strong> AariNAT Tech
            </div>
            <input type="file" id="receipt" accept="image/*">
            <button class="btn-primary" onclick="submitPay(${q.total}, ${q.commission})">Upload Receipt</button>
        </div>
    `;
}

async function submitPay(amt, comm) {
    const f = el('receipt').files[0];
    if(!f) return ui.toast("Select receipt image");
    ui.loading(true);
    const ok = await db.save('payments', { amount: amt, commission: comm, status: 'pending', agentId: _state.referredBy });
    if(ok) { ui.toast("Receipt Sent!"); nav('dash'); }
    ui.loading(false);
}
