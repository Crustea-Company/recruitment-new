import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crustea Recruitment System',
  description: 'Portal Rekrutmen Crustea Indonesia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
        <link rel="stylesheet" href="/js/recruitment.css" />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"
          defer
        />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
          defer
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
