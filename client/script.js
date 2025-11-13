const BACKEND_URL = "https://two-rupeee-6.onrender.com";

const amountEl = document.getElementById("amount");
const userNameEl = document.getElementById("userName");
const userPhoneEl = document.getElementById("userPhone");
const payBtn = document.getElementById("payBtn");
const errorEl = document.getElementById("error");

window.addEventListener("DOMContentLoaded", () => {
  fetchStats();
  document.getElementById("countHidden").classList.remove("revealed");
  document.getElementById("totalAmount").classList.remove("revealed");
});

function validate() {
  const amount = parseInt(amountEl.value) || 0;
  const name = userNameEl.value.trim();
  const phone = userPhoneEl.value.trim();
  const phoneDigits = phone.replace(/\D/g, "");
  return amount >= 2 && name.length >= 3 && phoneDigits.length === 10;
}

function togglePayButton() {
  if (validate()) {
    payBtn.classList.add("enabled");
    payBtn.disabled = false;
    errorEl.style.display = "none";
  } else {
    payBtn.classList.remove("enabled");
    payBtn.disabled = true;
  }
}

amountEl.addEventListener("input", togglePayButton);
userNameEl.addEventListener("input", togglePayButton);
userPhoneEl.addEventListener("input", togglePayButton);

const countEl = document.querySelector(".sent-count");
const totalAmountEl = document.getElementById("totalAmount");

async function fetchStats(show) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/payment/get-count`);
    const data = await res.json();

    if (!show) {
      countEl.textContent = "??";
      totalAmountEl.textContent = "₹??";
    } else {
      countEl.textContent = data.totalCount || 0;
      totalAmountEl.textContent = `₹${data.totalAmount || 0}`;
    }

    
    if (data.topUsers && data.topUsers.length > 0) {
      const leaderboardUL = document.querySelector(".leaderboard ul");
      leaderboardUL.innerHTML = "";
      data.topUsers.forEach((user) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="entry">
            <div class="amount"><span class="name">Paid amount:</span> ₹${user.amount}</div>
            <div class="name">Name: <span style="color:#D2AC47;">${user.name}</span></div>
          </div>`;
        leaderboardUL.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
}

function updateUI(data) {
  if (!data) return;
  document.getElementById("countHidden").classList.add("revealed");
  document.getElementById("totalAmount").classList.add("revealed");
  countEl.textContent = data.totalCount ?? 0;
  totalAmountEl.textContent = `₹${data.totalAmount ?? 0}`;
  if (data.topUsers && data.topUsers.length > 0) {
    const leaderboardUL = document.querySelector(".leaderboard ul");
    leaderboardUL.innerHTML = "";
    data.topUsers.forEach((user) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="entry">
          <div class="amount"><span class="name">Paid amount:</span> ₹${user.amount}</div>
          <div class="name">Name: <span style="color:#D2AC47;">${user.name}</span></div>
        </div>`;
      leaderboardUL.appendChild(li);
    });
  }
}


payBtn.addEventListener("click", async function () {
  const amountRupees = parseInt(amountEl.value);
  const name = userNameEl.value.trim();
  const phone = userPhoneEl.value.trim().replace(/\D/g, "").slice(-10);

  try {
    
    const orderRes = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountRupees }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.message);

 
    const options = {
      key: orderData.key, 
      amount: amountRupees * 100,
      currency: "INR",
      name: "TwoRupee",
      description: `Pay ₹${amountRupees} to join`,
      order_id: orderData.id,
      prefill: { name, contact: phone },
      theme: { color: "#333333ff" },
      handler: async function (response) {
       
        const verifyRes = await fetch(`${BACKEND_URL}/api/payment/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            amount: amountRupees,
            name,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          updateUI(verifyData);
        } else {
          alert("❌ Payment verification failed.");
        }
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment Error:", err);
    alert("Something went wrong. Please try again.");
  }
});
