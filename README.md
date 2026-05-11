# AariNAT Educational Bloom 🌱

> **Stop guessing. Start collecting.**  
> *The offline‑first, mobile‑ready toolkit that turns fee leakage into recovered revenue — built for Nigerian private schools.*

---

## 🎯 What This Is

Educational Bloom is a **Phase‑1 fintech‑education hybrid** designed to help private school proprietors in Nigeria:

- Stop losing 10‑30% of termly fees to manual tracking and gate leakage.
- Recover unpaid fees with automated WhatsApp reminders and real‑time dashboards.
- Manage staff, students, and payments — all from a mobile phone, with no internet required.

The toolkit consists of four standalone HTML files.  
No server, no installation, no login walls — just open the file and start recovering money.

---

## 📁 Files in This Repository

| File | Who Uses It | What It Does |
|------|-------------|--------------|
| **`index.html`** | Agents & Field Reps | The **Agent Pro App** — performs a live “Fee Leakage Audit” and generates a recovery invoice for school owners. |
| **`portal.html`** | Principals & Bursars | The **School Portal** — revenue dashboard, staff management (with Basic/Premium plan enforcement), student setup, bulk payment import. |
| **`report.html`** | Teachers & Administrators | The **Parent Value Report** generator — creates a professional report card with grades, SWOT analysis, and payment receipt. |
| **`admin.html`** | You (AariNAT HQ) | The **Command Center** — tracks agents, calculates commissions, and monitors progress toward the ₦250,000 CAC reactivation target. |

All four files communicate via the browser’s **localStorage**, so a school’s data lives on the principal’s device.  
In Phase 2, a simple configuration switch will connect them to a central cloud database (Firebase).

---

## 🚀 How to Use (Right Now)

1. **For Agents:**  
   - Open `index.html` on your phone.  
   - Enter your name and WhatsApp (stored locally).  
   - Walk into a school, upload their student register (CSV) or type a rough count.  
   - Move the leakage slider — show the principal how much money they are losing.  
   - Generate and send the recovery invoice via WhatsApp.

2. **For School Owners:**  
   - Open `portal.html` on any device.  
   - Log in with a school ID, email, and password (first login seeds a default principal account).  
   - Go to **🎓 Students** to upload your register or add students manually.  
   - Switch to **💰 Revenue** to see the collection dashboard, send reminders, and record payments.  
   - Use **👥 Staff Mgmt** to add bursars and teachers (up to 3 on the Basic plan; upgrade to Premium for unlimited).

3. **For Reports:**  
   - Open `report.html`, enter a student’s grades, fee status, and SWOT observations.  
   - Generate the report and **Print → Save as PDF** or share the summary on WhatsApp.

4. **For You (Admin):**  
   - Open `admin.html` to add agents and log every school they close.  
   - The tracker automatically calculates commissions, net revenue, and how close you are to the ₦250,000 goal.

---

## 🧠 The Bigger Picture

Educational Bloom is the **cash‑generating bridge** that will:

- Raise the ₦250,000 needed to reactivate Aarinat Company Limited (CAC).
- Unlock formal engagement of the Governance Committee Chair (Prof. Emmanuel Moore Abolo), ESG advisor (Chika Onyekwere), and independent NEDs.
- Provide a proven, data‑rich education‑infrastructure product that DFIs (AfDB, IFC) can back.

Once the board is seated and the pipeline opens, Bloom evolves into a **national school commerce platform** — processing fees, aggregating procurement, and providing credit scores to thousands of schools.

---

## 🔮 Roadmap (Phases)

- **Phase 0 (current):** Reach ₦250,000 through agent‑led sales using these offline apps.  
- **Phase 1 (in‑progress):** Harden the portal with real user accounts, payment processing, and procurement aggregation.  
- **Phase 2+:** Switch to a cloud backend (Firestore), launch BloomCollect (fee processing), and expand to universities, nursing schools, and government pilot programmes.

---

## 📜 License & Contribution

This repository is part of the **AariNAT Company Limited** ecosystem.  
All rights reserved. For partnership or deployment inquiries, contact the repository owner.

---

*Built with grit from Abeokuta, for every school that deserves clarity over its cash.*
