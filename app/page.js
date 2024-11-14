import { Suspense } from 'react';  
import Login from '@/components/Login';
import Register from '@/components/Register';

export default function HomePage() {
  return (
    <div className="homepage">

        <Login />

    </div>
  );
}
