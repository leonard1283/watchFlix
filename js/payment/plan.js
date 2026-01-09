let toPayment = JSON.parse(localStorage.getItem("toPayment")) || [];

//plan config with days
const PLANS = {
    "Basic": {price: 169, days: 30},
    "Standard": {price: 676, days: 150},
    "Premium": {price: 1622, days: 365},
}

function addDays(days){
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString(); //safe format
}

function selectPlan(planName, price, days){
    const logUser = JSON.parse(sessionStorage.getItem("loginUser"));
    const userData = JSON.parse(localStorage.getItem("users")) || [];

    const user = userData.find(u => u.Email === logUser.Email);

    if(!user) {
        alert("User not found. Please login again.");
        location.href = "index.html";
        return;
    }

    //calculate expiration date
    const expirationDate = addDays(days);
    const today = new Date().toISOString();


    //push new localStorage
    toPayment.push({
        Email: user.Email,
        Plan: planName,
        Price: price,
        Days: days,
        ExpirationDate: expirationDate,
        Destination: "toPayment",
        Status: "Verifying"
    });

    localStorage.setItem("toPayment", JSON.stringify(toPayment));

    //Redirect to payment page with plan info
    sessionStorage.setItem("selectedPlan", JSON.stringify({
        plan: planName,
        price: price,
        days: days
    }));

    location.href = "/payment/payment.html";
}

//Initialize bbutton events on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log("Plan page load");
});












