import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Assessments from './pages/Assessments';
import PHQ9 from './pages/Assessments/PHQ9';
import GAD7 from './pages/Assessments/GAD7';
import Stress from './pages/Assessments/Stress';
import Sleep from './pages/Assessments/Sleep';
import Burnout from './pages/Assessments/Burnout';
import Result from './pages/Assessments/Result';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
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
                <Route path="/" element={<Home />} />
                <Route path="/assessments" element={<Assessments />} />
                <Route path="/assessments/phq9" element={<PHQ9 />} />
                <Route path="/assessments/gad7" element={<GAD7 />} />
                <Route path="/assessments/stress" element={<Stress />} />
                <Route path="/assessments/sleep" element={<Sleep />} />
                <Route path="/assessments/burnout" element={<Burnout />} />
                <Route path="/assessments/result" element={<Result />} />
                <Route path="/dashboard" element={<Dashboard />} />
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