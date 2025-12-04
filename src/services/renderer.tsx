/**
 * PDF Renderer Service
 * Generates ATS-friendly PDF from tailored resume JSON with template support
 */

import type { Resume } from "@/src/types/resume"
import type { ResumeTemplate } from "@/src/types/template"

// ============================================
// PDF GENERATION HELPERS
// ============================================

interface PDFSection {
  title: string
  content: string[]
}

/**
 * Format resume data into sections for PDF
 */
function formatResumeForPDF(resume: Resume): PDFSection[] {
  const sections: PDFSection[] = []

  // Contact section
  const contactInfo = [resume.name, resume.email]
  if (resume.phone) contactInfo.push(resume.phone)
  sections.push({ title: "Contact", content: contactInfo })

  // Summary
  if (resume.summary) {
    sections.push({ title: "Summary", content: [resume.summary] })
  }

  // Skills
  if (resume.skills.length > 0) {
    sections.push({ title: "Skills", content: [resume.skills.join(" • ")] })
  }

  // Experience bullets grouped by section/company
  const bulletsBySection = new Map<string, string[]>()
  for (const bullet of resume.bullets) {
    const key = bullet.company ? `${bullet.section} - ${bullet.company}` : bullet.section
    if (!bulletsBySection.has(key)) {
      bulletsBySection.set(key, [])
    }
    const text = bullet.tailored_text || bullet.raw_text
    bulletsBySection.get(key)!.push(`• ${text}`)
  }

  for (const [sectionTitle, bullets] of bulletsBySection) {
    sections.push({ title: sectionTitle, content: bullets })
  }

  return sections
}

/**
 * Generate HTML version of resume with template support
 * @param resume - Resume data
 * @param template - Template style (defaults to "professional")
 */
export function generateResumeHTML(resume: Resume, template: ResumeTemplate = "professional"): string {
  const sections = formatResumeForPDF(resume)

  switch (template) {
    case "modern":
      return generateModernTemplate(resume, sections)
    case "minimalist":
      return generateMinimalistTemplate(resume, sections)
    case "professional":
    default:
      return generateProfessionalTemplate(resume, sections)
  }
}

/**
 * Professional template - Classic ATS-friendly format
 */
function generateProfessionalTemplate(resume: Resume, sections: PDFSection[]): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resume.name} - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #1a1a1a;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    .header {
      text-align: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #333;
    }
    .name {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .contact {
      font-size: 10pt;
      color: #444;
    }
    .section {
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      padding-bottom: 2px;
      border-bottom: 1px solid #999;
    }
    .section-content {
      padding-left: 0;
    }
    .bullet {
      margin-bottom: 4px;
      text-indent: -12px;
      padding-left: 12px;
    }
    .skills {
      font-size: 10pt;
    }
    .summary {
      font-style: italic;
      font-size: 10pt;
    }
    @media print {
      body {
        padding: 0.25in;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resume.name}</div>
    <div class="contact">
      ${resume.email}${resume.phone ? ` | ${resume.phone}` : ""}
    </div>
  </div>
  
  ${sections
    .slice(1)
    .map(
      (section) => `
    <div class="section">
      <div class="section-title">${section.title}</div>
      <div class="section-content ${section.title === "Skills" ? "skills" : ""} ${section.title === "Summary" ? "summary" : ""}">
        ${section.content
          .map((item) => (item.startsWith("•") ? `<div class="bullet">${item}</div>` : `<div>${item}</div>`))
          .join("")}
      </div>
    </div>
  `,
    )
    .join("")}
</body>
</html>
  `.trim()
}

/**
 * Modern template - Contemporary design with visual hierarchy
 */
function generateModernTemplate(resume: Resume, sections: PDFSection[]): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resume.name} - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #2c3e50;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
      background: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      margin: -0.5in -0.5in 20px -0.5in;
      text-align: center;
    }
    .name {
      font-size: 24pt;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .contact {
      font-size: 10pt;
      opacity: 0.95;
    }
    .section {
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 13pt;
      font-weight: 600;
      color: #667eea;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #667eea;
    }
    .section-content {
      padding-left: 8px;
    }
    .bullet {
      margin-bottom: 5px;
      text-indent: -14px;
      padding-left: 14px;
    }
    .skills {
      font-size: 10pt;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .skill-tag {
      background: #f0f4ff;
      color: #667eea;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 9pt;
    }
    .summary {
      font-size: 10pt;
      line-height: 1.6;
      color: #555;
    }
    @media print {
      body {
        padding: 0.25in;
      }
      .header {
        margin: -0.25in -0.25in 20px -0.25in;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resume.name}</div>
    <div class="contact">
      ${resume.email}${resume.phone ? ` | ${resume.phone}` : ""}
    </div>
  </div>
  
  ${sections
    .slice(1)
    .map((section) => {
      const isSkills = section.title === "Skills"
      const content = isSkills
        ? `<div class="skills">${section.content[0]?.split(" • ").map((skill) => `<span class="skill-tag">${skill}</span>`).join("") || ""}</div>`
        : section.content
            .map((item) => (item.startsWith("•") ? `<div class="bullet">${item}</div>` : `<div>${item}</div>`))
            .join("")

      return `
    <div class="section">
      <div class="section-title">${section.title}</div>
      <div class="section-content ${isSkills ? "skills" : ""} ${section.title === "Summary" ? "summary" : ""}">
        ${content}
      </div>
    </div>
  `
    })
    .join("")}
</body>
</html>
  `.trim()
}

/**
 * Minimalist template - Clean and simple
 */
function generateMinimalistTemplate(resume: Resume, sections: PDFSection[]): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resume.name} - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.6in;
      background: #ffffff;
    }
    .header {
      text-align: left;
      margin-bottom: 24px;
      padding-bottom: 8px;
    }
    .name {
      font-size: 18pt;
      font-weight: normal;
      margin-bottom: 6px;
      letter-spacing: 1px;
    }
    .contact {
      font-size: 9pt;
      color: #666;
      font-weight: normal;
    }
    .section {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: normal;
      text-transform: lowercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
      padding-bottom: 2px;
      border-bottom: 0.5px solid #ccc;
    }
    .section-content {
      padding-left: 0;
    }
    .bullet {
      margin-bottom: 3px;
      text-indent: -10px;
      padding-left: 10px;
    }
    .skills {
      font-size: 10pt;
      color: #333;
    }
    .summary {
      font-size: 10pt;
      line-height: 1.7;
      color: #444;
    }
    @media print {
      body {
        padding: 0.4in;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resume.name}</div>
    <div class="contact">
      ${resume.email}${resume.phone ? ` · ${resume.phone}` : ""}
    </div>
  </div>
  
  ${sections
    .slice(1)
    .map(
      (section) => `
    <div class="section">
      <div class="section-title">${section.title}</div>
      <div class="section-content ${section.title === "Skills" ? "skills" : ""} ${section.title === "Summary" ? "summary" : ""}">
        ${section.content
          .map((item) => (item.startsWith("•") ? `<div class="bullet">${item}</div>` : `<div>${item}</div>`))
          .join("")}
      </div>
    </div>
  `,
    )
    .join("")}
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version (for ATS systems that strip formatting)
 */
export function generateResumePlainText(resume: Resume): string {
  const lines: string[] = []

  // Header
  lines.push(resume.name.toUpperCase())
  lines.push(resume.email + (resume.phone ? ` | ${resume.phone}` : ""))
  lines.push("")

  // Summary
  if (resume.summary) {
    lines.push("SUMMARY")
    lines.push("-".repeat(40))
    lines.push(resume.summary)
    lines.push("")
  }

  // Skills
  if (resume.skills.length > 0) {
    lines.push("SKILLS")
    lines.push("-".repeat(40))
    lines.push(resume.skills.join(", "))
    lines.push("")
  }

  // Experience
  const bulletsBySection = new Map<string, string[]>()
  for (const bullet of resume.bullets) {
    const key = bullet.company ? `${bullet.section}: ${bullet.company}` : bullet.section
    if (!bulletsBySection.has(key)) {
      bulletsBySection.set(key, [])
    }
    bulletsBySection.get(key)!.push(bullet.tailored_text || bullet.raw_text)
  }

  for (const [section, bullets] of bulletsBySection) {
    lines.push(section.toUpperCase())
    lines.push("-".repeat(40))
    for (const bullet of bullets) {
      lines.push(`• ${bullet}`)
    }
    lines.push("")
  }

  return lines.join("\n")
}

/**
 * Server-side PDF generation using Puppeteer (for API route)
 * Note: This is a stub - actual implementation requires puppeteer on server
 */
export async function generatePDFBuffer(resume: Resume): Promise<Buffer> {
  // In production, use Puppeteer to render HTML to PDF:
  /*
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const html = generateResumeHTML(resume);
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
  });
  await browser.close();
  return Buffer.from(pdfBuffer);
  */

  // Stub: Return HTML as buffer for now
  const html = generateResumeHTML(resume, "professional")
  return Buffer.from(html, "utf-8")
}

// ============================================
// CLIENT-SIDE PDF GENERATION
// ============================================

/**
 * Generate PDF in browser using html2canvas + jsPDF
 * Call this from frontend with the resume data
 */
export function getClientPDFScript(): string {
  return `
    async function generatePDF(resume) {
      // Import libraries dynamically
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      
      // Create temporary container with resume HTML
      const container = document.createElement('div');
      container.innerHTML = generateResumeHTML(resume);
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '8.5in';
      document.body.appendChild(container);
      
      // Render to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      // Create PDF
      const pdf = new jsPDF('p', 'in', 'letter');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Cleanup
      document.body.removeChild(container);
      
      // Download
      pdf.save(\`\${resume.name.replace(/\\s+/g, '_')}_Resume.pdf\`);
    }
  `
}
