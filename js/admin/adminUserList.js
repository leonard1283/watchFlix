window.onload = function() {
    const xmlString = localStorage.getItem("userXML");
    if (!xmlString) return;

    const users = parseXML(xmlString);
    renderUsers(users);
};

function parseXML() {
    const parser = new DOMParser();
    const xmlString = localStorage.getItem("userXML");
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const users = [...xmlDoc.getElementsByTagName("user")].map((u, index) => {
        return {
            id: index + 1,
            FullName: u.getElementsByTagName("FullName")[0].textContent,
            Email: u.getElementsByTagName("Email")[0].textContent,
            EmailStatus: u.getElementsByTagName("EmailStatus")[0].textContent,
            Role: u.getElementsByTagName("Role")[0].textContent,
            Plan: u.getElementsByTagName("Plan")[0].textContent,
        };
    });

    return users;
}

function renderUsers(users) {
    const tbody = document.querySelector("#userTable tbody");
    tbody.innerHTML = "";

    const sortedUsers = [...users].sort((a, b) => {
        if (a.Role === "Admin" && b.Role !== "Admin") return -1;
        if (a.Role !== "Admin" && b.Role === "Admin") return 1;
        return 0; // Keep original order for same roles
    });

    sortedUsers.forEach(user => {
        const btnUser = user.Role === "User" ? "visible" : "hidden";


        tbody.innerHTML += `
            <tr>
                <td>#${String(user.id).padStart(3, "0")}</td>
                <td>${user.FullName}</td>
                <td>${user.Email}</td>
                <td>${user.EmailStatus}</td>
                <td>${user.Plan}</td>
                <td>${user.Role}</td>
                <td style="visibility: ${btnUser};">
                    <button class="deleteBtn" onclick="deleteEdit('${user.Email}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

function deleteEdit(email){
    let usersData = JSON.parse(localStorage.getItem("users")) || [];
    let xmlString = localStorage.getItem("userXML");

    usersData = usersData.filter(u => u.Email !== email);

    // Parse XML string
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

     // Find the user element to delete
     const users = xmlDoc.getElementsByTagName("user");
     let userToDelete = null;

     // Find user by email
     for (let user of users) {
        const userEmail = user.getElementsByTagName("Email")[0]?.textContent;
        if (userEmail === email) {
            userToDelete = user;
            break;
        }
    }

    //Remove the user elemt
    userToDelete.parentNode.removeChild(userToDelete);

    // Convert back to string and save to localStorage
    const serializer = new XMLSerializer();
    const updatedXmlString = serializer.serializeToString(xmlDoc);

    localStorage.setItem("userXML", updatedXmlString);
    localStorage.setItem("users", JSON.stringify(usersData));

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