import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">🍽️ DineR</h1>
        <p className="text-xl text-gray-100 mb-8">Multi-tenant Restaurant Menu SaaS</p>
        <p className="text-gray-200">Frontend is ready! Backend coming next...</p>
      </div>
    </div>
  );
}

export default App;
