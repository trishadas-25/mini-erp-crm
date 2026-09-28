# Mini ERP + CRM Operations Portal

**Live Demo:** [https://funds-room-ten.vercel.app/login](https://funds-room-ten.vercel.app/login)

A complete Full Stack ERP + CRM solution built to manage **customers, leads, products, inventory, stock movements, and sales challans** from a single web application.

The project demonstrates how a real-world business management system works by connecting a **React frontend** with a **Node.js + Express backend**, using **Prisma ORM** for database operations and **SQLite** for local development.

## What is this project?

This Mini ERP + CRM Operations Portal is a business management application that combines two major functionalities:

- **CRM (Customer Relationship Management):** Manage leads and customers, maintain customer information, and handle follow-ups.
- **ERP (Enterprise Resource Planning):** Manage products, inventory, stock movements, and sales challans.

The application provides a centralized system where users can manage business operations instead of maintaining customer, product, and sales information separately.

## Main Features

- User authentication with JWT
- Role-based access control
- Customer and lead management
- Customer search and updates
- Product management
- SKU management
- Inventory tracking
- Stock IN/OUT movements
- Stock movement history
- Sales challan creation
- Draft and confirmed challan states
- Automatic stock deduction when a challan is confirmed
- Stock validation before deduction
- Database transactions and rollback for insufficient stock

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM
- **Database:** SQLite
- **Frontend:** React (Vite), TypeScript, Vanilla CSS

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Backend

```bash
cd backend
npm install
npm run dev