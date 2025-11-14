import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const countries = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Rwanda",
  "Tanzania",
  "Uganda",
  "Ethiopia",
  "Zambia",
];

const AdminJobs = () => {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState(countries[0]);
  const [salary, setSalary] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "jobs"), {
        title,
        company,
        location,
        country,
        salary,
        category,
        description,
        requirements: requirements
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean),
        responsibilities: responsibilities
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean),
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        postedAt: Timestamp.now(),
        views: 0,
        likes: 0,
        applies: 0,
      });
      toast.success("Job added");
      // clear
      setTitle("");
      setCompany("");
      setLocation("");
      setSalary("");
      setCategory("");
      setDescription("");
      setRequirements("");
      setResponsibilities("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Job (Admin)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-md border border-input px-3 py-2"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Salary</Label>
                <Input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label>Requirements (one per line)</Label>
                <Textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>
              <div>
                <Label>Responsibilities (one per line)</Label>
                <Textarea
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Job"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminJobs;
