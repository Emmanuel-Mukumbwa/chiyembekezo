import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
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
import Settings from './pages/Settings';
import VolunteerRequests from './pages/Volunteer/VolunteerRequests';
import VolunteerAvailable from './pages/Volunteer/VolunteerAvailable';
import NotFound from './pages/NotFound';

// Admin
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminProfessionals from './pages/Admin/AdminProfessionals';
import AdminVolunteers from './pages/Admin/AdminVolunteers';
import AdminOrganizations from './pages/Admin/AdminOrganizations';
import AdminApplications from './pages/Admin/AdminApplications';
import AdminInvitations from './pages/Admin/AdminInvitations';
import AdminArticles from './pages/Admin/AdminArticles';
import AdminResources from './pages/Admin/AdminResources';
import AdminResourcesCreate from './pages/Admin/AdminResourcesCreate';
import AdminResourcesEdit from './pages/Admin/AdminResourcesEdit';
import AdminAppointments from './pages/Admin/AdminAppointments';
import AdminCommunity from './pages/Admin/AdminCommunity';
import AdminPeerSupport from './pages/Admin/AdminPeerSupport';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminEmergencyContacts from './pages/Admin/AdminEmergencyContacts';
import AdminLogs from './pages/Admin/AdminLogs';
// NEW WELLNESS ADMIN IMPORTS
import AdminMeditations from './pages/Admin/AdminMeditations';
import AdminSounds from './pages/Admin/AdminSounds';

// Professional Portal
import ProfessionalLayout from './pages/Professional/ProfessionalLayout';
import ProfessionalDashboard from './pages/Professional/ProfessionalDashboard';
import ProfessionalAppointments from './pages/Professional/ProfessionalAppointments';
import ProfessionalPatients from './pages/Professional/ProfessionalPatients';
import ProfessionalMessages from './pages/Professional/ProfessionalMessages';
import ProfessionalReports from './pages/Professional/ProfessionalReports';

// Organization Portal
import OrganizationLayout from './pages/Organization/OrganizationLayout';
import OrganizationDashboard from './pages/Organization/OrganizationDashboard';
import OrganizationMembers from './pages/Organization/OrganizationMembers';
import OrganizationInsights from './pages/Organization/OrganizationInsights';
import OrganizationResources from './pages/Organization/OrganizationResources';
import OrganizationResourceCreate from './pages/Organization/OrganizationResourceCreate';
import OrganizationResourceEdit from './pages/Organization/OrganizationResourceEdit';

// Context & Providers
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import CookieConsentBanner from './components/CookieConsentBanner';

import './styles/custom.css';

// ---- Layout wrappers ----
const PublicLayout = ({ children }) => <AppLayout>{children}</AppLayout>;

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <PublicLayout><Home /></PublicLayout> },
  { path: '/about', element: <PublicLayout><About /></PublicLayout> },
  { path: '/resources', element: <PublicLayout><Resources /></PublicLayout> },
  { path: '/resources/:id', element: <PublicLayout><ResourceDetail /></PublicLayout> },
  { path: '/quiz/:id', element: <PublicLayout><Quiz /></PublicLayout> },
  { path: '/assessments', element: <PublicLayout><Assessments /></PublicLayout> },
  { path: '/assessments/phq9', element: <PublicLayout><PHQ9 /></PublicLayout> },
  { path: '/assessments/gad7', element: <PublicLayout><GAD7 /></PublicLayout> },
  { path: '/assessments/stress', element: <PublicLayout><Stress /></PublicLayout> },
  { path: '/assessments/sleep', element: <PublicLayout><Sleep /></PublicLayout> },
  { path: '/assessments/burnout', element: <PublicLayout><Burnout /></PublicLayout> },
  { path: '/assessments/result', element: <PublicLayout><Result /></PublicLayout> },
  { path: '/find-help', element: <PublicLayout><FindHelp /></PublicLayout> },
  { path: '/professional/:id', element: <PublicLayout><ProfessionalProfile /></PublicLayout> },
  { path: '/contact', element: <PublicLayout><Contact /></PublicLayout> },
  { path: '/faq', element: <PublicLayout><FAQ /></PublicLayout> },
  { path: '/community', element: <PublicLayout><CommunityHome /></PublicLayout> },
  { path: '/community/post/:id', element: <PublicLayout><PostDetail /></PublicLayout> },
  { path: '/emergency', element: <PublicLayout><Emergency /></PublicLayout> },
  { path: '/get-started', element: <PublicLayout><GetStarted /></PublicLayout> },
  { path: '/terms', element: <PublicLayout><Terms /></PublicLayout> },
  { path: '/privacy-policy', element: <PublicLayout><PrivacyPolicy /></PublicLayout> },
  { path: '/cookie-policy', element: <PublicLayout><CookiePolicy /></PublicLayout> },
  { path: '/community-guidelines', element: <PublicLayout><CommunityGuidelines /></PublicLayout> },

  // Auth routes (no layout)
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/verify-email', element: <VerifyEmail /> },

  // Protected routes – each individually wrapped
  { path: '/dashboard', element: <ProtectedLayout><Dashboard /></ProtectedLayout> },
  { path: '/profile', element: <ProtectedLayout><Profile /></ProtectedLayout> },
  { path: '/mood-history', element: <ProtectedLayout><MoodHistory /></ProtectedLayout> },
  { path: '/journal', element: <ProtectedLayout><Journal /></ProtectedLayout> },
  { path: '/goals', element: <ProtectedLayout><Goals /></ProtectedLayout> },
  { path: '/safety-plan', element: <ProtectedLayout><SafetyPlan /></ProtectedLayout> },
  { path: '/habits', element: <ProtectedLayout><Habits /></ProtectedLayout> },
  { path: '/achievements', element: <ProtectedLayout><Achievements /></ProtectedLayout> },
  { path: '/reports', element: <ProtectedLayout><Reports /></ProtectedLayout> },
  { path: '/wellness', element: <ProtectedLayout><WellnessToolkit /></ProtectedLayout> },
  { path: '/wellness/breathing', element: <ProtectedLayout><Breathing /></ProtectedLayout> },
  { path: '/wellness/meditation', element: <ProtectedLayout><Meditation /></ProtectedLayout> },
  { path: '/wellness/grounding', element: <ProtectedLayout><Grounding /></ProtectedLayout> },
  { path: '/wellness/sounds', element: <ProtectedLayout><Sounds /></ProtectedLayout> },
  { path: '/wellness/timers', element: <ProtectedLayout><Timers /></ProtectedLayout> },
  { path: '/wellness/daily', element: <ProtectedLayout><DailyWellness /></ProtectedLayout> },
  { path: '/peer-support', element: <ProtectedLayout><PeerSupport /></ProtectedLayout> },
  { path: '/volunteer/dashboard', element: <ProtectedLayout><VolunteerDashboard /></ProtectedLayout> },
  { path: '/volunteer/requests', element: <ProtectedLayout><VolunteerRequests /></ProtectedLayout> },
  { path: '/volunteer/available', element: <ProtectedLayout><VolunteerAvailable /></ProtectedLayout> },
  { path: '/listener/dashboard', element: <ProtectedLayout><ListenerDashboard /></ProtectedLayout> },
  { path: 'settings', element: <ProtectedLayout><Settings /></ProtectedLayout> },

  // Admin Panel (nested)
  {
    path: '/admin',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'professionals', element: <AdminProfessionals /> },
      { path: 'volunteers', element: <AdminVolunteers /> },
      { path: 'organizations', element: <AdminOrganizations /> },
      { path: 'applications', element: <AdminApplications /> },
      { path: 'invitations', element: <AdminInvitations /> },
      { path: 'articles', element: <AdminArticles /> },
      { path: 'resources', element: <AdminResources /> },
      { path: 'resources/create', element: <AdminResourcesCreate /> },
      { path: 'resources/edit/:id', element: <AdminResourcesEdit /> },
      { path: 'appointments', element: <AdminAppointments /> },
      { path: 'community', element: <AdminCommunity /> },
      { path: 'peer-support', element: <AdminPeerSupport /> },
      { path: 'emergency-contacts', element: <AdminEmergencyContacts /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'logs', element: <AdminLogs /> },
      // WELLNESS ADMIN ROUTES
      { path: 'wellness/meditations', element: <AdminMeditations /> },
      { path: 'wellness/sounds', element: <AdminSounds /> },
    ],
  },

  // Professional Portal (nested)
  {
    path: '/professional',
    element: <ProtectedRoute><ProfessionalLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <ProfessionalDashboard /> },
      { path: 'appointments', element: <ProfessionalAppointments /> },
      { path: 'patients', element: <ProfessionalPatients /> },
      { path: 'patients/:patientId', element: <ProfessionalPatients /> },
      { path: 'messages', element: <ProfessionalMessages /> },
      { path: 'availability', element: <ProfessionalAvailability /> },
      { path: 'reports', element: <ProfessionalReports /> },
    ],
  },

  // Organization Portal (nested)
  {
    path: '/organization',
    element: <ProtectedRoute><OrganizationLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <OrganizationDashboard /> },
      { path: 'members', element: <OrganizationMembers /> },
      { path: 'insights', element: <OrganizationInsights /> },
      { path: 'resources', element: <OrganizationResources /> },
      { path: 'resources/create', element: <OrganizationResourceCreate /> },
      { path: 'resources/edit/:id', element: <OrganizationResourceEdit /> },
    ],
  },

  // 404 – catch-all route
  { path: '*', element: <PublicLayout><NotFound /></PublicLayout> },
]);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModalProvider>
          <div className="app-wrapper d-flex flex-column min-vh-100">
            <RouterProvider router={router} />
            <CookieConsentBanner />
          </div>
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;