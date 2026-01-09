async function register(){
    const FName = document.getElementById("FName").value;
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    const hashPass = await hash(pass);

    const users = JSON.parse(localStorage.getItem("users")) || [];

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
        Plan: "Premium",
        EmailStatus: "Verified",
        Role: "Admin"
    });


    buildXML(users);
    alert("Admin Account Successfully Added.")
    localStorage.setItem("users", JSON.stringify(users))
    location.reload();

}


async function hash(pass) {
    const msgUint8 = new TextEncoder().encode(pass);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
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

function btnDashboard(){
    location.href="/admin/adminDashboard.html";
}

function btnMovieList(){
    location.href="/admin/adminMoviesList.html";
}

function btnUsersList(){
    location.href="/admin/adminUserList.html";
}

function adminAccount(){
    location.href="/admin/adminAccount.html";
}

function addAdmin(){
    location.href="/admin/addAdmin.html";
}

function logout(){
    sessionStorage.clear();
    location.href="/index.html";
}