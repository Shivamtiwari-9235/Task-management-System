import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Team Task Board',
  description: 'Manage projects and tasks with your team',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}