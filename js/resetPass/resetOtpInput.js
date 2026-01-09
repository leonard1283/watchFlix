const inputs = document.querySelectorAll(".otp-input");
const verifyBtn = document.getElementById("verifyBtn");
const resendLink = document.getElementById("resendLink");

// Get reset data - now it's an object, not array
const resetData = JSON.parse(localStorage.getItem("resetPassword")) || {};

// Send OTP when page loads
window.onload = function(){
    sendOtpToEmail(email, generatedOTP);
    updateResendTimer();
}

// Get email from resetData
const email = resetData.Email;

// If no reset email, go back
if (!email) {
    location.href = "/resetPass/emailInput.html";
}

document.querySelector(".email").textContent = email;

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

let resendTimer = 30;
let canResend = false;
let generatedOTP = generateOTP();

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

// ✅ Verify OTP
verifyBtn.addEventListener("click", async () => {
    // Get user data
    const userData = JSON.parse(localStorage.getItem("users")) || [];
    
    if (!verifyBtn.classList.contains("enabled")) return;

    const enteredOTP = [...inputs].map(input => input.value).join("");

    if (enteredOTP === generatedOTP) {
        // Correct OTP
        verifyBtn.disabled = true;
        verifyBtn.textContent = "Verifying...";

        // Simulate verification process
        setTimeout(() => {
            // Update resetPassword with OTP verification status
            const updatedResetData = {
                ...resetData,
                otp: enteredOTP,
            };
            
            localStorage.setItem("resetPassword", JSON.stringify(updatedResetData));

            // Show success message
            showSuccess("OTP verified! Redirecting...");

            // Redirect to new password page
            setTimeout(() => {
                location.href = "/resetPass/newPassword.html";
            }, 1000);
            
        }, 1000);
    } else {
        // Clear all inputs
        inputs.forEach(input => input.value = "");
        inputs[0].focus();
        checkAllFilled();

        showError("Incorrect OTP. Please double-check and enter the correct code.");
        
        // Add shake animation
        document.querySelector(".otp-container").style.animation = "shake 0.5s";
        setTimeout(() => {
            document.querySelector(".otp-container").style.animation = "";
        }, 500);
    }
});

// ✅ Enter key support
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && verifyBtn.classList.contains("enabled")) {
        verifyBtn.click();
    }
});

// ✅ Clear OTP inputs
function clearInputs() {
    inputs.forEach(input => input.value = "");
    inputs[0].focus();
    checkAllFilled();

    // Shake animation
    document.querySelector(".otp-container").style.animation = "shake 0.5s";
    setTimeout(() => {
        document.querySelector(".otp-container").style.animation = "";
    }, 500);
}

// ✅ Show messages
function showError(msg) {
    const box = document.querySelector(".otpMsg .success");
    const msgText = document.getElementById("msgText");
    const otpMessage = document.getElementById("otpMessage");
    
    if (box && msgText && otpMessage) {
        msgText.textContent = msg;
        box.style.background = "#d70b0b";
        box.style.width = "30rem";
        otpMessage.style.display = "flex";
        
        // Auto-hide error after 3 seconds
        setTimeout(() => {
            otpMessage.style.display = "none";
        }, 3000);
    }
}

function showSuccess(msg) {
    const box = document.querySelector(".otpMsg .success");
    const msgText = document.getElementById("msgText");
    const otpMessage = document.getElementById("otpMessage");
    
    if (box && msgText && otpMessage) {
        msgText.textContent = msg;
        box.style.background = "#008000e0";
        box.style.width = "25rem";
        otpMessage.style.display = "flex";
    }
}

// ✅ Resend Timer
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

// ✅ Resend OTP
resendLink.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!canResend) return;

    canResend = false;
    resendTimer = 30;
    
    // Generate new OTP
    generatedOTP = generateOTP();
    
    showSuccess("Sending new code...");
    await sendOtpToEmail(email, generatedOTP);

    clearInputs();
    updateResendTimer();
});

// ✅ Send OTP to Backend
async function sendOtpToEmail(email, otp) {
    try {
        const response = await fetch("http://localhost:3000/reset-otp-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });
        
        if (!response.ok) {
            throw new Error("Failed to send OTP");
        }
        
        showSuccess("Reset password code has been sent to your email.");
        return true;
    } catch (err) {
        showError("Failed to send code. Please try again.");
        console.error("Email send error:", err);
        return false;
    }
}