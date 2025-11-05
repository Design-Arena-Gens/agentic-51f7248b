import './globals.css';
import { Bebas_Neue, Montserrat } from 'next/font/google';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata = {
  title: 'Mumbai Local News ? Insta Post Generator',
  description: 'Fetches latest verified Mumbai news and renders an Instagram-ready post.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bebas.variable} ${montserrat.variable}`}>{children}</body>
    </html>
  );
}
