const apiBaseUrl = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("accessToken"); // Get token from storage

if (!token) {
    alert("You need to log in first!");
    window.location.href = "sign_in.html"; // Redirect to login
}

// Function to Fetch and Update Dashboard Data Based on Selected Month
async function updateDashboard() {
    const selectedMonth = document.getElementById("dashboardMonth").value;
    console.log("Selected Month:", selectedMonth);  //  Log selected month

    if (!selectedMonth) {
        alert("Please select a month!");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/summary/?month=${selectedMonth}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        console.log("🔹 Fetching Summary API:", response.url);  //  Log API request URL

        const data = await response.json();
        console.log(" Summary API Response:", data);  //  Log API response

        if (response.ok) {
            createIncomeExpenseChart(data.total_income, data.total_expenses);
            fetchCategoryData(selectedMonth);  //  Ensure correct month is passed
        } else {
            alert("Failed to fetch summary.");
        }
    } catch (error) {
        console.error(" Error fetching dashboard data:", error);
    }
}

//  Function to group expenses by category
// Fix Pie Chart Data Processing
function groupExpensesByCategory(expenses) {
    const categoryTotals = {};

    expenses.forEach(expense => {
        const category = expense.category_name || "Unknown";  // ✅ Fix here
        categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    return categoryTotals;
}

// Fetch Expenses for the Selected Month
async function fetchCategoryData(selectedMonth) {
    try {
        const response = await fetch(`${apiBaseUrl}/expenses/?month=${selectedMonth}`, {  //  Use selectedMonth in API call
            headers: { "Authorization": `Bearer ${token}` }
        });

        const expenses = await response.json();
        if (response.ok) {
            const categoryData = groupExpensesByCategory(expenses);
            createExpenseCategoryChart(categoryData);
        } else {
            alert("Failed to fetch expense categories.");
        }
    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}


//fettchh  ccattegory data
async function fetchCategoryData(selectedMonth) {
    console.log(" Fetching Expenses for Month:", selectedMonth);  //  Log selected month

    try {
        const response = await fetch(`${apiBaseUrl}/expenses/?month=${selectedMonth}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        console.log("🔹 Fetching Expenses API:", response.url);  //  Log API request URL

        const expenses = await response.json();
        console.log("Expenses API Response:", expenses);  //  Log API response

        if (response.ok) {
            const categoryData = groupExpensesByCategory(expenses);
            createExpenseCategoryChart(categoryData);
        } else {
            alert("Failed to fetch expense categories.");
        }
    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}

// Store chart instances globally to manage them
let incomeExpenseChartInstance = null;
let expenseCategoryChartInstance = null;

//  Create Income vs Expense Chart (Bar Chart)
function createIncomeExpenseChart(income, expenses) {
    const ctx = document.getElementById("incomeExpenseChart").getContext("2d");

    // 🔹 Destroy existing chart if it exists
    if (incomeExpenseChartInstance) {
        incomeExpenseChartInstance.destroy();
    }

    // 🔹 Create new chart
    incomeExpenseChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Income", "Expenses"],
            datasets: [{
                label: "Amount (₹)",
                data: [income, expenses],
                backgroundColor: ["#28a745", "#dc3545"],
            }]
        },
        options: { responsive: true }
    });
}

//  Create Expense Breakdown Chart (Pie Chart)
function createExpenseCategoryChart(categoryData) {
    const ctx = document.getElementById("expenseCategoryChart").getContext("2d");

    // 🔹 Destroy existing chart if it exists
    if (expenseCategoryChartInstance) {
        expenseCategoryChartInstance.destroy();
    }

    // 🔹 Create new chart
    expenseCategoryChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                label: "Expenses by Category",
                data: Object.values(categoryData),
                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"],
            }]
        },
        options: { responsive: true }
    });
}


// Load the dashboard with default (current month) data when the page loads
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // Format YYYY-MM
    document.getElementById("dashboardMonth").value = currentMonth; // Set default month
    updateDashboard(); // Load initial data
});
