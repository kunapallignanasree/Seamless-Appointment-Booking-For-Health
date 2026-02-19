# DocSpot Admin Panel

A comprehensive admin interface for managing the DocSpot healthcare platform. Built with React 19, Vite, and Material-UI.

## ✨ Features

- **Dashboard**: Overview of platform statistics and recent activities
- **Doctor Management**: Add, view, and manage doctors' availability
- **Appointment Management**: View and manage all appointments
- **User Management**: Monitor and manage platform users

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/docspot.git
   cd docspot/admin
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the admin directory with the following variables:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5174](http://localhost:5174) in your browser

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
admin/
├── src/
│   ├── assets/          # Static assets
│   ├── components/      # Reusable components
│   ├── context/         # React context providers
│   ├── pages/           # Page components
│   │   ├── Admin/       # Admin-specific pages
│   │   └── Doctor/      # Doctor-specific pages
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── .env                 # Environment variables
└── package.json         # Project dependencies and scripts
```

## 🔧 Technologies Used

- React 19
- Vite
- Material-UI
- Ant Design
- React Router
- Axios
- Tailwind CSS
- React Toastify

## 🔒 Authentication

The admin panel uses JWT for authentication. Make sure to set up the backend with proper authentication endpoints.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For any inquiries, please contact [Your Name] at [your.email@example.com].
