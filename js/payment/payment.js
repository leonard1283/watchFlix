function backDash(){
    location.href="dashboard.html";
}

function logOut(){
    sessionStorage.clear();
    location.href="index.html";

}

function sendOtp(){
    const pendingPayments = JSON.parse(localStorage.getItem("pendingPayments")) || [];
    const user = JSON.parse(sessionStorage.getItem("loginUser")) || [];
    const selectedPlan = JSON.parse(sessionStorage.getItem("selectedPlan"));
    const toPaymentData = JSON.parse(sessionStorage.getItem("toPayment")) || [];
    const phoneInput = document.querySelector(".mobile-input");
    const mobile = phoneInput.value.trim();

    const existEmail = pendingPayments.some(p => p.Email === email);

    //get amount from selected plan
    const amountElement = document.querySelector(".amount");
    if (selectedPlan && amountElement){
        amountElement.textContent = `PHP ${selectedPlan.price.toFixed(2)}`;
    }


    if(existEmail){
        alert("Please wait for the previous payment to be processed.");
        return;
    }

    if (mobile.length !== 10) {
        alert("Please enter a valid 10-digit number.");
        return;
    }

    //Generate OTP
    const session = createTimedOTP({ length: 6, ttlMs: 120000 });

    console.log("Generated OTP:", session.otp);

    //get plan info from toPayment
    const currentPlan = toPaymentData.find(p => p.Email === user.Email);

    //save payment info
    pendingPayments.push({
        "Email": user.Email,
        "EmailStatus": user.emailStatus,
        "PhoneNumber": mobile,
        "OTP": session.otp,
        "Status": "Pending",  
        "expiredAt": session.expiresAt,      
        "Plan": currentPlan?.Plan || "Basic",
        "Days": currentPlan?.Days || 30,
        "ExpirationDate": currentPlan?.ExpirationDate,
        "Amount": currentPlan?.Price || 169,
        "expiredAt": session.expiresAt
    });

    createTimedOTP();
    
    localStorage.setItem("pendingPayments", JSON.stringify(pendingPayments));

    location.href = "/payment/otpPage.html";
}


function generateOTP(length = 6) {
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(n => n % 10).join('');
}

function createTimedOTP({ length = 6, ttlMs = 120000 } = {}) {
    const otp = generateOTP(length);
    const expiresAt = Date.now() + ttlMs;

    return {
        otp,
        expiresAt,
        verify(input) {
            if (Date.now() > expiresAt) return { ok: false, reason: "expired" };
            return { ok: String(input) === String(otp), reason: String(input) === String(otp) ? "match" : "mismatch" };
        }
    };
}