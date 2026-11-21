import Navbar from '../components/Navbar/index';
import Footer from '../components/Footer/Footer';
import LandingGuard from './LandingGuard';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingGuard>
      <Navbar />
      {children}
      <Footer />
    </LandingGuard>
  );
}
