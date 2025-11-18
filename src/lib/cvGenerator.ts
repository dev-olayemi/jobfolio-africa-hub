/**
 * CV Generator - Creates a professional CV PDF using browser canvas/print API
 * Falls back to HTML print for compatibility
 */

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  skills?: string[];
  education?: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  experience?: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
}

export function generateCVHTML(data: CVData): string {
  const formatDate = (date: string) => {
    if (!date) return "";
    const [year, month] = date.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[parseInt(month) - 1] || ""}${year ? ` ${year}` : ""}`;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.personalInfo.fullName} - CV</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          
          @page {
            size: A4;
            margin: 20px;
          }
          
          .cv-container {
            max-width: 8.5in;
            height: 11in;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          
          .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          
          .name {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
          }
          
          .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 12px;
            color: #666;
          }
          
          .contact-info span {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .summary {
            font-size: 13px;
            line-height: 1.5;
            color: #555;
            margin-top: 15px;
            font-style: italic;
          }
          
          .section {
            margin-bottom: 20px;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e40af;
            background: #f0f9ff;
            padding: 8px 12px;
            margin-bottom: 12px;
            border-left: 4px solid #2563eb;
          }
          
          .entry {
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          
          .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 4px;
          }
          
          .entry-title {
            font-weight: bold;
            font-size: 13px;
            color: #1f2937;
          }
          
          .entry-date {
            font-size: 11px;
            color: #999;
          }
          
          .entry-subtitle {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .entry-description {
            font-size: 12px;
            color: #555;
            line-height: 1.4;
            margin-top: 4px;
          }
          
          .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .skill-tag {
            background: #e0e7ff;
            color: #3730a3;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            border: 1px solid #c7d2fe;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            color: #999;
            text-align: center;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .cv-container {
              margin: 0;
              max-width: 100%;
              height: auto;
              padding: 20px;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- Header -->
          <div class="header">
            <div class="name">${data.personalInfo.fullName}</div>
            <div class="contact-info">
              ${
                data.personalInfo.email
                  ? `<span>📧 ${data.personalInfo.email}</span>`
                  : ""
              }
              ${
                data.personalInfo.phone
                  ? `<span>📱 ${data.personalInfo.phone}</span>`
                  : ""
              }
              ${
                data.personalInfo.location
                  ? `<span>📍 ${data.personalInfo.location}</span>`
                  : ""
              }
            </div>
            ${
              data.personalInfo.summary
                ? `<div class="summary">${data.personalInfo.summary.substring(
                    0,
                    200
                  )}</div>`
                : ""
            }
          </div>
          
          <!-- Skills Section -->
          ${
            data.skills && data.skills.length > 0
              ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="skills-container">
                ${data.skills
                  .map((skill) => `<span class="skill-tag">${skill}</span>`)
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          
          <!-- Experience Section -->
          ${
            data.experience && data.experience.length > 0
              ? `
            <div class="section">
              <div class="section-title">Professional Experience</div>
              ${data.experience
                .map(
                  (exp) => `
                <div class="entry">
                  <div class="entry-header">
                    <div>
                      <div class="entry-title">${exp.position}</div>
                      <div class="entry-subtitle">${exp.company}${
                    exp.location ? ` • ${exp.location}` : ""
                  }</div>
                    </div>
                    <div class="entry-date">${formatDate(exp.startDate)} ${
                    exp.current ? "- Present" : `- ${formatDate(exp.endDate)}`
                  }</div>
                  </div>
                  ${
                    exp.description
                      ? `<div class="entry-description">${exp.description}</div>`
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          
          <!-- Education Section -->
          ${
            data.education && data.education.length > 0
              ? `
            <div class="section">
              <div class="section-title">Education</div>
              ${data.education
                .map(
                  (edu) => `
                <div class="entry">
                  <div class="entry-header">
                    <div>
                      <div class="entry-title">${edu.degree} in ${
                    edu.field
                  }</div>
                      <div class="entry-subtitle">${edu.school}</div>
                    </div>
                    <div class="entry-date">${formatDate(edu.startDate)} ${
                    edu.current ? "- Present" : `- ${formatDate(edu.endDate)}`
                  }</div>
                  </div>
                  ${
                    edu.description
                      ? `<div class="entry-description">${edu.description}</div>`
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          
          <!-- Footer -->
          <div class="footer">
            Generated by JobFolio • ${new Date().toLocaleDateString()}
          </div>
        </div>
      </body>
    </html>
  `;
}

export function downloadCVPDF(data: CVData): void {
  const htmlContent = generateCVHTML(data);
  const fileName = `${data.personalInfo.fullName.replace(
    /\s+/g,
    "_"
  )}_CV_${new Date().getFullYear()}.pdf`;

  // Method 1: Use print API to save as PDF (works in most browsers)
  const printWindow = window.open("", "", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Auto-trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

export function downloadCVAsHTML(data: CVData): void {
  const htmlContent = generateCVHTML(data);
  const fileName = `${data.personalInfo.fullName.replace(
    /\s+/g,
    "_"
  )}_CV_${new Date().getFullYear()}.html`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
