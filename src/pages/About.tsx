import { Layout } from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">About JobFolio Africa</h1>
        
        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <p className="text-lg text-muted-foreground">
            JobFolio Africa is your trusted partner in navigating the African job market.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p>
              We connect talented professionals across Africa with opportunities that match their skills and aspirations. 
              By streamlining the job search process and focusing on industry-specific opportunities, we make it easier 
              for job seekers to find their dream roles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">What We Offer</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Curated job listings from verified employers across Africa</li>
              <li>Industry-focused job filtering to match your expertise</li>
              <li>Simple, user-friendly folio building process</li>
              <li>Affordable access to thousands of opportunities</li>
              <li>Direct connection with employers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Why Choose Us</h2>
            <p>
              Unlike traditional job boards, JobFolio Africa focuses exclusively on the African market, 
              understanding the unique challenges and opportunities across different countries and industries. 
              We believe in making quality job opportunities accessible to everyone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p>
              Have questions or need support? Reach out to us at{" "}
              <a href="mailto:jobfolioafrica@gmail.com" className="text-primary hover:underline">
                jobfolioafrica@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default About;
