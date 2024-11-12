'use client';

import { useSession } from 'next-auth/react';

export default function Profile() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Welcome, {session?.user?.displayName}</h1>
      <img src={session?.user?.pictureUrl} alt="Profile Picture" />
      <p>{session?.user?.statusMessage}</p>
      
      {/* Display the invite URL to add the LINE OA */}
      <h2>Invite to Add LINE Official Account</h2>
      <p>
        <a href={session?.lineInviteUrl} target="_blank" rel="noopener noreferrer">
          Click here to add our LINE Official Account
        </a>
      </p>
    </div>
  );
}
