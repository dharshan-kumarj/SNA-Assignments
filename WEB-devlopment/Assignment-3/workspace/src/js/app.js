// Initialize FingerprintJS
let visitorId;
let currentUser = null;

(async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    visitorId = result.visitorId;
    console.log("Device Signature:", visitorId);
})();

// Navigation Logic
function showRegister() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="auth-container fade-in">
             <div class="text-center mb-4">
                <i class="fas fa-user-plus fa-3x" style="color: var(--secondary); opacity: 0.8;"></i>
            </div>
            <h3>Create Account</h3>
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
                    <label class="form-label">Password</label>
                     <div class="input-group">
                        <span class="input-group-text bg-transparent border-end-0 border-secondary text-muted"><i class="fas fa-lock"></i></span>
                        <input type="password" class="form-control border-start-0 ps-0" id="regPass" placeholder="Min 6 characters" required minlength="6">
                    </div>
                </div>
                <button type="submit" class="btn btn-success w-100 shadow-lg">
                    Sign Up <i class="fas fa-rocket ms-2"></i>
                </button>
            </form>
            <p class="mt-4 text-center text-muted small">
                Already have an account? <a href="#" onclick="location.reload()" class="fw-bold">Login here</a>
            </p>
        </div>
    `;
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;

    try {
        const res = await fetch('api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Visitor-Id': visitorId
            },
            body: JSON.stringify({ name, email, password })
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Server Error HTML:", text);
            alert("Server Error: Check console for details.");
            return;
        }

        if (data.success) {
            alert("Registration Successful! Please Login.");
            location.reload();
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Network Error");
    }
}

// Logic for Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loader = document.getElementById('loader');

    loader.style.display = 'block';

    try {
        const res = await fetch('api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Visitor-Id': visitorId
            },
            body: JSON.stringify({ email, password })
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Server Error HTML:", text);
            alert("Server Error: Check console for details.");
            loader.style.display = 'none';
            return;
        }

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

function renderDashboard(user) {
    document.getElementById('app').innerHTML = `
        <div class="dashboard-header fade-in">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h1 class="display-4 fw-bold">Hello, <span style="color: var(--primary)">${user.name}</span></h1>
                    <p class="text-muted lead">Welcome to your secure notes dashboard.</p>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-outline-danger" onclick="location.reload()">Logout</button>
                </div>
            </div>
        </div>
        
        <div class="d-flex justify-content-between align-items-center my-4">
            <h4><i class="fas fa-sticky-note me-2"></i>My Notes</h4>
            <button class="btn btn-primary" onclick="openNoteModal()">
                <i class="fas fa-plus me-2"></i>Add Note
            </button>
        </div>
        
        <div class="row" id="notesContainer">
            <div class="col-12 text-center text-muted py-5">
                <div class="loader" style="display: block;"></div>
                Loading notes...
            </div>
        </div>
    `;

    loadNotes();
}

// Notes CRUD Operations
async function loadNotes() {
    try {
        const res = await fetch('api/notes.php');
        const data = await res.json();

        const container = document.getElementById('notesContainer');

        if (!data.success) {
            container.innerHTML = `<div class="col-12 text-center text-danger">${data.message}</div>`;
            return;
        }

        if (data.data.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <i class="fas fa-folder-open fa-3x mb-3" style="opacity: 0.3;"></i>
                    <p>No notes yet. Create your first note!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.data.map(note => `
            <div class="col-md-4 mb-4">
                <div class="card bg-dark border-secondary h-100">
                    <div class="card-body">
                        <h5 class="card-title">${escapeHtml(note.title)}</h5>
                        <p class="card-text text-muted small">${escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
                        <p class="text-muted small mb-0"><i class="fas fa-clock me-1"></i>${note.created_at}</p>
                    </div>
                    <div class="card-footer bg-transparent border-secondary">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editNote('${note.id}', '${escapeHtml(note.title)}', '${escapeHtml(note.content)}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteNote('${note.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
        document.getElementById('notesContainer').innerHTML = `<div class="col-12 text-center text-danger">Failed to load notes</div>`;
    }
}

function openNoteModal(id = null, title = '', content = '') {
    document.getElementById('noteId').value = id || '';
    document.getElementById('noteTitle').value = title;
    document.getElementById('noteContent').value = content;
    document.getElementById('noteModalTitle').textContent = id ? 'Edit Note' : 'Add Note';

    const modal = new bootstrap.Modal(document.getElementById('noteModal'));
    modal.show();
}

function editNote(id, title, content) {
    openNoteModal(id, title, content);
}

async function saveNote() {
    const id = document.getElementById('noteId').value;
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;

    if (!title.trim()) {
        alert('Title is required');
        return;
    }

    try {
        const method = id ? 'PUT' : 'POST';
        const body = id ? { id, title, content } : { title, content };

        const res = await fetch('api/notes.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('noteModal')).hide();
            loadNotes();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Failed to save note');
    }
}

async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        const res = await fetch(`api/notes.php?id=${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (data.success) {
            loadNotes();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Failed to delete note');
    }
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}
