import { readFileSync } from 'fs'
import { join } from 'path'
import Script from 'next/script'

export default function RecruitmentPage() {
  const html = readFileSync(join(process.cwd(), 'app/_body.html'), 'utf-8')
  return (
    <>
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/js/recruitment.js" strategy="afterInteractive" />
    </>
  )
}
