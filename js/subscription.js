// subscription.js - Always running version

// ============================================
// ALWAYS RUN IMMEDIATELY (No DOM waiting)
// ============================================

// Run subscription checker immediately
(function initializeImmediately() {
    console.log("Subscription checker initialized");
    
    // Start the checking loop
    initializeSubscriptionChecker();
    
    // Also run once immediately
    checkSubscriptionExpiration();
})();

// ============================================
// ALSO run when DOM is ready (for any UI updates)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - updating subscription display");
    // Optional: Update any UI elements here
});

// ============================================
// ALSO run on window load (just in case)
// ============================================
window.addEventListener('load', function() {
    console.log("Page fully loaded - final subscription check");
    checkSubscriptionExpiration();
});

// ============================================
// ALSO run when page becomes visible (user returns to tab)
// ============================================
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log("Page visible again - checking subscription");
        checkSubscriptionExpiration();
    }
});

// ============================================
// ALSO keep checking even if user stays on same page
// ============================================

// Main initialization
function initializeSubscriptionChecker() {
    console.log("Starting subscription checker loop");
    
    // Check every 5 seconds for real-time updates
    const intervalId = setInterval(checkSubscriptionExpiration, 5000);
    
    // Also run immediately
    checkSubscriptionExpiration();
    
    // Store interval ID in case we need to stop it
    window.subscriptionIntervalId = intervalId;
    
    return intervalId;
}

// Rest of your functions remain the same...
function checkSubscriptionExpiration() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const now = new Date();
    let changesMade = false;
    
    users.forEach((user, index) => {
        if (user.Plan === "Free") return;
        
        if (user.SubscriptionStart) {
            const startDate = new Date(user.SubscriptionStart);
            const timeDiff = now - startDate;
            const daysPassed = timeDiff / (1000 * 60 * 60 * 24);
            const planDays = getPlanDays(user.Plan);
            const remainingDays = Math.max(0, Math.floor(planDays - daysPassed));
            
            // Update if changed
            if (user.Days !== remainingDays) {
                users[index].Days = remainingDays;
                changesMade = true;
                console.log(`${user.Email}: ${remainingDays} days`);
            }
            
            // Check expiration
            if (remainingDays === 0 && user.Plan !== "Free") {
                users[index].Plan = "Free";
                users[index].Days = 0;
                changesMade = true;
                console.log(`${user.Email} expired -> Free`);
            }
        }
    });
    
    if (changesMade) {
        localStorage.setItem("users", JSON.stringify(users));
    }
}

// Helper functions...
function getPlanDays(plan) {
    return { "Basic": 30, "Standard": 150, "Premium": 365 }[plan] || 0;
}

function updateUserSubscription(email, plan, amount) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.Email === email);
    
    if (userIndex !== -1) {
        const now = new Date();
        const days = getPlanDays(plan);
        
        users[userIndex].Plan = plan;
        users[userIndex].SubscriptionStart = now.toISOString();
        users[userIndex].Days = days;
        users[userIndex].LastPayment = amount;
        
        localStorage.setItem("users", JSON.stringify(users));
        
        // Update session
        const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        if (loginUser && loginUser.Email === email) {
            loginUser.Plan = plan;
            sessionStorage.setItem("loginUser", JSON.stringify(loginUser));
        }
        
        return true;
    }
    
    return false;
}

// Make functions available globally
window.updateUserSubscription = updateUserSubscription;
window.checkSubscriptionExpiration = checkSubscriptionExpiration;

// ============================================
// EXTRA: Run on page navigation (Single Page Apps)
// ============================================
if (window.history && window.history.pushState) {
    // Override pushState to detect navigation
    const originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(this, arguments);
        setTimeout(checkSubscriptionExpiration, 100);
    };
    
    // Also on popstate (back/forward)
    window.addEventListener('popstate', function() {
        setTimeout(checkSubscriptionExpiration, 100);
    });
}