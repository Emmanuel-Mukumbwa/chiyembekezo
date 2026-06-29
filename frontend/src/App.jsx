import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import './styles/custom.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Other routes will be added later */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;