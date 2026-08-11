import "./globals.css";

export const metadata = {
  title: "Platform A | AgriTrade Alpha Terminal",
  description: "Simulated market-data platform for commodities pricing with TZS and USD values."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
