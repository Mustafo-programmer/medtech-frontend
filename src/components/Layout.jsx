import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useOnline } from '../hooks/useOnline';

export default function Layout() {
  useOnline();

  return (
    <div className="flex h-screen overflow-hidden" style={{background:'#0f1117'}}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-7">
        <Outlet />
      </main>
    </div>
  );
}