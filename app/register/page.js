import { Suspense } from 'react'; 
import Register from '@/components/Register'

export default function HomePage() {
    return (
    <div className="homepage">
    <Suspense fallback={<div>Loading...</div>}>
        <Register />
    </Suspense>
    </div>
  );
}