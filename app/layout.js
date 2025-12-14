import './globals.css'

export const metadata = {
  title: 'Miguel AI - Interactive Resume',
  description: 'Talk to my AI-powered resume assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}