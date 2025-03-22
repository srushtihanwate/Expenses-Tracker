document.addEventListener("DOMContentLoaded", function () {
    const resetPasswordForm = document.getElementById("resetPasswordForm");

    document.addEventListener("DOMContentLoaded", function () {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("user_id");  // ✅ Extract user_id from URL
    
        console.log("🔹 Extracted user_id:", userId);  // ✅ Debugging line
    
        if (!userId) {
            alert("Error: Invalid password reset link. ❌");
            return;
        }
    });
    




    if (resetPasswordForm) {
        console.log("✅ Reset Password form loaded!");

        resetPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get("user_id");

            console.log("🔹 Extracted user_id:", userId);  // ✅ Debugging line

            if (!userId) {
                alert("Error: Invalid password reset link. ❌");
                return;
            }

            const newPassword = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (newPassword !== confirmPassword) {
                alert("Passwords do not match! ");
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/reset-password/?user_id=${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword })
                });

                const data = await response.json();
                console.log("🔹 Response Status:", response.status);
                console.log("🔹 Response Data:", data);

                if (response.ok) {
                    alert("Password reset successful! ✅ Redirecting to login...");
                    window.location.href = "/sign_in.html";
                } else {
                    alert(data.error || "Error resetting password.");
                }
            } catch (error) {
                console.error("❌ Network Error:", error);
            }
        });
    }
});
