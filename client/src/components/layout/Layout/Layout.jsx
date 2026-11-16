import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from '../AnnouncementBar/AnnouncementBar';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

/** Struktura e faqeve publike: njoftim + header + përmbajtja + footer */
export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a href="#main" className="visually-hidden">Kalo te përmbajtja</a>
      <AnnouncementBar />
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
    </>
  );
}
