let visitorId,currentUser=null,currentTheme=localStorage.getItem("theme")||"dark";function toggleTheme(){currentTheme="dark"===currentTheme?"light":"dark",document.documentElement.setAttribute("data-theme",currentTheme),document.documentElement.setAttribute("data-bs-theme",currentTheme),localStorage.setItem("theme",currentTheme),document.getElementById("themeIcon").className="dark"===currentTheme?"fas fa-moon":"fas fa-sun"}function showRegister(){document.getElementById("app").innerHTML=`
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
    `}async function handleRegister(e){e.preventDefault();var e=document.getElementById("regName").value,t=document.getElementById("regEmail").value,a=document.getElementById("regPass").value;try{var n=await(await fetch("api/register.php",{method:"POST",headers:{"Content-Type":"application/json","X-Visitor-Id":visitorId},body:JSON.stringify({name:e,email:t,password:a})})).json();n.success?(alert("🎉 Vault Created Successfully! Please login."),location.reload()):alert("Error: "+n.message)}catch(e){console.error(e),alert("Network Error")}}function renderDashboard(e){document.getElementById("app").innerHTML=`
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="dashboard-header fade-in">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="fw-bold mb-1">Welcome back, <span style="color: var(--primary)">${e.name}</span></h2>
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
    `,loadNotes(),loadStats()}document.documentElement.setAttribute("data-theme",currentTheme),document.documentElement.setAttribute("data-bs-theme",currentTheme),(async()=>{var e=await(await FingerprintJS.load()).get();visitorId=e.visitorId,console.log("🔐 Device Signature:",visitorId)})(),document.getElementById("loginForm")?.addEventListener("submit",async e=>{e.preventDefault();var e=document.getElementById("email").value,t=document.getElementById("password").value,a=document.getElementById("loader");a.style.display="block";try{var n=await(await fetch("api/login.php",{method:"POST",headers:{"Content-Type":"application/json","X-Visitor-Id":visitorId},body:JSON.stringify({email:e,password:t})})).json();a.style.display="none",n.success?(currentUser=n.user,renderDashboard(n.user)):alert("Login Failed: "+n.message)}catch(e){a.style.display="none",console.error(e),alert("Network Error")}});let currentFilter=null;async function loadNotes(t=null,a=null){try{let e="api/notes.php";var n=new URLSearchParams;t&&n.append("search",t),a&&n.append("tag",a),n.toString()&&(e+="?"+n.toString());var s=await(await fetch(e)).json(),o=document.getElementById("notesContainer");s.success?0===s.data.length?o.innerHTML=`
                <div class="col-12 text-center text-muted py-5">
                    <i class="fas fa-vault fa-3x mb-3" style="opacity: 0.3;"></i>
                    <p>Your vault is empty. Add your first note!</p>
                </div>
            `:o.innerHTML=s.data.map(e=>`
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="tag tag-${e.tag}">${getTagEmoji(e.tag)} ${capitalize(e.tag)}</span>
                            ${e.is_encrypted?'<span class="encrypted-badge"><i class="fas fa-lock me-1"></i>Encrypted</span>':""}
                        </div>
                        <h5 class="card-title mt-2">${escapeHtml(e.title)}</h5>
                        <p class="card-text text-muted small">${escapeHtml(e.content.substring(0,120))}${120<e.content.length?"...":""}</p>
                    </div>
                    <div class="card-footer bg-transparent border-secondary d-flex justify-content-between align-items-center">
                        <small class="text-muted"><i class="fas fa-clock me-1"></i>${e.created_at}</small>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editNote('${e.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteNote('${e.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join(""):o.innerHTML=`<div class="col-12 text-center text-danger">${s.message}</div>`}catch(e){console.error(e),document.getElementById("notesContainer").innerHTML='<div class="col-12 text-center text-danger">Failed to load notes</div>'}}async function loadStats(){try{var e=await(await fetch("api/notes.php?action=stats")).json();e.success&&(document.getElementById("totalNotes").textContent=e.data.total)}catch(e){console.error(e)}}function filterNotes(e,t){currentFilter=e,document.querySelectorAll(".btn-group .btn").forEach(e=>e.classList.remove("active")),t.classList.add("active"),loadNotes(null,e)}let searchTimeout;function searchNotes(e){clearTimeout(searchTimeout),searchTimeout=setTimeout(()=>{loadNotes(e,currentFilter)},300)}function openNoteModal(e=null){document.getElementById("noteId").value=e||"",document.getElementById("noteTitle").value="",document.getElementById("noteContent").value="",document.getElementById("noteTag").value="personal",document.getElementById("noteModalTitle").innerHTML=e?'<i class="fas fa-edit me-2"></i>Edit Note':'<i class="fas fa-plus me-2"></i>Add Note',new bootstrap.Modal(document.getElementById("noteModal")).show()}async function editNote(e){try{var t,a=await(await fetch("api/notes.php?action=single&id="+e)).json();a.success&&(t=a.data,document.getElementById("noteId").value=t.id,document.getElementById("noteTitle").value=t.title,document.getElementById("noteContent").value=t.content,document.getElementById("noteTag").value=t.tag,document.getElementById("noteModalTitle").innerHTML='<i class="fas fa-edit me-2"></i>Edit Note',new bootstrap.Modal(document.getElementById("noteModal")).show())}catch(e){console.error(e),alert("Failed to load note")}}async function saveNote(){var e=document.getElementById("noteId").value,t=document.getElementById("noteTitle").value,a=document.getElementById("noteContent").value,n=document.getElementById("noteTag").value;if(t.trim())try{var s=e?{id:e,title:t,content:a,tag:n}:{title:t,content:a,tag:n},o=await(await fetch("api/notes.php",{method:e?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})).json();o.success?(bootstrap.Modal.getInstance(document.getElementById("noteModal")).hide(),loadNotes(null,currentFilter),loadStats()):alert("Error: "+o.message)}catch(e){console.error(e),alert("Failed to save note")}else alert("Title is required")}async function deleteNote(e){if(confirm("⚠️ Are you sure you want to delete this note?"))try{var t=await(await fetch("api/notes.php?id="+e,{method:"DELETE"})).json();t.success?(loadNotes(null,currentFilter),loadStats()):alert("Error: "+t.message)}catch(e){console.error(e),alert("Failed to delete note")}}async function showActivity(){try{var e=await(await fetch("api/notes.php?action=activity")).json(),t=document.getElementById("activityContent");e.success&&0<e.data.length?t.innerHTML=e.data.map(e=>`
                <div class="activity-item">
                    <strong>${formatAction(e.action)}</strong>
                    <p class="mb-0 small text-muted">${e.details}</p>
                    <small class="text-muted">${e.timestamp}</small>
                </div>
            `).join(""):t.innerHTML='<p class="text-muted text-center">No activity yet</p>',new bootstrap.Modal(document.getElementById("activityModal")).show()}catch(e){console.error(e)}}async function exportNotes(){try{var e,t,a,n=await(await fetch("api/notes.php?action=export")).json();n.success&&(e=new Blob([JSON.stringify(n.data,null,2)],{type:"application/json"}),t=URL.createObjectURL(e),(a=document.createElement("a")).href=t,a.download="nexus_vault_export.json",a.click(),URL.revokeObjectURL(t))}catch(e){console.error(e),alert("Failed to export")}}function escapeHtml(e){var t=document.createElement("div");return t.textContent=e||"",t.innerHTML}function getTagEmoji(e){return{work:"🔵",personal:"🟢",important:"🔴",idea:"🟡"}[e]||"⚪"}function capitalize(e){return e.charAt(0).toUpperCase()+e.slice(1)}function formatAction(e){return{note_created:"📝 Note Created",note_updated:"✏️ Note Updated",note_deleted:"🗑️ Note Deleted",notes_exported:"📤 Notes Exported",login:"🔓 Login"}[e]||e}