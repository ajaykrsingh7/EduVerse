import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/UI/Navbar/Navbar";
import Footer from "./components/UI/Footer/Footer";
import "./assets/global.css";

//Pages
import HomePage from "./pages/HomePage";
import { LoginPage, RegisterPage } from "../src/pages/Auth/AuthPages";
import CoursesPage from "./pages/Course/CoursesPage";
import CourseDetailPage from "./pages/Course/CourseDetailPage";
import { MentorsPage, MentorDetailPage } from "./pages/Mentors/MentorPages";
import {
  ShopPage,
  PricingPage,
  BecomeMentorPage,
} from "./pages/Shop/ShopPages";
import AdminPages from "./pages/Admin/AdminPages";
import CheckoutPage from "./pages/CheckoutPage";
import BookDetailPage from "./pages/Shop/BookDetailPage";
import FreeCoursesPage from "./pages/FreeCourses/FreeCoursesPage";
import LearnCoursePage from "./pages/FreeCourses/LearnCoursePage";
import MentorDashboard from "./pages/Mentors/MentorDashboard";
import MyEnrollmentsPage from "./pages/Dashboard/MyEnrollmentsPage";
import ProfilePage from "./pages/Dashboard/ProfilePage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

// Layout wrapper (Navbar + Footer)
const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

// Auth layout (no footer/navbar chrome)
const AuthLayout = ({ children }) => <main>{children}</main>;

const HomeOrAdmin = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === "admin") return <AdminPages />;
  if (user?.role === "mentor") return <MentorDashboard />;
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
};

// Route guard
const ProtectedMentor = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "mentor") return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomeOrAdmin />} />

    <Route
      path="/courses"
      element={
        <Layout>
          <CoursesPage />
        </Layout>
      }
    />
    <Route
      path="/courses/:id"
      element={
        <Layout>
          <CourseDetailPage />
        </Layout>
      }
    />
    <Route
      path="/mentors"
      element={
        <Layout>
          <MentorsPage />
        </Layout>
      }
    />
    <Route
      path="/mentors/:id"
      element={
        <Layout>
          <MentorDetailPage />
        </Layout>
      }
    />
    <Route
      path="/shop"
      element={
        <Layout>
          <ShopPage />
        </Layout>
      }
    />

    <Route
      path="/shop/books/:id"
      element={
        <Layout>
          <BookDetailPage />
        </Layout>
      }
    />

    <Route
      path="/pricing"
      element={
        <Layout>
          <PricingPage />
        </Layout>
      }
    />
    <Route
      path="/become-a-mentor"
      element={
        <Layout>
          <BecomeMentorPage />
        </Layout>
      }
    />

    <Route
      path="/learn"
      element={
        <Layout>
          <FreeCoursesPage />
        </Layout>
      }
    />

    <Route path="/learn/:courseId" element={<LearnCoursePage />} />

    <Route
      path="/mentor/*"
      element={
        <ProtectedMentor>
          <MentorDashboard />
        </ProtectedMentor>
      }
    />

    <Route
      path="/my-learning"
      element={
        <Layout>
          <MyEnrollmentsPage />
        </Layout>
      }
    />
    <Route
      path="/profile"
      element={
        <Layout>
          <ProfilePage />
        </Layout>
      }
    />

    {/* Auth pages – no layout */}
    <Route
      path="/login"
      element={
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      }
    />
    <Route
      path="/register"
      element={
        <AuthLayout>
          <RegisterPage />
        </AuthLayout>
      }
    />
    <Route path="/checkout" element={<CheckoutPage />} />

    {/* 404 fallback */}
    <Route
      path="*"
      element={
        <Layout>
          <NotFoundPage />
        </Layout>
      }
    />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
