import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ScrollToTop from './components/ScrollToTop'; // NEW

// Components
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
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import MoodHistory from './pages/MoodHistory';
import Journal from './pages/Journal';
import Goals from './pages/Goals';
import SafetyPlan from './pages/SafetyPlan';
import Habits from './pages/Habits';
import WellnessToolkit from './pages/Wellness/WellnessToolkit';
import Breathing from './pages/Wellness/Breathing';
import Meditation from './pages/Wellness/Meditation';
import Grounding from './pages/Wellness/Grounding';
import Sounds from './pages/Wellness/Sounds';
import Timers from './pages/Wellness/Timers';
import DailyWellness from './pages/Wellness/DailyWellness';
import CommunityHome from './pages/Community/CommunityHome';
import PostDetail from './pages/Community/PostDetail';
import ProfessionalAvailability from './pages/Professional/ProfessionalAvailability';
import Emergency from './pages/Emergency';
import Achievements from './pages/Achievements';
import Reports from './pages/Reports';
import GetStarted from './pages/GetStarted';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import CommunityGuidelines from './pages/CommunityGuidelines';
import PeerSupport from './pages/PeerSupport';
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard';
import ListenerDashboard from './pages/Listener/ListenerDashboard';
import VolunteerRequests from './pages/Volunteer/VolunteerRequests';
import VolunteerAvailable from './pages/Volunteer/VolunteerAvailable';

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
import AdminVolunteers from './pages/Admin/AdminVolunteers';
import AdminOrganizations from './pages/Admin/AdminOrganizations';
import AdminPeerSupport from './pages/Admin/AdminPeerSupport';

// Professional Portal imports
import ProfessionalLayout from './pages/Professional/ProfessionalLayout';
import ProfessionalDashboard from './pages/Professional/ProfessionalDashboard';
import ProfessionalAppointments from './pages/Professional/ProfessionalAppointments';
import ProfessionalPatients from './pages/Professional/ProfessionalPatients';
import ProfessionalMessages from './pages/Professional/ProfessionalMessages';
import ProfessionalReports from './pages/Professional/ProfessionalReports';

// Organization imports
import OrganizationLayout from './pages/Organization/OrganizationLayout';
import OrganizationDashboard from './pages/Organization/OrganizationDashboard';
import OrganizationMembers from './pages/Organization/OrganizationMembers';
import OrganizationInsights from './pages/Organization/OrganizationInsights';

// Context & Providers
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import CookieConsentBanner from './components/CookieConsentBanner';

import './styles/custom.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModalProvider>
          <Router>
            <div className="app-wrapper d-flex flex-column min-vh-100">
              <ScrollToTop /> {/* <-- Added globally */}
              <Routes>
                {/* ===== Public routes (with AppLayout) ===== */}
                <Route path="/" element={<AppLayout><Home /></AppLayout>} />
                <Route path="/about" element={<AppLayout><About /></AppLayout>} />
                <Route path="/resources" element={<AppLayout><Resources /></AppLayout>} />
                <Route path="/resources/:id" element={<AppLayout><ResourceDetail /></AppLayout>} />
                <Route path="/quiz/:id" element={<AppLayout><Quiz /></AppLayout>} />
                <Route path="/assessments" element={<AppLayout><Assessments /></AppLayout>} />
                <Route path="/assessments/phq9" element={<AppLayout><PHQ9 /></AppLayout>} />
                <Route path="/assessments/gad7" element={<AppLayout><GAD7 /></AppLayout>} />
                <Route path="/assessments/stress" element={<AppLayout><Stress /></AppLayout>} />
                <Route path="/assessments/sleep" element={<AppLayout><Sleep /></AppLayout>} />
                <Route path="/assessments/burnout" element={<AppLayout><Burnout /></AppLayout>} />
                <Route path="/assessments/result" element={<AppLayout><Result /></AppLayout>} />
                <Route path="/find-help" element={<AppLayout><FindHelp /></AppLayout>} />
                <Route path="/professional/:id" element={<AppLayout><ProfessionalProfile /></AppLayout>} />
                <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />
                <Route path="/faq" element={<AppLayout><FAQ /></AppLayout>} />
                <Route path="/community" element={<AppLayout><CommunityHome /></AppLayout>} />
                <Route path="/community/post/:id" element={<AppLayout><PostDetail /></AppLayout>} />
                <Route path="/emergency" element={<AppLayout><Emergency /></AppLayout>} />
                <Route path="/get-started" element={<AppLayout><GetStarted /></AppLayout>} />
                <Route path="/terms" element={<AppLayout><Terms /></AppLayout>} />
                <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
                <Route path="/cookie-policy" element={<AppLayout><CookiePolicy /></AppLayout>} />
                <Route path="/community-guidelines" element={<AppLayout><CommunityGuidelines /></AppLayout>} />

                {/* ===== Auth routes (without layout) ===== */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* ===== Protected routes (with DashboardLayout) ===== */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/mood-history" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MoodHistory />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Journal />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/goals" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Goals />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/safety-plan" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SafetyPlan />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/habits" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Habits />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/achievements" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Achievements />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Reports />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* ===== Wellness Toolkit ===== */}
                <Route path="/wellness" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <WellnessToolkit />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/wellness/breathing" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Breathing />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/wellness/meditation" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Meditation />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/wellness/grounding" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Grounding />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/wellness/sounds" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Sounds />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/wellness/timers" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Timers />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/wellness/daily" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DailyWellness />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* ===== Professional Availability ===== */}
                <Route path="/professional/availability" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProfessionalAvailability />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* ===== Peer Support ===== */}
                <Route path="/peer-support" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PeerSupport />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* ===== Volunteer Dashboard ===== */}
                <Route path="/volunteer/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <VolunteerDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/volunteer/requests" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <VolunteerRequests />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/volunteer/available" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <VolunteerAvailable />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* ===== Listener Dashboard ===== */}
                <Route path="/listener/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ListenerDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* ===== Admin Panel ===== */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="professionals" element={<AdminProfessionals />} />
                  <Route path="volunteers" element={<AdminVolunteers />} />
                  <Route path="organizations" element={<AdminOrganizations />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="resources" element={<AdminResources />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="community" element={<AdminCommunity />} />
                  <Route path="peer-support" element={<AdminPeerSupport />} />
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

                {/* ===== Organization Portal ===== */}
                <Route path="/organization" element={<ProtectedRoute><OrganizationLayout /></ProtectedRoute>}>
                  <Route index element={<OrganizationDashboard />} />
                  <Route path="members" element={<OrganizationMembers />} />
                  <Route path="insights" element={<OrganizationInsights />} />
                </Route>

              </Routes>
              {/* Cookie Consent Banner */}
              <CookieConsentBanner />
            </div>
          </Router>
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;