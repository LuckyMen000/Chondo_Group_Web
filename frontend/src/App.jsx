import { Route, Routes } from "react-router-dom";

import GlobalSeo from "./components/GlobalSeo";
import AnalyticsTracker from "./components/AnalyticsTracker";

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

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

export default App;