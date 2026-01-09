async function hash(pass) {
    const msgUint8 = new TextEncoder().encode(pass);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

async function resetPassword(){
    const newPass = document.getElementById("newPass").value;
    const coNewPass = document.getElementById("coNewPass").value;
    
    // Get user data and reset data
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const resetData = JSON.parse(localStorage.getItem("resetPassword")) || {};
    let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    
    // Get the email from reset data
    const email = resetData.Email;
    
    // Check if passwords match
    if (newPass !== coNewPass) {
        alert("Passwords do not match.");
        return;
    }
    
    // Check if password is at least 6 characters
    if (newPass.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }
    
    // Find the user index
    const userIndex = users.findIndex(u => u.Email === email);
    
    if (userIndex === -1) {
        location.href = "/resetPass/emailInput.html";
        return;
    }
    
    try {
        // Hash the new password (using your existing hash function)
        const hashPass = await hash(newPass);
        
        // Update the user's password
        users[userIndex].Password = hashPass;
        
        // Save updated users back to localStorage
        localStorage.setItem("users", JSON.stringify(users));
        
        // Clear reset data from localStorage
        localStorage.removeItem("resetPassword");
        
        // Show success message
        alert("Password reset successfully! Redirecting to dashboard...");
        
        // Add to activity logs
        const logs = JSON.parse(localStorage.getItem("activityLogs")) || [];
        logs.push({
            type: "password_reset",
            message: `${email} reset their password`,
            date: new Date().toLocaleString()
        });
        localStorage.setItem("activityLogs", JSON.stringify(logs));
        
        // Redirect to dashboard
        setTimeout(() => {

            const login = ({
                "loggedIn": "true",
                "Email": users[userIndex].Email,
                "emailStatus": users[userIndex].EmailStatus,
                "Plan": users[userIndex].Plan,
                "Role": users[userIndex].Role

            });

            sessionStorage.setItem("loginUser", JSON.stringify(login));

            location.href = "/dashboard.html";
        }, 1000);
        
    } catch (error) {
        console.error("Error resetting password:", error);
        alert("An error occurred. Please try again.");
    }
}