const inputs = document.querySelectorAll(".otp-input");
const verifyBtn = document.getElementById("verifyBtn");
const resendLink = document.getElementById("resendLink");

const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));

window.onload = function(){
    sendOtpToEmail(loginUser.Email, generatedOTP);
}


if (!loginUser || !loginUser.Email) {
    alert("No user session found. Please login again.");
    location.href = "/index.html";
}

document.querySelector(".email").textContent = loginUser.Email;

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

let generatedOTP = generateOTP();
let canResend = true;
let resendTimer = 30; // 30 seconds cooldown

inputs.forEach((input, index) => {
    input.addEventListener("input", e => {
        const value = e.target.value;

        // Only digits allowed
        if (!/^\d*$/.test(value)) {
            e.target.value = "";
            return;
        }

        if (value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

        checkAllFilled();
    });

    input.addEventListener("keydown", e => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });

    input.addEventListener("paste", e => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "");

        for (let i = 0; i < pasted.length && index + i < inputs.length; i++) {
            inputs[index + i].value = pasted[i];
        }

        checkAllFilled();
        // Focus the next empty input or last input
        const nextIndex = Math.min(index + pasted.length, inputs.length - 1);
        inputs[nextIndex].focus();
    });
});

function checkAllFilled() {
    const allFilled = Array.from(inputs).every(i => i.value.length === 1);
    verifyBtn.disabled = !allFilled;

    if (allFilled) verifyBtn.classList.add("enabled");
    else verifyBtn.classList.remove("enabled");
}

inputs[0].focus();

verifyBtn.addEventListener("click", async () => {
    let verifying = JSON.parse(localStorage.getItem("Verifying")) || [];
    let userData = JSON.parse(localStorage.getItem("users")) || [];
    let logs = JSON.parse(localStorage.getItem("activityLogs")) || [];

    let toPaymentUser = verifying.find(u => u.Email === loginUser.Email && u.Destination === "toPayment");
    const userIndex = userData.findIndex(u => u.Email === loginUser.Email);

    if (!verifyBtn.classList.contains("enabled")) return;

    const enteredOTP = Array.from(inputs).map(input => input.value).join("");

    logs.push({
        type: "verified",
        message: `${userData[userIndex].Email} successfully verified their email`,
        date: new Date().toLocaleString()
    });
    
    if (enteredOTP === generatedOTP) {
        // Correct OTP
        verifyBtn.disabled = true;
        verifyBtn.textContent = "Verifying...";

        
        // Simulate verification process
        setTimeout(() => {
            
            // Store verification status
            loginUser.emailStatus = "Verified";
            sessionStorage.setItem("loginUser", JSON.stringify(loginUser));

            if (userIndex !== -1) {
                userData[userIndex].EmailStatus = "Verified";
                localStorage.setItem("users", JSON.stringify(userData));
            }

            // Payment or Dashboard
            if (toPaymentUser) {
                localStorage.removeItem("Verifying");
                localStorage.setItem("activityLogs", JSON.stringify(logs))
                location.href = "/payment/plan.html";
            } else {
                localStorage.removeItem("Verifying");
                localStorage.setItem("activityLogs", JSON.stringify(logs))
                location.href = "/dashboard.html";
            }
            
            
        }, 1000);
    } else {
        
        // Clear all inputs
        inputs.forEach(input => input.value = "");
        inputs[0].focus();
        checkAllFilled();

        document.getElementById('msgText').textContent = "Incorrect OTP. Please double-check and enter the correct code.";
        // Show the success message
        document.querySelector('.otpMsg .success').style.background = '#d70b0b';
        document.querySelector('.otpMsg .success').style.width = '30rem';
        document.getElementById('otpMessage').style.display = 'flex';
        
        // Add shake animation
        document.querySelector(".otp-container").style.animation = "shake 0.5s";
        setTimeout(() => {
            document.querySelector(".otp-container").style.animation = "";
        }, 500);
    }
});

// Add Enter key support
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && verifyBtn.classList.contains("enabled")) {
        verifyBtn.click();
    }
});

function updateResendTimer() {
    if (resendTimer > 0) {
        resendLink.textContent = `Resend (${resendTimer}s)`;
        resendLink.style.pointerEvents = "none";
        resendLink.style.color = "#aaa";
        resendTimer--;
        setTimeout(updateResendTimer, 1000);
    } else {
        resendLink.textContent = "Resend";
        resendLink.style.pointerEvents = "auto";
        resendLink.style.color = "#1a1a1a";
        canResend = true;
    }
}

updateResendTimer();

resendLink.addEventListener("click", async (e) => {
    e.preventDefault();
    
    if (!canResend) return;
    
    canResend = false;
    resendTimer = 30; // Reset to 30 seconds
    document.getElementById('msgText').textContent = "Resending verification code...";
    document.querySelector('.otpMsg .success').style.background = '#008000e0';
    document.querySelector('.otpMsg .success').style.width = '15rem';

    
    // Generate new OTP
    generatedOTP = generateOTP();
    
    // Send new OTP email

    await sendOtpToEmail(loginUser.Email, generatedOTP);
    
    // Clear inputs
    inputs.forEach(input => input.value = "");
    inputs[0].focus();
    checkAllFilled();
    
    updateResendTimer();
});

async function sendOtpToEmail(email, otp) {
    try {
        const res = await fetch("http://localhost:3000/verify-otp-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed sending email");
        }

        console.log("Email sent successfully!");
        // Show the success message
        document.getElementById('msgText').textContent = "A verification code has been sent to your email.";
        document.getElementById('otpMessage').style.display = 'flex';
        document.querySelector('.otpMsg .success').style.background = '#008000e0';
        document.querySelector('.otpMsg .success').style.width = '23rem';
        
        
        return true;
    } catch (err) {
        document.getElementById('msgText').textContent = "Failed to send verification code. Please try again.";
        // Show the success message
        document.querySelector('.otpMsg .success').style.background = '#d70b0b';
        document.querySelector('.otpMsg .success').style.width = '30rem';
        document.getElementById('otpMessage').style.display = 'flex';
        console.error("Email send error:", err);
        return false;
    }
}