// CV Parser utility for extracting data from uploaded documents
// Uses PDF.js for PDF parsing and basic text extraction

interface ParsedCV {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  education: Array<{
    school: string;
    degree: string;
    field: string;
    dates?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    location?: string;
    dates?: string;
    description?: string;
  }>;
  rawText: string;
}

// Email regex pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Phone regex patterns (international)
const PHONE_REGEX = /(?:\+?[0-9]{1,4}[-.\s]?)?(?:\(?[0-9]{2,4}\)?[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g;

// Common section headers
const SECTION_HEADERS = {
  experience: /(?:work\s+)?experience|employment|work\s+history/i,
  education: /education|academic|qualifications/i,
  skills: /skills|expertise|competencies|proficiencies/i,
  summary: /summary|objective|profile|about\s+me/i,
};

export const parseCV = async (file: File): Promise<ParsedCV> => {
  const text = await extractTextFromFile(file);
  return parseTextToCV(text);
};

const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  
  if (fileType === "application/pdf") {
    return extractTextFromPDF(file);
  } else if (fileType === "text/plain") {
    return file.text();
  } else if (
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // For Word documents, we'll extract basic text
    // In production, you might use a library like mammoth.js
    return extractTextFromDoc(file);
  }
  
  throw new Error("Unsupported file type. Please upload a PDF, DOC, or TXT file.");
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  // Using pdf.js worker from CDN
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }
  
  return fullText;
};

const extractTextFromDoc = async (file: File): Promise<string> => {
  // Basic text extraction from doc files
  // For better results, consider using mammoth.js
  const text = await file.text();
  // Clean up binary data and extract readable text
  return text.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
};

const parseTextToCV = (text: string): ParsedCV => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  
  // Extract contact info
  const emails = text.match(EMAIL_REGEX) || [];
  const phones = text.match(PHONE_REGEX) || [];
  
  // Try to extract name (usually first line or first substantial text)
  let fullName = "";
  for (const line of lines.slice(0, 5)) {
    // Name usually doesn't contain special characters, numbers, or common words
    if (
      line.length > 3 &&
      line.length < 50 &&
      !line.includes("@") &&
      !line.match(/\d{4}/) &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum")
    ) {
      fullName = line;
      break;
    }
  }
  
  // Extract skills
  const skills = extractSection(text, SECTION_HEADERS.skills);
  const skillsList = skills
    ? extractListItems(skills)
    : extractSkillsFromText(text);
  
  // Extract education
  const educationText = extractSection(text, SECTION_HEADERS.education);
  const education = educationText ? parseEducation(educationText) : [];
  
  // Extract experience
  const experienceText = extractSection(text, SECTION_HEADERS.experience);
  const experience = experienceText ? parseExperience(experienceText) : [];
  
  // Extract summary
  const summaryText = extractSection(text, SECTION_HEADERS.summary);
  
  // Try to extract location
  const locationMatch = text.match(/(?:location|address|city):\s*([^\n]+)/i);
  const location = locationMatch ? locationMatch[1].trim() : undefined;
  
  return {
    fullName: fullName || undefined,
    email: emails[0] || undefined,
    phone: phones[0] || undefined,
    location,
    summary: summaryText?.slice(0, 500) || undefined,
    skills: skillsList.slice(0, 20),
    education,
    experience,
    rawText: text,
  };
};

const extractSection = (text: string, headerRegex: RegExp): string | null => {
  const lines = text.split("\n");
  let inSection = false;
  let sectionContent: string[] = [];
  
  for (const line of lines) {
    if (headerRegex.test(line)) {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      // Check if we've hit another section header
      const isNewSection = Object.values(SECTION_HEADERS).some(
        (regex) => regex !== headerRegex && regex.test(line)
      );
      
      if (isNewSection) {
        break;
      }
      
      sectionContent.push(line);
    }
  }
  
  return sectionContent.length > 0 ? sectionContent.join("\n").trim() : null;
};

const extractListItems = (text: string): string[] => {
  // Split by common delimiters
  const items = text
    .split(/[,;•\-\n|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 50);
  
  return [...new Set(items)];
};

const extractSkillsFromText = (text: string): string[] => {
  // Common technical and soft skills to look for
  const commonSkills = [
    "javascript", "python", "java", "react", "node.js", "sql", "excel",
    "communication", "leadership", "teamwork", "problem-solving",
    "project management", "data analysis", "microsoft office", "marketing",
    "sales", "customer service", "accounting", "finance", "html", "css",
    "photoshop", "illustrator", "management", "negotiation", "presentation"
  ];
  
  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const skill of commonSkills) {
    if (lowerText.includes(skill)) {
      foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }
  
  return foundSkills;
};

const parseEducation = (text: string): ParsedCV["education"] => {
  const entries: ParsedCV["education"] = [];
  const lines = text.split("\n").filter(Boolean);
  
  // Common degree patterns
  const degreePatterns = [
    /(?:bachelor|b\.?s\.?|b\.?a\.?|bsc|ba)/i,
    /(?:master|m\.?s\.?|m\.?a\.?|msc|mba)/i,
    /(?:phd|doctorate|ph\.?d\.?)/i,
    /(?:diploma|certificate|certification)/i,
    /(?:high school|secondary|ssce|waec)/i,
  ];
  
  let currentEntry: Partial<ParsedCV["education"][0]> = {};
  
  for (const line of lines) {
    // Check if this line contains a degree
    const hasDegree = degreePatterns.some((p) => p.test(line));
    
    if (hasDegree) {
      if (currentEntry.degree) {
        entries.push(currentEntry as ParsedCV["education"][0]);
        currentEntry = {};
      }
      currentEntry.degree = line;
    } else if (line.length > 5) {
      if (!currentEntry.school) {
        currentEntry.school = line;
      } else if (!currentEntry.field) {
        currentEntry.field = line;
      }
    }
  }
  
  if (currentEntry.degree || currentEntry.school) {
    entries.push({
      school: currentEntry.school || "",
      degree: currentEntry.degree || "",
      field: currentEntry.field || "",
    });
  }
  
  return entries;
};

const parseExperience = (text: string): ParsedCV["experience"] => {
  const entries: ParsedCV["experience"] = [];
  const lines = text.split("\n").filter(Boolean);
  
  // Date patterns
  const datePattern = /\d{4}|present|current/i;
  
  let currentEntry: Partial<ParsedCV["experience"][0]> = {};
  let descriptionLines: string[] = [];
  
  for (const line of lines) {
    const hasDate = datePattern.test(line);
    
    if (hasDate && currentEntry.position) {
      if (descriptionLines.length > 0) {
        currentEntry.description = descriptionLines.join(" ").slice(0, 500);
      }
      entries.push(currentEntry as ParsedCV["experience"][0]);
      currentEntry = {};
      descriptionLines = [];
    }
    
    if (!currentEntry.position && line.length > 3 && line.length < 100) {
      currentEntry.position = line;
    } else if (!currentEntry.company && line.length > 3 && line.length < 100) {
      currentEntry.company = line;
    } else if (line.length > 10) {
      descriptionLines.push(line);
    }
  }
  
  if (currentEntry.position || currentEntry.company) {
    if (descriptionLines.length > 0) {
      currentEntry.description = descriptionLines.join(" ").slice(0, 500);
    }
    entries.push({
      company: currentEntry.company || "",
      position: currentEntry.position || "",
      description: currentEntry.description,
    });
  }
  
  return entries;
};

export default parseCV;
