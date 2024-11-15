import { Suspense } from 'react'; 
import Grade from '@/components/Grade'

export default function GradesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <Grade/>
        </Suspense>
    )
}
