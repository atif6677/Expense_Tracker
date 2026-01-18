## ⚠️ Important Note on Email Services

This project uses **Brevo (formerly Sendinblue)** for sending transactional emails (e.g., password resets). 

> **Note for Developers:** > To ensure successful email delivery in a production environment, Brevo requires a **verified sender domain**. If you are running this locally with a free account and an unverified domain (e.g., using a generic Gmail address as the sender), emails may be blocked or land in the spam folder. 
> 
> For testing purposes without a domain, consider replacing the `brevo` service with `nodemailer` or ensuring your sender identity is fully verified on the Brevo dashboard.


# 💰 Expense Tracker Application

A full-stack web application that allows users to manage their personal finances securely. Users can track daily expenses, view reports, and upgrade to a **Premium Membership** to access exclusive features like the **Leaderboard** and **Downloadable Reports**.

---

## 🚀 Features

### 🔹 Core Features (Free)
* **User Authentication:** Secure Signup and Login using JWT and Bcrypt.
* **Expense Management:** Add, view, and delete daily expenses.
* **Pagination:** Efficiently browse through large lists of expenses.
* **Password Recovery:** "Forgot Password" functionality via email (powered by Brevo).

### 👑 Premium Features (Paid)
* **Leaderboard:** See how your spending compares to other users.
* **Advanced Reporting:** Filter expenses by **Daily**, **Weekly**, or **Monthly** views.
* **Download Data:** Export expense reports as **CSV files** or download securely via **AWS S3** links.
* **Secure Payments:** Integrated with **Cashfree Payment Gateway**.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
* **Authentication:** JSON Web Tokens (JWT)
* **File Storage:** AWS S3 (for report downloads)
* **Email Service:** Brevo (formerly Sendinblue)
* **Payments:** Cashfree

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Expense-tracker