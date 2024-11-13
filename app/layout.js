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
      <script charset="utf-8" src="https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js"></script>
      <body>

        {children}

      </body>
    </html>
  );
}
