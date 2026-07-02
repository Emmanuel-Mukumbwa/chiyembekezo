import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Resources from './pages/Resources';
import Assessments from './pages/Assessments';
import PHQ9 from './pages/Assessments/PHQ9';
import GAD7 from './pages/Assessments/GAD7';
import Stress from './pages/Assessments/Stress';
import Sleep from './pages/Assessments/Sleep';
import Burnout from './pages/Assessments/Burnout';
import Result from './pages/Assessments/Result';
import FindHelp from './pages/FindHelp';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import MoodHistory from './pages/MoodHistory';
import Journal from './pages/Journal';
import Goals from './pages/Goals';
import SafetyPlan from './pages/SafetyPlan';
import './styles/custom.css';

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <div className="app-wrapper d-flex flex-column min-vh-100">
            <Navigation />
            <div className="flex-grow-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/assessments" element={<Assessments />} />
                <Route path="/assessments/phq9" element={<PHQ9 />} />
                <Route path="/assessments/gad7" element={<GAD7 />} />
                <Route path="/assessments/stress" element={<Stress />} />
                <Route path="/assessments/sleep" element={<Sleep />} />
                <Route path="/assessments/burnout" element={<Burnout />} />
                <Route path="/assessments/result" element={<Result />} />
                <Route path="/find-help" element={<FindHelp />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/mood-history" element={
                  <ProtectedRoute>
                    <MoodHistory />
                  </ProtectedRoute>
                } />
                <Route path="/journal" element={
                  <ProtectedRoute><Journal /></ProtectedRoute>
                } />
                <Route path="/goals" element={
                  <ProtectedRoute><Goals /></ProtectedRoute>
                } />
                <Route path="/safety-plan" element={
                  <ProtectedRoute><SafetyPlan /></ProtectedRoute>
                } />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;