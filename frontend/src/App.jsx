import { Route, Routes } from "react-router-dom";

import GlobalSeo from "./components/GlobalSeo";
import AnalyticsTracker from "./components/AnalyticsTracker";
import RouteScroll from "./components/RouteScroll";

import Header from "./components/Header";
import Hero from "./components/Hero";
import ClientsMarquee from "./components/ClientsMarquee";
import About from "./components/About";
import Services from "./components/Services";
import Cases from "./components/Cases";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";

import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import ServicePage from "./pages/ServicePage";
import NotFoundPage from "./pages/NotFoundPage";

function HomePage() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <ClientsMarquee />
        <About />
        <Services />
        <Cases />
        <ContactForm />
      </main>

      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="app">
      <GlobalSeo />
      <AnalyticsTracker />
      <RouteScroll />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;