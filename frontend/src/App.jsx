import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/PublicLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import CropHealth from "./pages/CropHealth";
import AgroProcessing from "./pages/AgroProcessing";
import DistributionNetwork from "./pages/DistributionNetwork";
import DealerList from "./pages/DealerList";
import DealerDetail from "./pages/DealerDetail";
import SalesOfficer from "./pages/SalesOfficer";
import SalesOfficerDetail from "./pages/SalesOfficerDetail";
import Gallery from "./pages/Gallery";
import Photo from "./pages/Photo";
import Videos from "./pages/Videos";
import Career from "./pages/Career";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBanners from "./pages/admin/ManageBanners";
import ManageDealers from "./pages/admin/ManageDealers";
import ManageDistributors from "./pages/admin/ManageDistributors";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageGallery from "./pages/admin/ManageGallery";
import ManageCareerApplications from "./pages/admin/ManageCareerApplications";
import ManageMessages from "./pages/admin/ManageMessages";
import AdminSettings from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/crop-health" element={<CropHealth />} />
            <Route path="/products/agro-processing" element={<AgroProcessing />} />
            <Route path="/network" element={<DistributionNetwork />} />
            <Route path="/network/dealers" element={<DealerList />} />
            <Route path="/network/dealers/:id" element={<DealerDetail />} />
            <Route path="/network/sales-officers" element={<SalesOfficer />} />
            <Route path="/network/sales-officers/:id" element={<SalesOfficerDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/photos" element={<Photo />} />
            <Route path="/gallery/videos" element={<Videos />} />
            <Route path="/career" element={<Career />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin panel */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="banners" element={<ManageBanners />} />
            <Route path="dealers" element={<ManageDealers />} />
            <Route path="distributors" element={<ManageDistributors />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="gallery" element={<ManageGallery />} />
            <Route path="career-applications" element={<ManageCareerApplications />} />
            <Route path="messages" element={<ManageMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
