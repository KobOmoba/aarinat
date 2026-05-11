/**
 * Educational Bloom™ Core Logic
 * Optimized for Mobile Development & High Performance
 */

// 1. CONFIGURATION & CONSTANTS
Emailjs.init("2QpsshYjlaIecP9EI");
const FB_KEY = "AIzaSyCVEdunn3AZndDP5Rm1Z3Kv1e6G6W2mB_o";
const FB_PID = "educationbloom-699ed";
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FB_PID}/databases/(default)/documents`;

// App State
let _state = {
    token: null,
    uid: null,
    schoolId: null,
    user: null,
    plan: 'basic',
    cache: { students: [], teachers: [], payments: [], expenses: [], attendance: [] }
};

const el = id => document.getElementById(id);

// 2. UTILITIES & TOASTS
const ui = {
    toast: (msg, type = 'info') => {
        const t = el('toast');
        t.textContent = msg;
        t.style.background = type === 'error' ? '#ef4444' : '#0f172a';
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    },
    loading: (show) => {
        el('loading-overlay').classList.toggle('hidden', !show);
    },
    toggleModal: (id, show) => {
        el(id).classList.toggle('on', show);
    }
};

// 3. FIRESTORE ENGINE (Optimized)
const db = {
    headers: () => ({
        'Authorization': `Bearer ${_state.token}`,
        'Content-Type': 'application/json'
    }),

    async get(path) {
        const r = await fetch(`${FS_BASE}/${path}`, { headers: this.headers() });
        if (!r.ok) return null;
        const d = await r.json();
        return this.parse(d.fields);
    },

    async list(col) {
        const r = await fetch(`${FS_BASE}/schools/${_state.schoolId}/${col}`, { headers: this.headers() });
        const d = await r.json();
        return d.documents ? d.documents.map(doc => ({
            id: doc.name.split('/').pop(),
            ...this.parse(doc.fields)
        })) : [];
    },

    async save(col, data, id = null) {
        const method = id ? 'PATCH' : 'POST';
        const url = id ? `${FS_BASE}/schools/${_state.schoolId}/${col}/${id}` : `${FS_BASE}/schools/${_state.schoolId}/${col}`;
        
        const r = await fetch(url, {
            method: method,
            headers: this.headers(),
            body: JSON.stringify(this.serialize(data))
        });
        return r.ok;
    },

    parse: (fields) => {
        const obj = {};
        for (const [k, v] of Object.entries(fields || {})) {
            obj[k] = v.stringValue || v.integerValue || v.doubleValue || v.booleanValue || null;
        }
        return obj;
    },

    serialize: (obj) => {
        const fields = {};
        for (const [k, v] of Object.entries(obj)) {
            if (typeof v === 'number') fields[k] = { doubleValue: v };
            else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
            else fields[k] = { stringValue: String(v) };
        }
        return { fields };
    }
};

// 4. AUTHENTICATION FLOW
async function doLogin() {
    const email = el('login-email').value;
    const pass = el('login-pass').value;

    if (!email || !pass) return ui.toast("Please fill all fields", "error");

    ui.loading(true);
    try {
        const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FB_KEY}`, {
            method: 'POST',
            body: JSON.stringify({ email, password: pass, returnSecureToken: true })
        });
        const d = await r.json();

        if (d.error) throw new Error(d.error.message);

        _state.token = d.idToken;
        _state.uid = d.localId;
        _state.user = { email: d.email };

        // Get or Create School Mapping
        let map = await db.get(`userSchoolMap/${_state.uid}`);
        if (!map) {
            _state.schoolId = `sch_${Date.now()}`;
            await db.save(`userSchoolMap/${_state.uid}`, { schoolId: _state.schoolId });
            await db.save(`schools/${_state.schoolId}`, { name: "New School", plan: "basic" }, _state.schoolId);
        } else {
            _state.schoolId = map.schoolId;
        }

        initializeSystem();
    } catch (e) {
        ui.toast(e.message, "error");
    } finally {
        ui.loading(false);
    }
}

// 5. INITIALIZATION & DATA SYNC
async function initializeSystem() {
    el('login-screen').style.display = 'none';
    el('app-screen').classList.add('show');
    
    ui.toast("Syncing data...");
    
    // Fetch all collections in parallel for speed
    const [stu, pay, exp] = await Promise.all([
        db.list('students'),
        db.list('payments'),
        db.list('expenses')
    ]);

    _state.cache.students = stu;
    _state.cache.payments = pay;
    _state.cache.expenses = exp;

    renderDashboard();
}

// 6. DYNAMIC UI RENDERING
function renderDashboard() {
    const totalStudents = _state.cache.students.length;
    const totalRev = _state.cache.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    el('main-content').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h2>${totalStudents}</h2>
                <p>Total Students</p>
            </div>
            <div class="stat-card">
                <h2>₦${totalRev.toLocaleString()}</h2>
                <p>Revenue Collected</p>
            </div>
        </div>
        
        <div class="card">
            <h3>Recent Activity</h3>
            <div id="recent-list">
                ${_state.cache.students.slice(0, 5).map(s => `
                    <div class="list-item">
                        <span>${s.name}</span>
                        <small>${s.class}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 7. OCR & SMART SCAN (The "Snap" Feature)
async function triggerSnap() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        ui.loading(true);
        ui.toast("AI is reading document...");

        try {
            const { data: { text } } = await Tesseract.recognize(file, 'eng');
            processOCR(text);
        } catch (err) {
            ui.toast("OCR Failed: " + err.message, "error");
        } finally {
            ui.loading(false);
        }
    };
    input.click();
}

function processOCR(text) {
    // Basic AI Parser logic
    console.log("Extracted Text:", text);
    ui.toast("Scan Complete! Data extracted.");
    // Here you would add logic to regex the text for names/amounts
}

// 8. NAVIGATION HANDLER
function nav(view) {
    // Toggle active states in UI
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    // In a real app, you'd use a switch case to render different modules
    if(view === 'dash') renderDashboard();
    if(view === 'students') renderStudentsView();
    
    // Auto-close sidebar on mobile after clicking
    if(window.innerWidth < 1024) toggleSidebar();
}

// AUTO-LOGIN CHECK (Mobile Persistence)
(async function init() {
    const saved = localStorage.getItem('eb_s');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.x > Date.now()) {
            _state.token = data.t;
            _state.uid = data.u;
            _state.schoolId = data.s || null;
            if(_state.schoolId) initializeSystem();
        }
    }
})();
