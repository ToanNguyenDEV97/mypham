# DS Tiên Cosmetics - E-commerce Platform

A modern, responsive e-commerce web application built for DS Tiên Cosmetics. This platform provides a seamless shopping experience for customers and a comprehensive admin dashboard for store management.

## 🌟 Features

### Customer-Facing
*   **Storefront:** Beautifully designed home page with featured products, banners, and categories.
*   **Product Catalog:** Detailed product views with image galleries, pricing, and descriptions.
*   **Shopping Cart & Checkout:** Streamlined cart management and checkout process with voucher code support.
*   **User Authentication:** Secure signup/login using Firebase Authentication.
*   **Profile Management:** Users can manage their shipping information and view their order history.
*   **Order Tracking:** Authenticated users can track the status of their specific orders.
*   **Blog/News:** Integrated blog system for beauty tips and store announcements.

### Admin Dashboard (Protected)
*   **Order Management:** View, update status, and manage customer orders.
*   **Printing:** Print optimized invoices and shipping waybills directly from the browser.
*   **Product Management:** Add, edit, and delete products (images, prices, stock, categories).
*   **Voucher Management:** Create and track discount codes (percentage or fixed amount).
*   **Content Management:** Manage homepage banners and blog posts.
*   **Global Settings:** Update store contact info, social links, and policies.

## 🚀 Tech Stack

*   **Frontend Framework:** React 18 with Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database & Auth:** Firebase (Firestore & Firebase Authentication)
*   **Animations:** Framer Motion
*   **Icons:** Lucide React

## 🛠 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed. We recommend using [Bun](https://bun.sh/) as the package manager, though `npm` also works perfectly fine.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   # If you are pulling this locally
   git clone <repo-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

### Environment Setup

Create a `.env` file in the root directory and copy the contents from `.env.example`. Fill in your Firebase configuration keys:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

*(Note: The Firebase database rules and schema are already enforced in `firestore.rules` and `firebase-blueprint.json`)*

### Running the Development Server

Start the local development server:

```bash
bun run dev
# or
npm run dev
```

The application will typically be available at `http://localhost:3000` or `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
bun run build
# or
npm run build
```

The compiled assets will be output to the `dist/` directory.

## 📁 Project Structure

*   `/src/components/views/` - Main page components (Home, Products, Checkout, Admin, etc.)
*   `/src/components/layout/` - Structural components (Navigation, Footer, Cart Drawer, etc.)
*   `/src/components/ui/` - Reusable UI elements
*   `/src/components/admin/` - Admin dashboard sub-components
*   `/src/lib/` - Integrations and configurations (Firebase init)
*   `/src/utils/` - Helper functions (Price formatting, Order ID generation)

## 🛡️ Security

This project implements strict Firestore security rules:
*   Users can only read/update their own profiles and orders.
*   Order creation validates required fields and prevents negative pricing.
*   Only verified Admin accounts can modify products, vouchers, settings, and process orders.
*   Admin elevation is protected at the database level and cannot be triggered by standard users.
