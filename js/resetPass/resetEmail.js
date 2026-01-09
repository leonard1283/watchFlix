function sendOtp(){
    const email = document.getElementById("email").value;

    // Check if email exists in users
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = users.some(user => user.Email === email);
    
    if (!userExists) {
        alert("No account found with this email.");
        return;
    }

    // Store as OBJECT, not array
    const resetData = {
        Email: email
    };

    localStorage.setItem("resetPassword", JSON.stringify(resetData));

    location.href="/resetPass/resetOtpInput.html";
}