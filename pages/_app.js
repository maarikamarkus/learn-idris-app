import '../styles/globals.css';
import 'tailwindcss/tailwind.css';

export default function App({ Component, pageProps }) {
  if (typeof window !== 'undefined') {
    require('tw-elements');
  }

  return <Component {...pageProps} />
}

