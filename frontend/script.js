const apiBaseUrl = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("accessToken");  // Get token from local storage

// logout logic here
document.getElementById("logoutBtn").addEventListener("click", async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        alert("You are already logged out.");
        return;
    }

    try {
        await fetch(`${apiBaseUrl}/logout/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken })
        });

        console.log("Logout successful.");
    } catch (error) {
        console.error("Error logging out:", error);
    }

    // Clear tokens and redirect to login
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    alert("Logged out successfully! ");
    window.location.href = "/sign_in.html"; // Redirect to login
});

// Add or Update Income
async function addOrUpdateIncome(amount, month) {
    try {
        const response = await fetch(`${apiBaseUrl}/income/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ amount, month: month + "-01" })
        });
        handleApiResponse(response, "Income added/updated successfully!");
    } catch (error) {
        console.error("Error adding/updating income:", error);
    }
}

function editIncome(incomeId, currentAmount, currentMonth) {
    const newAmount = prompt(`Edit Income (Current: ₹${currentAmount}):`, currentAmount);
    if (newAmount === null || newAmount.trim() === "") return;  // Cancel if empty

    updateIncome(incomeId, parseFloat(newAmount), currentMonth);
}

async function updateIncome(incomeId, newAmount, month) {
    try {
        const response = await fetch(`${apiBaseUrl}/income/${incomeId}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ amount: newAmount, month })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Income updated successfully! ");
            fetchIncome();  // Refresh list
        } else {
            alert(data.detail || "Failed to update income");
        }
    } catch (error) {
        console.error("Error updating income:", error);
    }
}

async function lockIncome(incomeId) {
    try {
        const response = await fetch(`${apiBaseUrl}/income/${incomeId}/lock/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert("Income locked successfully! ");
            fetchIncome();  // Refresh list
        } else {
            alert(data.detail || "Failed to lock income");
        }
    } catch (error) {
        console.error("Error locking income:", error);
    }
}


if (!token) {
    alert("Session expired! Please log in again.");
    window.location.href = "sign_in.html"; // Redirect to login
}


// Fetch and render income
async function fetchIncome() {
    try {
        const response = await fetch(`${apiBaseUrl}/income/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        const incomeList = document.getElementById("incomeList");
        incomeList.innerHTML = "";  // Clear old income list

        if (response.ok) {
            if (data.length === 0) {
                incomeList.innerHTML = "<li>No income records found.</li>";
            } else {
                data.forEach((income) => {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        ₹${income.amount} for ${income.month}  
                        <button onclick="editIncome(${income.id}, ${income.amount}, '${income.month}')">Edit</button>
                        <button onclick="lockIncome(${income.id})">Lock</button>
                    `;
                    incomeList.appendChild(listItem);
                });
            }
        } else {
            alert(data.detail || "Failed to fetch income");
        }
    } catch (error) {
        console.error("Error fetching income:", error);
    }
}

// async function fetchCategories() {
//     try {
//         const response = await fetch(`${apiBaseUrl}/categories/`, {
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         });

//         const data = await response.json();
//         const categoryDropdown = document.getElementById("category");

//         categoryDropdown.innerHTML = '<option value="">Select a category</option>'; // Reset dropdown

//         data.forEach(category => {
//             const option = document.createElement("option");
//             option.value = category.id;
//             option.textContent = category.name;
//             categoryDropdown.appendChild(option);
//         });

//     } catch (error) {
//         console.error("Error fetching categories:", error);
//     }
// }

// // Call function when the page loads
// fetchCategories();
// document.getElementById("addCategoryBtn").addEventListener("click", () => {
//     document.getElementById("addCategorySection").style.display = "block";  // Show input field
// });

// document.getElementById("saveCategoryBtn").addEventListener("click", async () => {
//     const newCategoryInput = document.getElementById("newCategory");
//     const categoryName = newCategoryInput.value.trim();

//     if (categoryName === "") {
//         alert("Category name cannot be empty.");
//         return;
//     }

//     try {
//         const response = await fetch(`${apiBaseUrl}/categories/`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`
//             },
//             body: JSON.stringify({ name: categoryName })
//         });

//         const data = await response.json();

//         if (response.ok) {
//             alert("Category added successfully! ");

//             // Clear input field
//             newCategoryInput.value = "";

//             // Refresh category dropdown
//             fetchCategories();
//         } else {
//             alert(`Failed to add category: ${JSON.stringify(data)}`);
//         }
//     } catch (error) {
//         console.error("Error adding category:", error);
//     }
// });


// Add Expense with Success Alert
async function addExpense(category, amount, date) {
    const token = localStorage.getItem("accessToken"); // Get latest token

    try {
        const response = await fetch(`${apiBaseUrl}/expenses/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ category, amount, date })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Expense added successfully! ");
            fetchExpenses(); // Refresh expenses list
        } else {
            alert(`Failed to add expense: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        console.error("Error adding expense:", error);
    }
}

// Fetch and render expense list
async function fetchExpenses() {
    try {
        const response = await fetch(`${apiBaseUrl}/expenses/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        const expenseList = document.getElementById("expenseList");
        expenseList.innerHTML = "";  // Clear old expense list

        if (response.ok) {
            if (data.length === 0) {
                expenseList.innerHTML = "<li>No expense records found.</li>";
            } else {
                data.forEach((expense) => {
                    const listItem = document.createElement("li");
                    //const categoryName = expense.category_name || "Unknown"; 
                    listItem.innerHTML = `
                        ₹${expense.amount} - ${expense.category}   (${expense.date})  
                        <button onclick="editExpense(${expense.id}, '${expense.category}', ${expense.amount}, '${expense.date}')">Edit</button>
                        <button onclick="deleteExpense(${expense.id})">Delete</button>
                    `;
                    expenseList.appendChild(listItem);
                });
            }
        } else {
            alert(data.detail || "Failed to fetch expenses");
        }
    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}


function editExpense(expenseId, currentCategory, currentAmount, currentDate) {
    const newAmount = prompt(`Edit Amount (Current: ₹${currentAmount}):`, currentAmount);
    if (newAmount === null || newAmount.trim() === "") return;  // Cancel if empty

    const newDate = prompt(`Edit Date (Current: ${currentDate}):`, currentDate);
    if (newDate === null || newDate.trim() === "") return;  // Cancel if empty

    updateExpense(expenseId, currentCategory, parseFloat(newAmount), newDate);
}

async function updateExpense(expenseId, category, newAmount, newDate) {
    try {
        const response = await fetch(`${apiBaseUrl}/expenses/${expenseId}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ category, amount: newAmount, date: newDate })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Expense updated successfully! ");
            fetchExpenses();  // Refresh list
        } else {
            alert(data.detail || "Failed to update expense");
        }
    } catch (error) {
        console.error("Error updating expense:", error);
    }
}


async function deleteExpense(expenseId) {
    if (!confirm("Are you sure you want to delete this expense?")) return;  // Confirmation check

    try {
        const response = await fetch(`${apiBaseUrl}/expenses/${expenseId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("Expense deleted successfully! ");
            fetchExpenses();  // Refresh list
        } else {
            const data = await response.json();
            alert(data.detail || data.error || "Failed to delete expense");
        }
    } catch (error) {
        console.error("Error deleting expense:", error);
    }
}



// Fetch Monthly Summary
async function fetchSummary(month) {
    try {
        const response = await fetch(`${apiBaseUrl}/summary/?month=${month}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById("summaryMonthDisplay").innerText = data.month || month;
            document.getElementById("totalIncome").innerText = data.total_income || 0;
            document.getElementById("totalExpenses").innerText = data.total_expenses || 0;
            document.getElementById("balance").innerText = data.balance || 0;
        } else {
            alert(data.error || "Failed to fetch summary");
        }
    } catch (error) {
        console.error("Error fetching summary:", error);
    }
}

// Handle API Response
async function handleApiResponse(response, successMessage) {
    const data = await response.json();
    if (response.ok) {
        alert(successMessage);
        //window.location.reload(); // Reload to refresh data
    } else {
        alert(data.detail || "An error occurred");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Form Submissions
    document.getElementById("incomeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = document.getElementById("incomeAmount").value;
    const month = document.getElementById("incomeMonth").value;
    addOrUpdateIncome(parseFloat(amount), month);
});
});



document.getElementById("expenseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;

    console.log("Category:", category);
    console.log("Amount:", amount);
    console.log("Date:", date);

    addExpense(category, parseFloat(amount), date);
});

document.getElementById("summaryForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const month = document.getElementById("summaryMonth").value;
    fetchSummary(month);
});

// Fetch income when the page loads
fetchIncome();
//fetch expenses when the pagee loads
fetchExpenses();

