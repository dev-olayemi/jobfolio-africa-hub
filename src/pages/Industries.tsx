import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

const industries = [
  {
    name: "Technology",
    description: "Software development, IT support, and tech startups",
    jobCount: 245,
  },
  {
    name: "Finance",
    description: "Banking, accounting, financial analysis, and investment",
    jobCount: 189,
  },
  {
    name: "Healthcare",
    description: "Medical professionals, nursing, and healthcare administration",
    jobCount: 167,
  },
  {
    name: "Hospitality",
    description: "Hotels, restaurants, tourism, and event management",
    jobCount: 142,
  },
  {
    name: "Education",
    description: "Teaching, training, and educational administration",
    jobCount: 128,
  },
  {
    name: "Construction",
    description: "Building, engineering, and project management",
    jobCount: 98,
  },
  {
    name: "Retail",
    description: "Sales, customer service, and retail management",
    jobCount: 156,
  },
  {
    name: "Manufacturing",
    description: "Production, quality control, and operations",
    jobCount: 87,
  },
  {
    name: "Transportation",
    description: "Logistics, shipping, and supply chain management",
    jobCount: 76,
  },
  {
    name: "Agriculture",
    description: "Farming, agribusiness, and agricultural technology",
    jobCount: 64,
  },
];

const Industries = () => {
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Industry Categories</h1>
          <p className="text-muted-foreground">
            Explore job opportunities across different industries in Africa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => (
            <Card
              key={industry.name}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/jobs?industry=${industry.name}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{industry.jobCount} jobs</Badge>
                </div>
                <CardTitle className="mt-4">{industry.name}</CardTitle>
                <CardDescription>{industry.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary hover:underline">View all jobs →</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Industries;
