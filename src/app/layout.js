import "./globals.css";

export const metadata = {
  title: "Vishesh Academy of Commerce - Finance Portal",
  description: "Enterprise-grade financial ledger and administration system for Vishesh Academy.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
