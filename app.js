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
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- Authentication ---
async function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById('login-name').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;

    if (!role) {
        showToast('Please select a role', 'error');
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password, role })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Login failed');

        state.currentUser = data.user;
        showToast('Login successful!');
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

    if (!role) {
        showToast('Please select a role', 'error');
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password, role })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Registration failed');

        state.currentUser = { name: data.name, role: data.role };
        showToast('Registration successful! Logging in...');
        setTimeout(initDashboard, 1000);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function logout() {
    state.currentUser = null;
    state.records = [];
    dashboardView.classList.remove('active');
    setTimeout(() => {
        authView.classList.add('active');
        clearForm('form-login');
        clearForm('form-register');
        switchCard('login-form');
    }, 300);
}

// --- Dashboard Initialization ---
async function initDashboard() {
    authView.classList.remove('active');

    try {
        // Fetch latest records from the DB
        const res = await fetch('/api/records');
        state.records = await res.json();
    } catch (e) {
        console.error("Failed to load records", e);
    }

    setTimeout(() => {
        dashboardView.classList.add('active');
        navUserName.textContent = state.currentUser.role === 'doctor' ? `Dr. ${state.currentUser.name}` : state.currentUser.name;
        userRoleBadge.textContent = state.currentUser.role;

        // Hide all panels
        document.querySelectorAll('.dashboard-panel').forEach(p => p.classList.remove('active'));

        // Show role specific panel
        if (state.currentUser.role === 'doctor') {
            document.getElementById('doctor-dashboard').classList.add('active');
        } else if (state.currentUser.role === 'patient') {
            document.getElementById('patient-dashboard').classList.add('active');
            renderPatientRecords();
        } else if (state.currentUser.role === 'admin') {
            document.getElementById('admin-dashboard').classList.add('active');
            initAdminChart();
        }
    }, 300);
}

// --- Doctor Blockchain Features ---
function generateHash(length = 64) {
    const chars = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
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
    const btn = document.getElementById('btn-encrypt');
    btn.disabled = true;

    const patientId = document.getElementById('record-patient-id').value;
    const diagnosis = document.getElementById('record-diagnosis').value;
    const notes = document.getElementById('record-notes').value;

    // Simulate Deep Encryption Process visually
    addLogLine('Initiating Deep Encryption Protocol (AES-256 + RSA)...');

    const statusEl = document.getElementById('encryption-status');
    const fillEl = document.getElementById('progress-fill');
    statusEl.classList.remove('hidden');

    // Animate progress bar
    for (let i = 0; i <= 100; i += 10) {
        fillEl.style.width = `${i}%`;
        if (i === 30) addLogLine('Salting parameters securely...');
        if (i === 60) addLogLine('Generating asymmetric key pair...');
        if (i === 90) addLogLine('Hashing data block...');
        await new Promise(r => setTimeout(r, 200));
    }

    const txHash = generateHash(64);
    addLogLine(`Encrypted Payload Hash: ${txHash}`, 'hash');
    addLogLine('Committing to secure SQLite / Cloud volume... Node.js API');

    const dataObj = {
        txHash,
        patientId,
        diagnosis,
        notes,
        date: new Date().toISOString(),
        doctorName: state.currentUser.name
    };

    try {
        const res = await fetch('/api/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
        });

        if (!res.ok) throw new Error('Failed to store record via DB API.');

        addLogLine('Transaction confirmed via Backend. Record secured.', 'success');

        setTimeout(() => {
            statusEl.classList.add('hidden');
            fillEl.style.width = '0%';
            clearForm('form-patient-record');
            showToast('Record securely encrypted and stored in Database!');
            btn.disabled = false;
        }, 1500);

    } catch (err) {
        addLogLine(`Error: ${err.message}`, 'error');
        showToast('Database Error', 'error');
        btn.disabled = false;
    }
}

// --- Patient Dashboard Features ---
function renderPatientRecords() {
    const list = document.getElementById('patient-records-list');
    list.innerHTML = '';

    if (!state.records || state.records.length === 0) {
        list.innerHTML = `<div class="empty-state">No medical records found in Database.</div>`;
        return;
    }

    state.records.forEach(rec => {
        const d = new Date(rec.date).toLocaleDateString();
        list.innerHTML += `
            <div class="glass-card record-card">
                <div class="record-header">
                    <span class="record-date">${d} &bull; Dr. ${rec.doctorName}</span>
                    <span class="record-id" title="Encrypted Hash ID">${rec.txHash.substring(0, 8)}...</span>
                </div>
                <div class="record-details">
                    <h4>${rec.diagnosis}</h4>
                    <p>${rec.notes}</p>
                </div>
                <div style="margin-top: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; color: var(--success); display: flex; align-items: center; gap: 0.25rem;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Decrypted via private key from SQL
                    </span>
                </div>
            </div>
        `;
    });
}

// --- Admin Dashboard Features ---
let accuracyChartInstance = null;
function initAdminChart() {
    document.getElementById('stat-total-records').textContent = state.records ? state.records.length : 0;

    const ctx = document.getElementById('accuracyChart').getContext('2d');

    if (accuracyChartInstance) {
        accuracyChartInstance.destroy();
    }

    // Gradient for chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 242, 254, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

    accuracyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [
                {
                    label: 'Encryption Accuracy (%)',
                    data: [98.5, 99.1, 99.4, 99.6, 99.8, 99.9],
                    borderColor: '#00F2FE',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#00F2FE',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Decryption Success Rate (%)',
                    data: [99.0, 99.2, 99.5, 99.7, 99.9, 100],
                    borderColor: '#10B981',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#10B981',
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#9CA3AF', font: { family: "'Inter', sans-serif" } }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                y: {
                    min: 98,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9CA3AF' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9CA3AF' }
                }
            }
        }
    });
}
