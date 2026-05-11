const FB_KEY = "AIzaSyCVEdunn3AZndDP5Rm1Z3Kv1e6G6W2mB_o";
const FB_PID = "educationbloom-699ed";
const EMAILJS_SVC = "service_jpbq8y4";
const EMAILJS_TMP = "template_4k0qj6b";
const EMAILJS_PUB = "2QpsshYjlaIecP9EI";

const PRICING = [
    { min: 1, max: 50, price: 10000 },
    { min: 51, max: 100, price: 20000 },
    { min: 101, max: 200, price: 35000 },
    { min: 201, max: 350, price: 55000 },
    { min: 351, max: 9999, price: 75000 }
];

let _state = { token: null, uid: null, schoolId: null, plan: 'normal', cache: { students: [] }, agentId: 'direct' };

// CORRECTED: First Term 50%, Remaining Terms 100%
function getQuote(count, terms, plan) {
    const tier = PRICING.find(p => count >= p.min && count <= p.max) || PRICING[0];
    let base = (plan === 'premium') ? tier.price * 1.5 : tier.price;
    
    let firstTerm = base * 0.5;
    let remainingTerms = base * (terms - 1);
    let total = (terms >= 1) ? (firstTerm + remainingTerms) : 0;
    
    let comm = (base * 0.20) * terms; 
    return { total, comm, base };
}

async function sendPremiumComm(student, type, data) {
    if (_state.plan !== 'premium') return toast("⭐ Upgrade to Premium");
    const waMsg = `*Edu-Bloom Update: ${type}*%0A%0AHello, regarding *${student.name}*:%0A${data}%0A%0A- Mgmt, AariNAT Systems`;
    window.open(`https://wa.me/${student.parentPhone}?text=${waMsg}`, '_blank');
    try {
        await emailjs.send(EMAILJS_SVC, EMAILJS_TMP, {
            to_name: student.parentName, to_email: student.parentEmail,
            message: data, school_name: "Edu-Bloom Academy"
        }, EMAILJS_PUB);
        toast("✅ Sent WhatsApp & Email");
    } catch (e) { toast("⚠️ Email Service Error"); }
}

const ui = {
    sidebar: () => document.getElementById('main-sidebar').classList.toggle('active'),
    loading: (s) => document.getElementById('loading-overlay').classList.toggle('hidden', !s)
};
function toast(m) { 
    const t = document.getElementById('toast'); t.innerText = m; 
    t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 3000); 
}
