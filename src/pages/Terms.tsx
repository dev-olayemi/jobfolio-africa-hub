import { Layout } from "@/components/Layout";

const Terms = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Terms & Conditions</h1>
        
        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using JobFolio Africa, you accept and agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. User Registration</h2>
            <p>
              To access job listings and apply for positions, you must create a folio by uploading your CV and 
              selecting your preferred industries. All information provided must be accurate and up-to-date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Trial Period and Access Fee</h2>
            <p>
              New users receive a 3-day trial period upon building their folio. After the trial period, 
              continued access to job listings requires payment of a monthly access fee. The subscription 
              renews every 30 days unless canceled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain accurate and current information in your folio</li>
              <li>Use the platform only for legitimate job searching purposes</li>
              <li>Respect intellectual property rights</li>
              <li>Not misrepresent your qualifications or experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Job Listings</h2>
            <p>
              While we strive to provide accurate and verified job listings, JobFolio Africa is not responsible 
              for the content or accuracy of job postings. Users should exercise due diligence when applying for positions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Refund Policy</h2>
            <p>
              Access fees are non-refundable once paid. Users may cancel their subscription at any time, 
              which will take effect at the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms or engage in 
              fraudulent or inappropriate behavior.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Contact</h2>
            <p>
              For questions about these Terms & Conditions, contact us at{" "}
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

export default Terms;
