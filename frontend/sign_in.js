const apiBaseUrl = "http://127.0.0.1:8000/api/";
const loginForm = document.getElementById("loginForm");

document.addEventListener("DOMContentLoaded", function () {
    if (loginForm) {
        console.log(" Login form loaded!");

        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault(); //  Prevent form refresh

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            if (!username || !password) {
                alert("Please enter both username and password.");
                return;
            }

            try {
                console.log("Sending login request...");
                const response = await fetch(`${apiBaseUrl}token/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    console.log(" Login successful!");
                    localStorage.setItem("accessToken", data.access);
                    localStorage.setItem("refreshToken", data.refresh);

                    // Redirect to expense tracker page after login
                    setTimeout(() => {
                        console.log(" Redirecting...");
                        window.location.href = "/expenses.html";
                    }, 2000);
                } else {
                    alert(`Login failed: ${JSON.stringify(data)}`);
                }
            } catch (error) {
                console.error(" Error logging in:", error);
            }
        });
    }
});
