const apiBaseUrl = "http://127.0.0.1:8000/api/";

document.addEventListener("DOMContentLoaded", function () {
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");

    if (forgotPasswordForm) {
        console.log(" Forgot Password form loaded!");

        forgotPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();

            try {
                const response = await fetch(`${apiBaseUrl}request-password-reset/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Password reset link sent!  Check your email.");
                    window.location.href = "/sign_in.html";
                } else {
                    alert(data.error || "Error sending reset link.");
                }
            } catch (error) {
                console.error(" Network Error:", error);
            }
        });
    }
});
