import DashboardClient from './DashboardClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // La sesión se valida en el navegador (el token vive en localStorage/sessionStorage).
  return <DashboardClient>{children}</DashboardClient>;
}
