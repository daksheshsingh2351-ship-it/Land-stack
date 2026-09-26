# LandStack

LandStack is a modern digital land-governance and property information platform designed to make land records, property services, and administrative workflows more accessible, transparent, and structured.

The platform follows a GIS and Digital Public Infrastructure–inspired approach, connecting citizens, land/property records, service requests, and government-style workflows through a unified web application.

## 🚀 Features

### 👤 Citizen Portal
- Citizen registration and secure login
- JWT-based authentication
- Personal citizen dashboard
- Submit and track service requests
- View request status and updates
- Access land and property information
- Explore parcels through the GIS-based Land Explorer
- Notifications for important updates

### 🏛️ Officer Portal
- Secure officer authentication
- Officer dashboard
- Service request management
- Search and review land/property records
- ULPIN-based parcel lookup
- Verify and approve requests
- Request additional information
- Flag requests for further review
- Update request statuses
- Officer notifications

### 🗺️ Land Explorer
- GIS-inspired land/property exploration
- Search by location
- Search by land record
- Find parcels on map
- View citizen's properties
- Parcel details and ownership information
- Authentication-protected access

### 🔐 Security
- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Citizen/Officer access separation
- Backend authorization for property and service data
- Environment-based secrets and configuration

### 🔔 Notifications
- Unread notification count
- Mark individual notifications as read
- Mark all notifications as read
- Request status notifications

### 🤖 AI Alerts
- Land/property related alert interface
- Alert review workflow
- Alert summaries
- Administrative review support

### 🔗 Connected Systems
LandStack includes a prototype interface for connected government-style systems and services. These integrations are represented as a sandbox/prototype layer and do not represent live government integrations.

## 🏗️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- REST API integration
- Responsive web UI

### Backend
- Node.js
- Express.js
- REST APIs
- JWT
- bcryptjs
- Helmet
- CORS
- Morgan

### Database
- PostgreSQL
- Prisma ORM

## 🧩 Architecture

```text
Citizen / Officer
       │
       ▼
React + Vite Frontend
       │
       ▼
REST API
       │
       ▼
Node.js + Express
       │
       ▼
Prisma ORM
       │
       ▼
PostgreSQL

