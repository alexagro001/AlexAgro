import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";
import ScrollProgress from "./ScrollProgress";
import useScrollReveal from "../utils/useScrollReveal";

export default function PublicLayout() {
  const { pathname } = useLocation();
  useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
