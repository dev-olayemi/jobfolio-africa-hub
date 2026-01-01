/**
 * CV Parser - Extracts structured data from CV text
 * Supports TXT files directly, PDF/DOC files show guidance
 */

export interface ParsedCVData {
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
}

// Email regex pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Phone regex patterns (various formats)
const PHONE_REGEX = /(?:\+?[\d\s\-().]{10,20})/g;

// Common skill keywords to look for
const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
  'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'git', 'github', 'gitlab', 'jira', 'agile', 'scrum',
  'excel', 'word', 'powerpoint', 'photoshop', 'figma', 'sketch',
  'communication', 'leadership', 'teamwork', 'problem-solving', 'analytical',
  'marketing', 'sales', 'accounting', 'finance', 'management',
  'customer service', 'data analysis', 'project management',
];

// Education keywords
const EDUCATION_KEYWORDS = ['university', 'college', 'school', 'institute', 'academy', 'bachelor', 'master', 'phd', 'diploma', 'certificate', 'degree', 'bsc', 'msc', 'mba', 'b.sc', 'm.sc'];

// Experience keywords
const EXPERIENCE_KEYWORDS = ['experience', 'work history', 'employment', 'professional experience', 'career'];

function extractEmail(text: string): string | undefined {
  const matches = text.match(EMAIL_REGEX);
  return matches?.[0];
}

function extractPhone(text: string): string | undefined {
  const matches = text.match(PHONE_REGEX);
  if (matches) {
    // Filter to get most likely phone numbers (10+ digits)
    const validPhones = matches.filter(p => p.replace(/\D/g, '').length >= 10);
    return validPhones[0]?.trim();
  }
  return undefined;
}

function extractName(text: string): string | undefined {
  const lines = text.split('\n').filter(line => line.trim());
  // First non-empty line is often the name
  const firstLine = lines[0]?.trim();
  
  // Check if it looks like a name (2-4 words, no special characters except spaces)
  if (firstLine && /^[A-Za-z\s'-]{2,50}$/.test(firstLine)) {
    const words = firstLine.split(/\s+/);
    if (words.length >= 2 && words.length <= 5) {
      return firstLine;
    }
  }
  
  return undefined;
}

function extractSkills(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundSkills: string[] = [];
  
  // Look for skills section
  const skillsSectionMatch = lowerText.match(/skills[:\s]*([\s\S]*?)(?=\n\n|experience|education|$)/i);
  const skillsSection = skillsSectionMatch?.[1] || lowerText;
  
  // Find matching skills
  for (const skill of COMMON_SKILLS) {
    if (skillsSection.includes(skill.toLowerCase())) {
      // Capitalize properly
      foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }
  
  // Also look for comma or bullet separated items in skills section
  if (skillsSectionMatch) {
    const items = skillsSectionMatch[1]
      .split(/[,•\-\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 30);
    
    for (const item of items) {
      if (!foundSkills.find(s => s.toLowerCase() === item.toLowerCase())) {
        foundSkills.push(item);
      }
    }
  }
  
  return foundSkills.slice(0, 15); // Limit to 15 skills
}

function extractEducation(text: string): ParsedCVData['education'] {
  const education: ParsedCVData['education'] = [];
  const lines = text.split('\n');
  
  let inEducationSection = false;
  let currentEntry: Partial<ParsedCVData['education'][0]> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    
    // Check if entering education section
    if (line.includes('education') && line.length < 30) {
      inEducationSection = true;
      continue;
    }
    
    // Check if leaving education section
    if (inEducationSection && EXPERIENCE_KEYWORDS.some(k => line.includes(k))) {
      inEducationSection = false;
      if (currentEntry.school) {
        education.push({
          school: currentEntry.school || '',
          degree: currentEntry.degree || '',
          field: currentEntry.field || '',
          dates: currentEntry.dates,
        });
      }
      break;
    }
    
    if (inEducationSection && lines[i].trim()) {
      const originalLine = lines[i].trim();
      
      // Look for institution names
      if (EDUCATION_KEYWORDS.some(k => line.includes(k))) {
        if (currentEntry.school) {
          education.push({
            school: currentEntry.school || '',
            degree: currentEntry.degree || '',
            field: currentEntry.field || '',
            dates: currentEntry.dates,
          });
          currentEntry = {};
        }
        
        // Try to determine if this is school or degree
        if (['university', 'college', 'school', 'institute', 'academy'].some(k => line.includes(k))) {
          currentEntry.school = originalLine;
        } else {
          currentEntry.degree = originalLine;
        }
      }
      
      // Look for dates
      const dateMatch = originalLine.match(/\d{4}\s*[-–]\s*(?:\d{4}|present|current)/i);
      if (dateMatch) {
        currentEntry.dates = dateMatch[0];
      }
    }
  }
  
  // Add last entry
  if (currentEntry.school) {
    education.push({
      school: currentEntry.school || '',
      degree: currentEntry.degree || '',
      field: currentEntry.field || '',
      dates: currentEntry.dates,
    });
  }
  
  return education;
}

function extractExperience(text: string): ParsedCVData['experience'] {
  const experience: ParsedCVData['experience'] = [];
  const lines = text.split('\n');
  
  let inExperienceSection = false;
  let currentEntry: Partial<ParsedCVData['experience'][0]> = {};
  let descriptionLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    
    // Check if entering experience section
    if (EXPERIENCE_KEYWORDS.some(k => line.includes(k)) && line.length < 40) {
      inExperienceSection = true;
      continue;
    }
    
    // Check if leaving experience section
    if (inExperienceSection && (line.includes('education') || line.includes('skills') || line.includes('references'))) {
      if (currentEntry.company || currentEntry.position) {
        currentEntry.description = descriptionLines.join(' ').trim();
        experience.push({
          company: currentEntry.company || '',
          position: currentEntry.position || '',
          location: currentEntry.location,
          dates: currentEntry.dates,
          description: currentEntry.description,
        });
      }
      break;
    }
    
    if (inExperienceSection && lines[i].trim()) {
      const originalLine = lines[i].trim();
      
      // Look for dates - this often indicates a new entry
      const dateMatch = originalLine.match(/\d{4}\s*[-–]\s*(?:\d{4}|present|current)/i);
      
      if (dateMatch) {
        // Save previous entry
        if (currentEntry.company || currentEntry.position) {
          currentEntry.description = descriptionLines.join(' ').trim();
          experience.push({
            company: currentEntry.company || '',
            position: currentEntry.position || '',
            location: currentEntry.location,
            dates: currentEntry.dates,
            description: currentEntry.description,
          });
        }
        
        currentEntry = { dates: dateMatch[0] };
        descriptionLines = [];
        
        // The line might also contain company/position
        const beforeDate = originalLine.split(dateMatch[0])[0].trim();
        if (beforeDate) {
          currentEntry.position = beforeDate;
        }
      } else if (!currentEntry.company && originalLine.length > 2) {
        // First line after date is usually company or position
        if (!currentEntry.position) {
          currentEntry.position = originalLine;
        } else {
          currentEntry.company = originalLine;
        }
      } else if (originalLine.length > 10) {
        descriptionLines.push(originalLine);
      }
    }
  }
  
  // Add last entry
  if (currentEntry.company || currentEntry.position) {
    currentEntry.description = descriptionLines.join(' ').trim();
    experience.push({
      company: currentEntry.company || '',
      position: currentEntry.position || '',
      location: currentEntry.location,
      dates: currentEntry.dates,
      description: currentEntry.description,
    });
  }
  
  return experience.slice(0, 10); // Limit to 10 entries
}

function extractLocation(text: string): string | undefined {
  // Common location patterns
  const locationPatterns = [
    /(?:address|location|based in|located in)[:\s]*([^\n]+)/i,
    /([A-Za-z\s]+,\s*[A-Za-z\s]+,?\s*(?:Nigeria|Ghana|Kenya|South Africa|Rwanda))/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function extractSummary(text: string): string | undefined {
  const summaryPatterns = [
    /(?:summary|objective|profile|about)[:\s]*([\s\S]*?)(?=\n\n|experience|education|skills)/i,
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 20) {
      return match[1].trim().slice(0, 500);
    }
  }
  
  return undefined;
}

async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function parseCV(file: File): Promise<ParsedCVData> {
  let text = '';
  
  if (file.type === 'text/plain') {
    text = await readTextFile(file);
  } else if (file.type === 'application/pdf') {
    // For PDF files, we'll extract what we can from the file name and provide empty data
    // Full PDF parsing requires server-side processing
    throw new Error('PDF parsing requires manual entry. Please fill in the form below or upload a TXT version of your CV.');
  } else if (file.type.includes('word') || file.type.includes('document')) {
    // Word documents also need server-side processing
    throw new Error('Word document parsing requires manual entry. Please fill in the form below or upload a TXT version of your CV.');
  } else {
    // Try to read as text anyway
    try {
      text = await readTextFile(file);
    } catch {
      throw new Error('Unable to read this file format. Please upload a TXT file or fill in the form manually.');
    }
  }
  
  if (!text || text.length < 50) {
    throw new Error('Could not extract text from the file. Please fill in the form manually.');
  }
  
  return {
    fullName: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    summary: extractSummary(text),
    skills: extractSkills(text),
    education: extractEducation(text),
    experience: extractExperience(text),
  };
}
