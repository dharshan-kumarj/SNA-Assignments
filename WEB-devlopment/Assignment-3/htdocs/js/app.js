let visitorId,currentUser=null;function showRegister(){document.getElementById("app").innerHTML=`
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
    `}async function handleRegister(t){t.preventDefault();var t=document.getElementById("regName").value,a=document.getElementById("regEmail").value,o=document.getElementById("regPass").value;try{var s=await(await fetch("api/register.php",{method:"POST",headers:{"Content-Type":"application/json","X-Visitor-Id":visitorId},body:JSON.stringify({name:t,email:a,password:o})})).text();let e;try{e=JSON.parse(s)}catch(e){return console.error("Server Error HTML:",s),void alert("Server Error: Check console for details.")}e.success?(alert("Registration Successful! Please Login."),location.reload()):alert("Error: "+e.message)}catch(e){console.error(e),alert("Network Error")}}function renderDashboard(e){document.getElementById("app").innerHTML=`
        <div class="dashboard-header fade-in">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h1 class="display-4 fw-bold">Hello, <span style="color: var(--primary)">${e.name}</span></h1>
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
    `,loadNotes()}async function loadNotes(){try{var e=await(await fetch("api/notes.php")).json(),t=document.getElementById("notesContainer");e.success?0===e.data.length?t.innerHTML=`
                <div class="col-12 text-center text-muted py-5">
                    <i class="fas fa-folder-open fa-3x mb-3" style="opacity: 0.3;"></i>
                    <p>No notes yet. Create your first note!</p>
                </div>
            `:t.innerHTML=e.data.map(e=>`
            <div class="col-md-4 mb-4">
                <div class="card bg-dark border-secondary h-100">
                    <div class="card-body">
                        <h5 class="card-title">${escapeHtml(e.title)}</h5>
                        <p class="card-text text-muted small">${escapeHtml(e.content.substring(0,100))}${100<e.content.length?"...":""}</p>
                        <p class="text-muted small mb-0"><i class="fas fa-clock me-1"></i>${e.created_at}</p>
                    </div>
                    <div class="card-footer bg-transparent border-secondary">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editNote('${e.id}', '${escapeHtml(e.title)}', '${escapeHtml(e.content)}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteNote('${e.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join(""):t.innerHTML=`<div class="col-12 text-center text-danger">${e.message}</div>`}catch(e){console.error(e),document.getElementById("notesContainer").innerHTML='<div class="col-12 text-center text-danger">Failed to load notes</div>'}}function openNoteModal(e=null,t="",a=""){document.getElementById("noteId").value=e||"",document.getElementById("noteTitle").value=t,document.getElementById("noteContent").value=a,document.getElementById("noteModalTitle").textContent=e?"Edit Note":"Add Note",new bootstrap.Modal(document.getElementById("noteModal")).show()}function editNote(e,t,a){openNoteModal(e,t,a)}async function saveNote(){var e=document.getElementById("noteId").value,t=document.getElementById("noteTitle").value,a=document.getElementById("noteContent").value;if(t.trim())try{var o=e?{id:e,title:t,content:a}:{title:t,content:a},s=await(await fetch("api/notes.php",{method:e?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})).json();s.success?(bootstrap.Modal.getInstance(document.getElementById("noteModal")).hide(),loadNotes()):alert("Error: "+s.message)}catch(e){console.error(e),alert("Failed to save note")}else alert("Title is required")}async function deleteNote(e){if(confirm("Are you sure you want to delete this note?"))try{var t=await(await fetch("api/notes.php?id="+e,{method:"DELETE"})).json();t.success?loadNotes():alert("Error: "+t.message)}catch(e){console.error(e),alert("Failed to delete note")}}function escapeHtml(e){var t=document.createElement("div");return t.textContent=e||"",t.innerHTML}(async()=>{var e=await(await FingerprintJS.load()).get();visitorId=e.visitorId,console.log("Device Signature:",visitorId)})(),document.getElementById("loginForm")?.addEventListener("submit",async t=>{t.preventDefault();var t=document.getElementById("email").value,a=document.getElementById("password").value,o=document.getElementById("loader");o.style.display="block";try{var s=await(await fetch("api/login.php",{method:"POST",headers:{"Content-Type":"application/json","X-Visitor-Id":visitorId},body:JSON.stringify({email:t,password:a})})).text();let e;try{e=JSON.parse(s)}catch(e){return console.error("Server Error HTML:",s),alert("Server Error: Check console for details."),void(o.style.display="none")}o.style.display="none",e.success?(currentUser=e.user,renderDashboard(e.user)):alert("Login Failed: "+e.message)}catch(e){o.style.display="none",console.error(e),alert("Network Error")}});