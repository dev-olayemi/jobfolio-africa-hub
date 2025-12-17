// Email service using EmailJS (free tier: 200 emails/month)
// To set up: Create account at emailjs.com and get your credentials

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

interface EmailParams {
  to_email: string;
  to_name: string;
  subject?: string;
  message?: string;
  [key: string]: string | undefined;
}

export const sendEmail = async (params: EmailParams): Promise<boolean> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn("EmailJS not configured. Skipping email send.");
    return false;
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: params,
      }),
    });

    if (response.ok) {
      console.log("Email sent successfully");
      return true;
    } else {
      console.error("Failed to send email:", await response.text());
      return false;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Welcome email for new users
export const sendWelcomeEmail = async (email: string, firstName: string) => {
  return sendEmail({
    to_email: email,
    to_name: firstName,
    subject: "Welcome to JobFolio Africa! 🎉",
    message: `
Hi ${firstName},

Welcome to JobFolio Africa! We're thrilled to have you join our community.

Here's what you can do now:
• Complete your profile and build your folio
• Browse job opportunities tailored to your location
• Get personalized job alerts for your industry

Your success is our mission. Let's find your next opportunity together!

Best regards,
The JobFolio Africa Team
    `.trim(),
  });
};

// Trial activation email
export const sendTrialActivationEmail = async (email: string, firstName: string) => {
  return sendEmail({
    to_email: email,
    to_name: firstName,
    subject: "Your 3-Day Trial Has Started! 🚀",
    message: `
Hi ${firstName},

Great news! Your 3-day free trial has been activated.

During your trial, you have full access to:
• Complete job descriptions
• Direct employer contact information
• Apply to unlimited jobs

Make the most of your trial - start exploring opportunities today!

Best regards,
The JobFolio Africa Team
    `.trim(),
  });
};

// Job alert email
export const sendJobAlertEmail = async (
  email: string,
  firstName: string,
  jobTitle: string,
  company: string,
  location: string
) => {
  return sendEmail({
    to_email: email,
    to_name: firstName,
    subject: `New Job Alert: ${jobTitle} at ${company}`,
    message: `
Hi ${firstName},

A new job matching your preferences has been posted!

Position: ${jobTitle}
Company: ${company}
Location: ${location}

Log in to JobFolio Africa to view the full details and apply.

Best regards,
The JobFolio Africa Team
    `.trim(),
  });
};
