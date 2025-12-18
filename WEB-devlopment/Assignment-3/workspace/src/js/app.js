// =============================================
// NEXUS VAULT - Secure Personal Notes Application
// =============================================

// Initialize FingerprintJS for Security
let visitorId;
let currentUser = null;
let currentTheme = localStorage.getItem('theme') || 'dark';

// Apply saved theme on load
document.documentElement.setAttribute('data-theme', currentTheme);
document.documentElement.setAttribute('data-bs-theme', currentTheme);

(async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    visitorId = result.visitorId;
    console.log("🔐 Device Signature:", visitorId);
})();

// Theme Toggle
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-bs-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);

    const icon = document.getElementById('themeIcon');
    icon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// Navigation: Show Register Form
function showRegister() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="auth-container fade-in">
            <div class="text-center mb-4">
                <i class="fas fa-user-shield fa-3x" style="color: var(--secondary); opacity: 0.8;"></i>
            </div>
            <h3 class="text-center">Create Your Vault</h3>
            <p class="text-center text-muted small mb-4">Your data is encrypted and secure</p>
            <form id="registerForm" onsubmit="handleRegister(event)">
                <div class="mb-3">
                    <label class="form-label">Full Name</label>
                    <div class="input-group">
                        <span class="input-group-text bg-transparent border-end-0 border-secondary text-muted"><i class="fas fa-user"></i></span>
                        <input type="text" class="form-control border-start-0 ps-0" id="regName" placeholder="John Doe" required minlength="2" maxlength="100">
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email Address</label>
                    <div class="input-group">
                        <span class="input-group-text bg-transparent border-end-0 border-secondary text-muted"><i class="fas fa-envelope"></i></span>
                        <input type="email" class="form-control border-start-0 ps-0" id="regEmail" placeholder="name@example.com" required>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="form-label">Master Password</label>
                    <div class="input-group">
                        <span class="input-group-text bg-transparent border-end-0 border-secondary text-muted"><i class="fas fa-key"></i></span>
                        <input type="password" class="form-control border-start-0 ps-0" id="regPass" placeholder="Min 6 characters" required minlength="6">
                    </div>
                </div>
                <button type="submit" class="btn btn-success w-100 shadow-lg">
                    <i class="fas fa-vault me-2"></i>Create Vault
                </button>
            </form>
            <p class="mt-4 text-center text-muted small">
                Already have a vault? <a href="#" onclick="location.reload()" class="fw-bold">Unlock it</a>
            </p>
        </div>
    `;
}

// Handle Registration
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;

    try {
        const res = await fetch('api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Visitor-Id': visitorId },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (data.success) {
            alert("🎉 Vault Created Successfully! Please login.");
            location.reload();
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Network Error");
    }
}

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loader = document.getElementById('loader');

    loader.style.display = 'block';

    try {
        const res = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Visitor-Id': visitorId },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        loader.style.display = 'none';

        if (data.success) {
            currentUser = data.user;
            renderDashboard(data.user);
        } else {
            alert("Login Failed: " + data.message);
        }
    } catch (error) {
        loader.style.display = 'none';
        console.error(error);
        alert("Network Error");
    }
});

// Render Dashboard
function renderDashboard(user) {
    document.getElementById('app').innerHTML = `
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="dashboard-header fade-in">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="fw-bold mb-1">Welcome back, <span style="color: var(--primary)">${user.name}</span></h2>
                            <p class="text-muted mb-0"><i class="fas fa-shield-check me-2 text-success"></i>Your vault is secure</p>
                        </div>
                        <div>
                            <button class="btn btn-outline-secondary btn-sm me-2" onclick="showActivity()">
                                <i class="fas fa-history"></i>
                            </button>
                            <button class="btn btn-outline-secondary btn-sm me-2" onclick="exportNotes()">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="location.reload()">
                                <i class="fas fa-lock"></i> Lock
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card fade-in h-100 d-flex flex-column justify-content-center">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-sticky-note fa-2x me-3"></i>
                        <div>
                            <h3 class="mb-0" id="totalNotes">-</h3>
                            <small>Total Notes</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <div class="d-flex align-items-center gap-2">
                <h4 class="mb-0"><i class="fas fa-folder-open me-2"></i>My Notes</h4>
                <div class="btn-group ms-3">
                    <button class="btn btn-sm btn-outline-secondary active" onclick="filterNotes(null, this)">All</button>
                    <button class="btn btn-sm btn-outline-primary" onclick="filterNotes('work', this)">🔵 Work</button>
                    <button class="btn btn-sm btn-outline-success" onclick="filterNotes('personal', this)">🟢 Personal</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="filterNotes('important', this)">🔴 Important</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="filterNotes('idea', this)">🟡 Idea</button>
                </div>
            </div>
            <div class="d-flex gap-2">
                <input type="text" class="search-box" id="searchBox" placeholder="🔍 Search notes..." oninput="searchNotes(this.value)">
                <button class="btn btn-primary" onclick="openNoteModal()">
                    <i class="fas fa-plus me-2"></i>Add Note
                </button>
            </div>
        </div>
        
        <div class="row" id="notesContainer">
            <div class="col-12 text-center text-muted py-5">
                <div class="loader" style="display: block;"></div> Loading vault...
            </div>
        </div>
    `;

    loadNotes();
    loadStats();
}

let currentFilter = null;

// Load Notes
async function loadNotes(search = null, tag = null) {
    try {
        let url = 'api/notes.php';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (tag) params.append('tag', tag);
        if (params.toString()) url += '?' + params.toString();

        const res = await fetch(url);
        const data = await res.json();

        const container = document.getElementById('notesContainer');

        if (!data.success) {
            container.innerHTML = `<div class="col-12 text-center text-danger">${data.message}</div>`;
            return;
        }

        if (data.data.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <i class="fas fa-vault fa-3x mb-3" style="opacity: 0.3;"></i>
                    <p>Your vault is empty. Add your first note!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.data.map(note => `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="tag tag-${note.tag}">${getTagEmoji(note.tag)} ${capitalize(note.tag)}</span>
                            ${note.is_encrypted ? '<span class="encrypted-badge"><i class="fas fa-lock me-1"></i>Encrypted</span>' : ''}
                        </div>
                        <h5 class="card-title mt-2">${escapeHtml(note.title)}</h5>
                        <p class="card-text text-muted small">${escapeHtml(note.content.substring(0, 120))}${note.content.length > 120 ? '...' : ''}</p>
                    </div>
                    <div class="card-footer bg-transparent border-secondary d-flex justify-content-between align-items-center">
                        <small class="text-muted"><i class="fas fa-clock me-1"></i>${note.created_at}</small>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editNote('${note.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteNote('${note.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
        document.getElementById('notesContainer').innerHTML = `<div class="col-12 text-center text-danger">Failed to load notes</div>`;
    }
}

// Load Stats
async function loadStats() {
    try {
        const res = await fetch('api/notes.php?action=stats');
        const data = await res.json();
        if (data.success) {
            document.getElementById('totalNotes').textContent = data.data.total;
        }
    } catch (e) { console.error(e); }
}

// Filter Notes
function filterNotes(tag, btn) {
    currentFilter = tag;
    document.querySelectorAll('.btn-group .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadNotes(null, tag);
}

// Search Notes
let searchTimeout;
function searchNotes(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadNotes(query, currentFilter);
    }, 300);
}

// Open Note Modal
function openNoteModal(id = null) {
    document.getElementById('noteId').value = id || '';
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteTag').value = 'personal';
    document.getElementById('noteModalTitle').innerHTML = id ? '<i class="fas fa-edit me-2"></i>Edit Note' : '<i class="fas fa-plus me-2"></i>Add Note';

    new bootstrap.Modal(document.getElementById('noteModal')).show();
}

// Edit Note
async function editNote(id) {
    try {
        const res = await fetch(`api/notes.php?action=single&id=${id}`);
        const data = await res.json();
        if (data.success) {
            const note = data.data;
            document.getElementById('noteId').value = note.id;
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').value = note.content;
            document.getElementById('noteTag').value = note.tag;
            document.getElementById('noteModalTitle').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Note';
            new bootstrap.Modal(document.getElementById('noteModal')).show();
        }
    } catch (e) { console.error(e); alert('Failed to load note'); }
}

// Save Note
async function saveNote() {
    const id = document.getElementById('noteId').value;
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const tag = document.getElementById('noteTag').value;

    if (!title.trim()) { alert('Title is required'); return; }

    try {
        const method = id ? 'PUT' : 'POST';
        const body = id ? { id, title, content, tag } : { title, content, tag };

        const res = await fetch('api/notes.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('noteModal')).hide();
            loadNotes(null, currentFilter);
            loadStats();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (e) { console.error(e); alert('Failed to save note'); }
}

// Delete Note
async function deleteNote(id) {
    if (!confirm('⚠️ Are you sure you want to delete this note?')) return;

    try {
        const res = await fetch(`api/notes.php?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            loadNotes(null, currentFilter);
            loadStats();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (e) { console.error(e); alert('Failed to delete note'); }
}

// Show Activity Log
async function showActivity() {
    try {
        const res = await fetch('api/notes.php?action=activity');
        const data = await res.json();

        const content = document.getElementById('activityContent');
        if (data.success && data.data.length > 0) {
            content.innerHTML = data.data.map(a => `
                <div class="activity-item">
                    <strong>${formatAction(a.action)}</strong>
                    <p class="mb-0 small text-muted">${a.details}</p>
                    <small class="text-muted">${a.timestamp}</small>
                </div>
            `).join('');
        } else {
            content.innerHTML = '<p class="text-muted text-center">No activity yet</p>';
        }

        new bootstrap.Modal(document.getElementById('activityModal')).show();
    } catch (e) { console.error(e); }
}

// Export Notes
async function exportNotes() {
    try {
        const res = await fetch('api/notes.php?action=export');
        const data = await res.json();
        if (data.success) {
            const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nexus_vault_export.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    } catch (e) { console.error(e); alert('Failed to export'); }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function getTagEmoji(tag) {
    const emojis = { work: '🔵', personal: '🟢', important: '🔴', idea: '🟡' };
    return emojis[tag] || '⚪';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatAction(action) {
    const icons = {
        'note_created': '📝 Note Created',
        'note_updated': '✏️ Note Updated',
        'note_deleted': '🗑️ Note Deleted',
        'notes_exported': '📤 Notes Exported',
        'login': '🔓 Login'
    };
    return icons[action] || action;
}
