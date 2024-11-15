import { options } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import mongodbConnect from '@/backend/lib/mongodb';
import GradeState from '@/backend/models/GradeState';
import styles from './Grade.module.css';

export default async function Grade({ searchParams }) {
  const { lineUserId } = searchParams || {};

  if (!lineUserId) {
    return (
      <div className={styles.error}>
        <p>No LINE User ID provided.</p>
      </div>
    );
  }

  try {
    // Establish MongoDB connection
    await mongodbConnect();

    // Validate session for LINE user
    const session = await getServerSession(options);
    if (!session || session.user.id !== lineUserId) {
      return (
        <div className={styles.error}>
          <p>Unauthorized or invalid LINE User session.</p>
        </div>
      );
    }

    // Fetch grades from MongoDB
    const gradeData = await GradeState.findOne({ lineUserId }).lean();
    if (!gradeData) {
      return (
        <div className={styles.error}>
          <p>No grade data available for this user.</p>
        </div>
      );
    }

    // Render grades
    return (
      <div className={styles.gradesContainer}>
        <h1>Grade Results</h1>
        <pre>{JSON.stringify(gradeData.grades, null, 2)}</pre>
      </div>
    );
  } catch (error) {
    console.error('Error fetching grades:', error);
    return (
      <div className={styles.error}>
        <p>An error occurred while fetching grades.</p>
      </div>
    );
  }
}
