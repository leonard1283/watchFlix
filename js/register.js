window.onload = function() {
    const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));

    if(loginUser){
        const user = loginUser;

        if(user.Role !== "Admin"){
            
            location.href="dashboard.html";
        }else{
            location.href="admin/adminDashboard.html";
        }
    }
}

async function hash(pass) {
    const msgUint8 = new TextEncoder().encode(pass);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

async function register(){
    const FName = document.getElementById("FName").value;
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    const hashPass = await hash(pass);

    const users = JSON.parse(localStorage.getItem("users")) || [];
    let logs = JSON.parse(localStorage.getItem("activityLogs")) || [];

    if(users.some(u => u.Email == email)){
        alert("Email Already Exist!")
        return;
    }

    if(FName == ""){
        alert("Full name is required!")
        return; 
    }else if(email == ""){
        alert("email is Required!")
        return
    }else if(pass == ""){
        alert("password is required!")
        return;
    }

    users.push({
        FullName: FName,
        Email: email,
        Password: hashPass,
        Plan: "Free",
        EmailStatus: "Unverified",
        Role: "User"
    });

    logs.push({
        type: "register",
        message: `${email} successfully signed up`,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("activityLogs", JSON.stringify(logs))

    buildXML(users);

    localStorage.setItem("users", JSON.stringify(users))
    document.getElementById("success").showPopover();

    document.getElementById("closePop").addEventListener("click", () => {
        clearInputs();
        document.getElementById("success").hidePopover();
    });
}

function verify(){
    const email = document.getElementById("email").value;
    const name = document.getElementById("FName").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let currentEmail = users.find(u => u.Email === email && u.FullName === name);
    
    
    if(currentEmail){

        const loginUser = ({
        "loggedIn": "true",
        "Email": currentEmail.Email,
        "Plan": currentEmail.Plan,
        "emailStatus": currentEmail.EmailStatus,
        "Role": currentEmail.Role
    });

    sessionStorage.setItem("loginUser", JSON.stringify(loginUser));

    if(currentEmail.Role !== "Admin"){
        location.href="emailVerification/otpEmailInput.html";
    }
    }
}

function buildXML(users) {
    let xml = `<users>\n`;

    users.forEach(user => {
        xml += `  <user>\n`;
        xml += `    <FullName>${user.FullName}</FullName>\n`;
        xml += `    <Email>${user.Email}</Email>\n`;
        xml += `    <Password>${user.Password}</Password>\n`;
        xml += `    <Role>${user.Role}</Role>\n`;
        xml += `    <emailStatus>${user.EmailStatus}</emailStatus>\n`;
        xml += `    <Plan>${user.Plan || ""}</Plan>\n`;
        xml += `  </user>\n`;
    });

    xml += `</users>`;

    localStorage.setItem("userXML", xml);
}

function proceedDash(){
    const email = document.getElementById("email").value;
    const name = document.getElementById("FName").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let currentEmail = users.find(u => u.Email === email && u.FullName === name);
    
    
    if(currentEmail){

        const loginUser = ({
        "loggedIn": "true",
        "Email": currentEmail.Email,
        "Plan": currentEmail.Plan,
        "emailStatus": currentEmail.EmailStatus,
        "Role": currentEmail.Role
    });

    sessionStorage.setItem("loginUser", JSON.stringify(loginUser));

    if(currentEmail.Role !== "Admin"){
        location.href = "/dashboard.html";
    }
    }
}


function clearInputs() {
    document.getElementById('FName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}