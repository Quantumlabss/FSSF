import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Tactics from './pages/Tactics';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Roster from './pages/Roster';
import Ranks from './pages/Ranks';
import Apply from './pages/Apply';
import Gallery from './pages/Gallery';
import AARList from './pages/AARList';
import AARDetail from './pages/AARDetail';
import AAREditor from './pages/AAREditor';
import LoginCallback from './pages/LoginCallback';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminApplications from './pages/admin/AdminApplications';
import AdminRoster from './pages/admin/AdminRoster';
import AdminPromotions from './pages/admin/AdminPromotions';

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/tactics" element={<Tactics />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/ranks" element={<Ranks />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/aars" element={<AARList />} />
          <Route path="/aars/:id" element={<AARDetail />} />
          <Route path="/auth/callback" element={<LoginCallback />} />

          <Route path="/aars/new" element={<ProtectedRoute role="nco"><AAREditor /></ProtectedRoute>} />
          <Route path="/aars/:id/edit" element={<ProtectedRoute role="nco"><AAREditor /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute role="nco"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute role="nco"><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute role="nco"><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/roster" element={<ProtectedRoute role="nco"><AdminRoster /></ProtectedRoute>} />
          <Route path="/admin/promotions" element={<ProtectedRoute role="nco"><AdminPromotions /></ProtectedRoute>} />

          <Route path="*" element={<div className="container py-5"><h1>404</h1><p>Page not found.</p></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
