import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import ProductUpload from "./pages/ProductUpload";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";
import TryOn from "./pages/TryOn";
import AdminBookings from "./pages/AdminBookings";
import BookingAnalytics from "./pages/BookingAnalytics";
import UserBookings from "./pages/UserBookings";
import ArtistProfile from "./pages/ArtistProfile";
import UploadWork from "./pages/UploadWork";
import ArtistBookings from "./pages/ArtistBookings";
import AdminProducts from "./pages/AdminProducts";
import ArtistList from "./pages/ArtistList";
import AdminUsers from "./pages/AdminUsers";
import AdminArtists from "./pages/AdminArtists";
import { appBackgroundStyle } from "./utils/uiTheme";

function App() {
  return (
    <BrowserRouter>
      <div
        className="app-bg-gradient min-h-screen text-slate-100 relative overflow-x-hidden font-body"
        style={appBackgroundStyle}
      >
        <div className="app-backdrop-grid" />
        <div className="app-backdrop-vignette" />
        <div className="bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        <div className="relative z-10 w-full min-h-screen">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/artist" element={<ArtistDashboard />} />
            <Route path="/upload" element={<ProductUpload />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/artists-list" element={<ArtistList />} />
            <Route path="/tryon" element={<TryOn />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin-bookings" element={<AdminBookings />} />
            <Route path="/admin-products" element={<AdminProducts />} />
            <Route path="/analytics" element={<BookingAnalytics />} />
            <Route path="/admin-users" element={<AdminUsers />} />
            <Route path="/admin-artists" element={<AdminArtists />} />
            <Route path="/my-bookings" element={<UserBookings />} />
            <Route path="/artist-profile" element={<ArtistProfile />} />
            <Route path="/upload-work" element={<UploadWork />} />
            <Route path="/artist-bookings" element={<ArtistBookings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
