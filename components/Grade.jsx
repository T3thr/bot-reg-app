import { getServerSession } from 'next-auth/next'
import { options } from '@/app/api/auth/[...nextauth]/options'; // Import session handling options

import styles from './Grade.module.css';

export default async function Grade() {
    const session = await getServerSession(options)

  // Fetch grades using the session's lineUserId
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkgrade?lineUserId=${session.user.id}`);
  const data = await res.json();

  if (!data.success) {
    return (
      <div className={styles.error}>
        <p>{data.error || 'Failed to fetch grades.'}</p>
      </div>
    );
  }

  const grades = data.grades;

  return (
    <div className={styles.gradesContainer}>
      <h1>Grade Results</h1>
      <pre>{JSON.stringify(grades, null, 2)}</pre>
    </div>
  );
}
