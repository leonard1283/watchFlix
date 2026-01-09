window.onload = function() {
    load();
}

function load(){
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const logIn = JSON.parse(sessionStorage.getItem("loginUser"));

    const user = users.find(u=> u.Email === logIn.Email);

    if(user){
        document.getElementById("name").value = user.FullName;
        document.getElementById("email").value = user.Email;
        document.getElementById("currentPassword").value = user.Password;
    }
}

async function hash(pass) {
    const msgUint8 = new TextEncoder().encode(pass);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

async function save() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const logIn = JSON.parse(sessionStorage.getItem("loginUser"));

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("new-password").value.trim();
    const confPassword = document.getElementById("confirm-password").value.trim();
    
    const localPassword = document.getElementById("currentPassword").value;
    const currPassowrd = document.getElementById("current-password").value;


    const userIndex = users.findIndex(u => u.Email === logIn.Email);
    const existEmail = users.find(u=> u.Email === email);

    if (userIndex === -1) {
        alert("User not found.");
        return;
    }



    const isPasswordEmpty = password === "" && confPassword === "";

    // ✅ Stop if passwords don't match
    if (!isPasswordEmpty && password !== confPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    if(existEmail){
        alert("Email Already Exist!");
        return;
    }

    // ✅ Update email in session if changed
    if (email !== users[userIndex].Email) {
        logIn.Email = email;
        sessionStorage.setItem("loginUser", JSON.stringify(logIn));
    }

    // ✅ Update basic fields
    users[userIndex].FullName = name;
    users[userIndex].Email = email;

    // ✅ Only hash & update password if user entered one
    if (!isPasswordEmpty) {
        const currentPass = await hash(currPassowrd);

        if(currentPass === localPassword){
            const newPassword = await hash(password);
            users[userIndex].Password = newPassword;
        }else{
            alert("Old Password Incorrect");
            return;
        }
    }

    // ✅ Save full users list back
    localStorage.setItem("users", JSON.stringify(users));

    alert("Profile Updated Successfully!");
    location.reload();
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