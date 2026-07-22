import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Resources from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';
import Quiz from './pages/Quiz';
import Assessments from './pages/Assessments';
import PHQ9 from './pages/Assessments/PHQ9';
import GAD7 from './pages/Assessments/GAD7';
import Stress from './pages/Assessments/Stress';
import Sleep from './pages/Assessments/Sleep';
import Burnout from './pages/Assessments/Burnout';
import Result from './pages/Assessments/Result';
import FindHelp from './pages/FindHelp';
import ProfessionalProfile from './pages/ProfessionalProfile';
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
import Habits from './pages/Habits';

// Wellness imports
import WellnessToolkit from './pages/Wellness/WellnessToolkit';
import Breathing from './pages/Wellness/Breathing';
import Meditation from './pages/Wellness/Meditation';
import Grounding from './pages/Wellness/Grounding';
import Sounds from './pages/Wellness/Sounds';
import Timers from './pages/Wellness/Timers';
import DailyWellness from './pages/Wellness/DailyWellness';
import CommunityHome from './pages/Community/CommunityHome';
import PostDetail from './pages/Community/PostDetail';

// Professional availability (reusable)
import ProfessionalAvailability from './pages/ProfessionalAvailability';
import Emergency from './pages/Emergency';
import Achievements from './pages/Achievements';
import Reports from './pages/Reports';

// Admin imports
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminProfessionals from './pages/Admin/AdminProfessionals';
import AdminArticles from './pages/Admin/AdminArticles';
import AdminResources from './pages/Admin/AdminResources';
import AdminAppointments from './pages/Admin/AdminAppointments';
import AdminCommunity from './pages/Admin/AdminCommunity';
import AdminAnalytics from './pages/Admin/AdminAnalytics';

// Professional Portal imports
import ProfessionalLayout from './pages/Professional/ProfessionalLayout';
import ProfessionalDashboard from './pages/Professional/ProfessionalDashboard';
import ProfessionalAppointments from './pages/Professional/ProfessionalAppointments';
import ProfessionalPatients from './pages/Professional/ProfessionalPatients';
import ProfessionalMessages from './pages/Professional/ProfessionalMessages';
import ProfessionalReports from './pages/Professional/ProfessionalReports';

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
                {/* ===== Public routes ===== */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetail />} />
                <Route path="/quiz/:id" element={<Quiz />} />
                <Route path="/assessments" element={<Assessments />} />
                <Route path="/assessments/phq9" element={<PHQ9 />} />
                <Route path="/assessments/gad7" element={<GAD7 />} />
                <Route path="/assessments/stress" element={<Stress />} />
                <Route path="/assessments/sleep" element={<Sleep />} />
                <Route path="/assessments/burnout" element={<Burnout />} />
                <Route path="/assessments/result" element={<Result />} />
                <Route path="/find-help" element={<FindHelp />} />
                <Route path="/professional/:id" element={<ProfessionalProfile />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/community" element={<CommunityHome />} />
                <Route path="/community/post/:id" element={<PostDetail />} />
                <Route path="/emergency" element={<Emergency />} />

                {/* ===== Auth routes ===== */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ===== Protected routes ===== */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
                <Route path="/mood-history" element={
                  <ProtectedRoute><MoodHistory /></ProtectedRoute>
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
                <Route path="/habits" element={
                  <ProtectedRoute><Habits /></ProtectedRoute>
                } />
                <Route path="/achievements" element={
                  <ProtectedRoute><Achievements /></ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute><Reports /></ProtectedRoute>
                } />

                {/* ===== Wellness Toolkit ===== */}
                <Route path="/wellness" element={
                  <ProtectedRoute><WellnessToolkit /></ProtectedRoute>
                } />
                <Route path="/wellness/breathing" element={
                  <ProtectedRoute><Breathing /></ProtectedRoute>
                } />
                <Route path="/wellness/meditation" element={
                  <ProtectedRoute><Meditation /></ProtectedRoute>
                } />
                <Route path="/wellness/grounding" element={
                  <ProtectedRoute><Grounding /></ProtectedRoute>
                } />
                <Route path="/wellness/sounds" element={
                  <ProtectedRoute><Sounds /></ProtectedRoute>
                } />
                <Route path="/wellness/timers" element={
                  <ProtectedRoute><Timers /></ProtectedRoute>
                } />
                <Route path="/wellness/daily" element={
                  <ProtectedRoute><DailyWellness /></ProtectedRoute>
                } />

                {/* ===== Professional Availability (standalone) ===== */}
                <Route path="/professional/availability" element={
                  <ProtectedRoute><ProfessionalAvailability /></ProtectedRoute>
                } />

                {/* ===== Admin Panel ===== */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="professionals" element={<AdminProfessionals />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="resources" element={<AdminResources />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="community" element={<AdminCommunity />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                {/* ===== Professional Portal ===== */}
                <Route path="/professional" element={<ProtectedRoute><ProfessionalLayout /></ProtectedRoute>}>
                  <Route index element={<ProfessionalDashboard />} />
                  <Route path="appointments" element={<ProfessionalAppointments />} />
                  <Route path="patients" element={<ProfessionalPatients />} />
                  <Route path="patients/:patientId" element={<ProfessionalPatients />} />
                  <Route path="messages" element={<ProfessionalMessages />} />
                  <Route path="availability" element={<ProfessionalAvailability />} />
                  <Route path="reports" element={<ProfessionalReports />} />
                </Route>

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