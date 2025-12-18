let visitorId;function showRegister(){document.getElementById("app").innerHTML=`
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
                        <input type="text" class="form-control border-start-0 ps-0" id="regName" placeholder="John Doe" required>
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
                        <input type="password" class="form-control border-start-0 ps-0" id="regPass" placeholder="••••••••" required>
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
    `}async function handleRegister(a){a.preventDefault();var a=document.getElementById("regName").value,s=document.getElementById("regEmail").value,r=document.getElementById("regPass").value;try{var t=await(await fetch("api/register.php",{method:"POST",headers:{"Content-Type":"application/json","X-Visitor-Id":visitorId},body:JSON.stringify({name:a,email:s,password:r})})).text();let e;try{e=JSON.parse(t)}catch(e){return console.error("Server Error HTML:",t),void alert("Server Error: Check console for details.")}e.success?(alert("Registration Successful! Please Login."),location.reload()):alert("Error: "+e.message)}catch(e){console.error(e),alert("Network Error")}}function renderDashboard(e){document.getElementById("app").innerHTML=`
        <div class="dashboard-header fade-in">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h1 class="display-4 fw-bold">Hello, <span style="color: var(--primary)">${e.name}</span></h1>
                    <p class="text-muted lead">Welcome to your secure dashboard.</p>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-outline-danger" onclick="location.reload()">Logout</button>
                </div>
            </div>
        </div>
        
        <div class="row fade-in">
            <div class="col-md-4">
                <div class="p-4 rounded-4" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                    <h4><i class="fas fa-chart-line me-2" style="color: #3b82f6"></i> Activity</h4>
                    <p class="text-muted mt-2">No recent activity detected on your account.</p>
                </div>
            </div>
            <div class="col-md-4">
                 <div class="p-4 rounded-4" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                    <h4><i class="fas fa-shield-cat me-2" style="color: #10b981"></i> Security</h4>
                    <p class="text-muted mt-2">Your session is secured with FingerprintJS.</p>
                </div>
            </div>
             <div class="col-md-4">
                 <div class="p-4 rounded-4" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                    <h4><i class="fas fa-envelope me-2" style="color: #ec4899"></i> Messages</h4>
                    <p class="text-muted mt-2">You have 0 new messages.</p>
                </div>
            </div>
        </div>
    `}(async()=>{var e=await(await FingerprintJS.load()).get();visitorId=e.visitorId,console.log("Device Signature:",visitorId)})(),document.getElementById("loginForm")?.addEventListener("submit",async a=>{a.preventDefault();var a=document.getElementById("email").value,s=document.getElementById("password").value,r=document.getElementById("loader");r.style.display="block";try{var t=await(await fetch("api/login.php",{method:"POST",headers:{"Content-Type":"application/json","X-Visitor-Id":visitorId},body:JSON.stringify({email:a,password:s})})).text();let e;try{e=JSON.parse(t)}catch(e){return console.error("Server Error HTML:",t),alert("Server Error: Check console for details."),void(r.style.display="none")}r.style.display="none",e.success?renderDashboard(e.user):alert("Login Failed: "+e.message)}catch(e){r.style.display="none",console.error(e),alert("Network Error")}});