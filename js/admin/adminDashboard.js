window.onload = function() {
    loadActivityLogs();
    updateDashboardStats(); // Add this line
};

function updateDashboardStats() {
    try {
        // Get data from localStorage
        const movies = JSON.parse(localStorage.getItem("movies")) || [];
        const users = JSON.parse(localStorage.getItem("users")) || [];

        let user = users.filter(u => u.Role === "User");
        // Calculate statistics
        const totalMovies = movies.length;
        const totalUsers = user.length;
        
        // Count users with Premium plan
        const premiumUsers = users.filter(user => user.Plan === "Premium" && user.Role !== "Admin").length;
        
        // Calculate revenue (Premium users × $895)
        const premiumPrice = 895;
        const totalRevenue = premiumUsers * premiumPrice;
        
        // Format numbers
        function formatNumber(num) {
            if (!Number.isFinite(num)) return "0";
            
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        }
        
        // Format currency
        function formatCurrency(amount) {
            if (!Number.isFinite(amount)) return "₱0";
            
            if (amount >= 1000000) {
                return '₱' + (amount / 1000000).toFixed(1) + 'M';
            } else if (amount >= 1000) {
                return '₱' + (amount / 1000).toFixed(1) + 'K';
            }
            return '₱' + amount.toFixed(2);
        }
        
        // Update the DOM
        document.getElementById("totalMovies").textContent = formatNumber(totalMovies);
        document.getElementById("totalUsers").textContent = formatNumber(totalUsers);
        document.getElementById("activeSubscriptions").textContent = formatNumber(premiumUsers);
        document.getElementById("totalRevenue").textContent = formatCurrency(totalRevenue);
        
    } catch (error) {
        console.error("Error updating dashboard stats:", error);
        // Set default values on error
        document.getElementById("totalMovies").textContent = "0";
        document.getElementById("totalUsers").textContent = "0";
        document.getElementById("activeSubscriptions").textContent = "0";
        document.getElementById("totalRevenue").textContent = "₱0";
    }
}

// Call this when page loads
updateDashboardStats();

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

function loadActivityLogs() {
    let logs = JSON.parse(localStorage.getItem("activityLogs")) || [];
    const container = document.getElementById("activityLogs");
  
    logs = logs.slice(-10).reverse(); // Show last 10, newest first
    container.innerHTML = "";
  
    // If no logs, show a message
    if (logs.length === 0) {
        container.innerHTML = `
            <div style="
                text-align: center;
                padding: 20px;
                color: #666;
                font-style: italic;
            ">
                No recent activity
            </div>
        `;
        return;
    }
  
    logs.forEach(log => {
        const icon = log.type === "subscribe" ? "⭐" : log.type === "verified" ? "✅" : log.type === "password_reset" ? "🔑" : "🆕";
        const bgColor = log.type === "subscribe" ? "#f0f7ff" : "#f7f7ff";
        
        container.innerHTML += `
            <div style="
                background: ${bgColor};
                padding: 12px 15px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 15px;
                transition: transform 0.2s;
                border-left: 4px solid ${log.type === "subscribe" ? "#667eea" : log.type === "verified" ? "#097923" : log.type ==="password_reset" ? "#553d40" : "#2ECC71"};
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 18px;">${icon}</span>
                    <span>${log.message}</span>
                </div>
                <small style="color: #666; font-size: 13px;">${log.date}</small>
            </div>
        `;
    });
}

function delLog(){
    localStorage.removeItem("activityLogs");

    location.reload();
}  