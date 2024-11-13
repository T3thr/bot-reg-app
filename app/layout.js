import "./globals.css";
import mongodbConnect from '@/backend/lib/mongodb'

export const metadata = {
  title: "REG-BOT",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }) {
  await mongodbConnect()
  return (
    <html lang="en">
      <body>

        {children}

      </body>
    </html>
  );
}
