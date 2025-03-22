const apiBaseUrl = "http://127.0.0.1:8000/api/";

document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        console.log("✅ Signup form loaded!");

        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("signupUsername").value.trim();
            const email = document.getElementById("signupEmail").value.trim();
            const password = document.getElementById("signupPassword").value.trim();

            try {
                const response = await fetch(`${apiBaseUrl}register/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Signup successful! Please log in.");
                    window.location.href = "/sign_in.html";
                } else {
                    alert(`Signup failed: ${JSON.stringify(data)}`);
                }
            } catch (error) {
                console.error("Error signing up:", error);
            }
        });
    }
});
