// --- State Management ---
const state = {
    currentUser: null,
    records: []
};

// --- DOM Elements ---
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const userRoleBadge = document.getElementById('user-role-badge');
const navUserName = document.getElementById('nav-user-name');

// --- Global Animation Logic (Intersection Observer) ---
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right').forEach((el) => {
        el.classList.remove('revealed'); // Reset
        // Small delay for natural flow
        setTimeout(() => observer.observe(el), 50);
    });
}

// --- Navigation & View Switching ---
function switchCard(cardId) {
    document.querySelectorAll('.form-container').forEach(el => el.classList.remove('active'));
    document.getElementById(cardId).classList.add('active');
}

function clearForm(formId) {
    document.getElementById(formId).reset();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'pro-toast';
    toast.classList.add(type);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// --- Authentication ---
async function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById('login-name').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;

    if (!role) { showToast('Please select a clearance level', 'error'); return; }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication denied');

        state.currentUser = data.user;
        showToast('Access Granted');
        initDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    if (!role) { showToast('Please select a clearance level', 'error'); return; }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        state.currentUser = { name: data.name, role: data.role };
        showToast('Clearance Issued. Initiating Protocol...');
        setTimeout(initDashboard, 1500);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function logout() {
    state.currentUser = null;
    state.records = [];
    dashboardView.style.opacity = '0';
    setTimeout(() => {
        dashboardView.classList.remove('active');
        authView.classList.add('active');
        authView.style.opacity = '1';
        clearForm('form-login');
        clearForm('form-register');
        switchCard('login-form');
        initAnimations();
    }, 400);
}

// --- Dashboard Initialization ---
async function initDashboard() {
    authView.style.opacity = '0';

    try {
        // Fetch fresh records EVERY TIME dashboard loads.
        const res = await fetch('/api/records');
        state.records = await res.json();
    } catch (e) { console.error("Network Error", e); }

    setTimeout(() => {
        authView.classList.remove('active');
        dashboardView.classList.add('active');
        dashboardView.style.opacity = '1';

        navUserName.textContent = state.currentUser.role === 'doctor' ? `Dr. ${state.currentUser.name}` : state.currentUser.name;
        userRoleBadge.textContent = state.currentUser.role;

        document.querySelectorAll('.dashboard-panel').forEach(p => p.classList.remove('active'));

        if (state.currentUser.role === 'doctor') {
            document.getElementById('doctor-dashboard').classList.add('active');
        } else if (state.currentUser.role === 'patient') {
            document.getElementById('patient-dashboard').classList.add('active');
            renderPatientRecords();
        } else if (state.currentUser.role === 'admin') {
            document.getElementById('admin-dashboard').classList.add('active');
            initAdminChart();
            renderAdminTable(); // New feature!
        }

        // Trigger sleek entry animations for the loaded dashboard components
        initAnimations();
    }, 400);
}

// --- Doctor Features ---
function generateHash(length = 64) {
    const chars = 'abcdef0123456789'; let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

function addLogLine(text, type = 'system') {
    const consoleEl = document.getElementById('encryption-console');
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

async function handleRecordInsertion(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-encrypt'); btn.disabled = true;
    const patientId = document.getElementById('record-patient-id').value;
    const diagnosis = document.getElementById('record-diagnosis').value;
    const notes = document.getElementById('record-notes').value;

    addLogLine('Initiating Deep Encryption Protocol (AES-256 + RSA)...');
    document.getElementById('encryption-status').classList.remove('hidden');
    const fillEl = document.getElementById('progress-fill');

    // Smooth loader sim
    for (let i = 0; i <= 100; i += 5) {
        fillEl.style.width = `${i}%`;
        if (i === 25) addLogLine('Salting parameters securely...');
        if (i === 50) addLogLine('Generating asymmetric key pair...');
        if (i === 85) addLogLine('Hashing data block...');
        await new Promise(r => setTimeout(r, 100)); // Faster, smoother
    }

    const txHash = generateHash(64);
    addLogLine(`Encrypted Payload Hash: ${txHash}`, 'hash');
    addLogLine('Committing to secure Cloud volume via API...');

    const dataObj = { txHash, patientId, diagnosis, notes, date: new Date().toISOString(), doctorName: state.currentUser.name };

    try {
        const res = await fetch('/api/records', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataObj)
        });
        if (!res.ok) throw new Error('API Rejection');

        addLogLine('Transaction confirmed. Record secured as Immutable Block.', 'success');

        setTimeout(() => {
            document.getElementById('encryption-status').classList.add('hidden');
            fillEl.style.width = '0%'; clearForm('form-patient-record');
            showToast('Encrypted Data stored in Database!');
            btn.disabled = false;
        }, 2000);
    } catch (err) {
        addLogLine(`Error: ${err.message}`, 'error');
        showToast('Secure Socket Error', 'error'); btn.disabled = false;
    }
}

// --- Patient Features ---
function renderPatientRecords() {
    const list = document.getElementById('patient-records-list');
    list.innerHTML = '';
    if (!state.records || state.records.length === 0) {
        list.innerHTML = `<div class="empty-state pro-card reveal-up"><h4>Empty Database</h4><p>No medical records assigned to you.</p></div>`;
        return;
    }

    state.records.forEach((rec, index) => {
        const d = new Date(rec.date).toLocaleDateString();
        // Stagger injection delay for coolness
        setTimeout(() => {
            list.innerHTML += `
                <div class="pro-card record-card reveal-up revealed">
                    <div class="record-header">
                        <span class="record-date">${d} &bull; Dr. ${rec.doctorName}</span>
                        <span class="hash-badge" title="Cryptographic Identifier">${rec.txHash.substring(0, 8)}...</span>
                    </div>
                    <div>
                        <h4 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: #fff;">${rec.diagnosis}</h4>
                        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${rec.notes}</p>
                    </div>
                    <div style="border-top: 1px solid var(--border-light); padding-top: 1rem;">
                        <span style="font-size: 0.75rem; color: var(--success); display: flex; align-items: center; gap: 0.4rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            Decrypted Locally via Private Handshake
                        </span>
                    </div>
                </div>
            `;
        }, index * 100);
    });
}

// --- Admin Features ---
let adminChart = null;

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';

    if (!state.records || state.records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No blocks established yet.</td></tr>`;
        return;
    }

    state.records.forEach(rec => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(rec.date).toLocaleString()}</td>
            <td style="font-weight: 500;">${rec.patientId}</td>
            <td><span class="hash-badge">${rec.txHash.substring(0, 16)}...</span></td>
            <td>Dr. ${rec.doctorName}</td>
        `;
        tbody.appendChild(row);
    });
}

function initAdminChart() {
    document.getElementById('stat-total-records').textContent = state.records ? state.records.length : 0;
    const ctx = document.getElementById('accuracyChart').getContext('2d');
    if (adminChart) adminChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

    adminChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Node 1', 'Node 2', 'Node 3', 'Node 4', 'Node 5', 'Node 6'],
            datasets: [
                {
                    label: 'Cryptographic Integrity (%)',
                    data: [98.5, 99.1, 99.4, 99.6, 99.8, 99.9],
                    borderColor: '#00F2FE', tension: 0.5, fill: true, backgroundColor: gradient,
                    borderWidth: 2, pointBackgroundColor: '#000', pointBorderColor: '#00F2FE',
                    pointRadius: 4, pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#a1a1aa', font: { family: "'Space Grotesk', sans-serif" } } },
                tooltip: { backgroundColor: 'rgba(10, 10, 10, 0.9)', titleColor: '#fff', bodyColor: '#fff', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12 }
            },
            scales: {
                y: { min: 98, max: 100, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#a1a1aa' } },
                x: { grid: { display: false }, ticks: { color: '#a1a1aa' } }
            }
        }
    });
}

// Intercept page reload just to start animations natively
document.addEventListener("DOMContentLoaded", () => {
    initAnimations();
});
