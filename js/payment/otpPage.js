function verifyUserOtp() {
    // Get all OTP inputs and combine their values
    const inputs = document.querySelectorAll(".otp-input");
    const otpValue = Array.from(inputs).map(input => input.value).join('');
    
    let userData = JSON.parse(localStorage.getItem("users")) || [];
    let paymentData = JSON.parse(localStorage.getItem("pendingPayments")) || [];
    let loginUser = JSON.parse(sessionStorage.getItem("loginUser")) || [];
    let logs = JSON.parse(localStorage.getItem("activityLogs")) || [];
    let toPaymentData = JSON.parse(localStorage.getItem("toPayment")) || [];
    
    // Find the user's payment data
    const payment = paymentData.find(p => p.Email === loginUser.Email);
    
    if (!payment) {
        alert("No payment found. Please start over.");
        clearData();
        location.href = "/payment/plan.html";
        return;
    }
    
    if (!payment.OTP) {
        alert("No OTP found. Please request a new one.");
        clearData();
        location.href = "/payment/payment.html";
        return;
    }
    
    if (Date.now() > Number(payment.expiredAt)) {
        alert("OTP expired. Request a new one.");
        clearData();
        location.href = "/payment/payment.html";
        return;
    }
    
    // Compare the entered OTP with the stored OTP
    if (String(otpValue) === String(payment.OTP)) {
        
        // Find user index
        const userIndex = userData.findIndex(u => u.Email === loginUser.Email);
        
        if (userIndex !== -1) {
            // Update user data with subscription info
            userData[userIndex].Plan = payment.Plan;
            userData[userIndex].SubscriptionStart = new Date().toISOString();
            userData[userIndex].SubscriptionEnd = payment.ExpirationDate;
            userData[userIndex].Days = payment.Days;
            userData[userIndex].LastPayment = payment.Amount;
            
            // Save updated user data
            localStorage.setItem("users", JSON.stringify(userData));
            
            // Update session storage
            loginUser.Plan = payment.Plan;
            loginUser.SubscriptionEnd = payment.ExpirationDate;
            sessionStorage.setItem("loginUser", JSON.stringify(loginUser));
            
            // Log the activity
            logs.push({
                type: "subscribe",
                message: `${userData[userIndex].Email} subscribed to ${payment.Plan} plan for ${payment.Days} days`,
                date: new Date().toLocaleString(),
                amount: payment.Amount
            });
            
            localStorage.setItem("activityLogs", JSON.stringify(logs));
            
            // Remove from pending payments and toPayment
            const updatedPayments = paymentData.filter(p => p.Email !== loginUser.Email);
            localStorage.setItem("pendingPayments", JSON.stringify(updatedPayments));
            
            const updatedToPayment = toPaymentData.filter(p => p.Email !== loginUser.Email);
            localStorage.setItem("toPayment", JSON.stringify(updatedToPayment));
            
            // Update XML
            updateUserPlan();
            
            location.href = "/payment/rcvMsg.html";
        } else {
            alert("User not found in database.");
        }
    } else {
        alert("Incorrect OTP");
    }
}

// Function to check subscription expiration
function checkSubscriptionExpiration() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const logs = JSON.parse(localStorage.getItem("activityLogs")) || [];
    const now = new Date();
    
    users.forEach((user, index) => {
        if (user.SubscriptionEnd && user.Plan !== "Free") {
            const expirationDate = new Date(user.SubscriptionEnd);
            
            if (now > expirationDate) {
                // Subscription expired
                users[index].Plan = "Free";
                users[index].Days = 0;
                users[index].SubscriptionEnd = null;
                
                // Log the expiration
                logs.push({
                    type: "subscription_expired",
                    message: `${user.Email}'s ${user.Plan} subscription has expired`,
                    date: now.toLocaleString()
                });
                
                console.log(`Subscription expired for ${user.Email}`);
            }
        }
    });
    
    // Save changes
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("activityLogs", JSON.stringify(logs));
    
    // Update session storage if current user's subscription expired
    const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    if (loginUser) {
        const currentUser = users.find(u => u.Email === loginUser.Email);
        if (currentUser && currentUser.Plan === "Free") {
            loginUser.Plan = "Free";
            sessionStorage.setItem("loginUser", JSON.stringify(loginUser));
        }
    }
}

function inputOtp() {
    const inputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendLink = document.querySelector('.resend-link a');
    let countdown = 25;

    // OTP Input functionality
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Only allow numbers
            const value = e.target.value;
            if (!/^\d*$/.test(value)) {
                e.target.value = '';
                return;
            }

            // Limit to 1 character
            if (value.length > 1) {
                e.target.value = value.slice(0, 1);
            }

            // Auto-focus next input
            if (value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            // Check if all inputs are filled
            checkAllFilled();
        });

        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
            
            for (let i = 0; i < pastedData.length && index + i < inputs.length; i++) {
                inputs[index + i].value = pastedData[i];
            }
            
            // Focus the next empty input or the last one
            const nextIndex = Math.min(index + pastedData.length, inputs.length - 1);
            inputs[nextIndex].focus();
            checkAllFilled();
        });
    });

    // Check if all inputs are filled
    function checkAllFilled() {
        const allFilled = Array.from(inputs).every(input => input.value.length === 1);
        verifyBtn.disabled = !allFilled;
        if (allFilled) {
            verifyBtn.classList.add('enabled');
        } else {
            verifyBtn.classList.remove('enabled');
        }
    }

    // Countdown timer for resend
    const timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            resendLink.textContent = `Resend in ${countdown}s`;
        } else {
            resendLink.textContent = 'Resend code';
            clearInterval(timer);
        }
    }, 1000);

    // Resend link click
    resendLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (countdown === 0) {
            countdown = 25;
            const newTimer = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    resendLink.textContent = `Resend in ${countdown}s`;
                } else {
                    resendLink.textContent = 'Resend code';
                    clearInterval(newTimer);
                }
            }, 1000);
        }
    });

    // Auto-focus first input
    if (inputs.length > 0) {
        inputs[0].focus();
    }
}



// Update the updateUserPlan function
function updateUserPlan() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    let xml = `<users>\n`;
    
    users.forEach(user => {
        xml += `  <user>\n`;
        xml += `    <FullName>${user.FullName}</FullName>\n`;
        xml += `    <Email>${user.Email}</Email>\n`;
        xml += `    <Password>${user.Password}</Password>\n`;
        xml += `    <Role>${user.Role}</Role>\n`;
        xml += `    <EmailStatus>${user.EmailStatus}</EmailStatus>\n`;
        xml += `    <Plan>${user.Plan || "Free"}</Plan>\n`;
        xml += `    <Days>${user.Days || 0}</Days>\n`;
        xml += `    <SubscriptionStart>${user.SubscriptionStart || ""}</SubscriptionStart>\n`;
        xml += `    <SubscriptionEnd>${user.SubscriptionEnd || ""}</SubscriptionEnd>\n`;
        xml += `  </user>\n`;
    });
    
    xml += `</users>`;
    
    localStorage.setItem("userXML", xml);
}

// Clear data function
function clearData() {
    const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    
    if (loginUser) {
        let paymentData = JSON.parse(localStorage.getItem("pendingPayments")) || [];
        let toPaymentData = JSON.parse(localStorage.getItem("toPayment")) || [];
        
        // Remove only the current user's data
        paymentData = paymentData.filter(p => p.Email !== loginUser.Email);
        toPaymentData = toPaymentData.filter(p => p.Email !== loginUser.Email);
        
        localStorage.setItem("pendingPayments", JSON.stringify(paymentData));
        localStorage.setItem("toPayment", JSON.stringify(toPaymentData));
    }
}
// Check subscription expiration on page load
document.addEventListener('DOMContentLoaded', function() {
    checkSubscriptionExpiration();
    inputOtp(); // Your existing OTP input handler
});