import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Building2, 
  DollarSign,
  Clock,
  Heart,
  Eye,
  Users,
  Search,
  Filter,
  ChevronRight,
  Star,
  Bookmark,
  Share2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { recordJobView, toggleJobLike, hasUserLikedJob } from "@/lib/jobMetrics";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  salary?: string;
  type: string;
  category: string;
  level: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedById: string;
  postedByType: string;
  postedByName?: string;
  contactEmail: string;
  status: string;
  isActive: boolean;
  views: number;
  likes: number;
  applies: number;
  postedAt: any;
  createdAt: any;
  benefits?: string[];
  tags?: string[];
  isRemote?: boolean;
}

const Jobs = () => {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());

  const categories = [
    "Technology", "Design", "Marketing", "Sales", "Finance", 
    "Operations", "Human Resources", "Customer Service", "Product",
    "Engineering", "Data", "Legal", "Health", "Agriculture"
  ];

  const jobTypes = ["full-time", "part-time", "contract", "internship", "freelance"];
  const jobLevels = ["entry", "mid", "senior", "executive"];
  const locations = [
    "Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", // Nigeria
    "Accra", "Kumasi", "Tamale", // Ghana
    "Nairobi", "Mombasa", "Kisumu", // Kenya
    "Cape Town", "Johannesburg", "Durban", // South Africa
    "Kigali", "Dar es Salaam", "Kampala", "Addis Ababa", "Lusaka"
  ];

  useEffect(() => {
    loadJobs(true);
  }, [selectedCategory, selectedType, selectedLevel, selectedLocation]);

  useEffect(() => {
    if (user) {
      loadUserLikes();
    }
  }, [user]);

  const loadUserLikes = async () => {
    if (!user) return;
    
    // Load user's liked jobs
    const liked = new Set<string>();
    for (const job of jobs) {
      const isLiked = await hasUserLikedJob(job.id, user.uid);
      if (isLiked) {
        liked.add(job.id);
      }
    }
    setLikedJobs(liked);
  };

  const loadJobs = async (reset = false) => {
    try {
      setLoading(true);
      
      let q = query(
        collection(db, "jobs"),
        where("status", "==", "active"),
        where("isActive", "==", true),
        orderBy("postedAt", "desc"),
        limit(10)
      );

      // Add filters
      if (selectedCategory !== "all") {
        q = query(q, where("category", "==", selectedCategory));
      }
      if (selectedType !== "all") {
        q = query(q, where("type", "==", selectedType));
      }
      if (selectedLevel !== "all") {
        q = query(q, where("level", "==", selectedLevel));
      }
      if (selectedLocation !== "all") {
        q = query(q, where("location", "==", selectedLocation));
      }

      // Pagination
      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const newJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];

      // Filter by search query on client side
      const filteredJobs = searchQuery
        ? newJobs.filter(job =>
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : newJobs;

      if (reset) {
        setJobs(filteredJobs);
      } else {
        setJobs(prev => [...prev, ...filteredJobs]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = async (job: Job) => {
    // Record view
    await recordJobView(job.id);
    
    // Update local state
    setJobs(prev => prev.map(j => 
      j.id === job.id ? { ...j, views: j.views + 1 } : j
    ));
  };

  const handleLikeJob = async (job: Job) => {
    if (!user) {
      toast.error("Sign in to like jobs");
      return;
    }

    try {
      const isLiked = await toggleJobLike(job.id, user.uid);
      
      // Update local state
      setLikedJobs(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(job.id);
        } else {
          newSet.delete(job.id);
        }
        return newSet;
      });

      setJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, likes: isLiked ? j.likes + 1 : Math.max(0, j.likes - 1) }
          : j
      ));

      toast.success(isLiked ? "Job liked!" : "Job unliked");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to like job");
    }
  };

  const handleSearch = () => {
    loadJobs(true);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedLevel("all");
    setSelectedLocation("all");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary" />
                Job Opportunities
              </h1>
              <p className="text-sm text-muted-foreground">
                Discover amazing career opportunities across Africa
              </p>
            </div>
            <Button onClick={() => window.location.href = "/post-job"}>
              <Briefcase className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs, companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {jobTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {jobLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button onClick={handleSearch} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" onClick={resetFilters}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Grid */}
          {loading && jobs.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <Button onClick={resetFilters}>Clear Filters</Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {jobs.map((job) => (
                  <Card 
                    key={job.id} 
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => handleJobClick(job)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {job.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Building2 className="h-4 w-4" />
                            <span className="font-medium">{job.company}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeJob(job);
                          }}
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              likedJobs.has(job.id) 
                                ? "fill-red-500 text-red-500" 
                                : "text-muted-foreground hover:text-red-500"
                            }`} 
                          />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Location & Remote */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}, {job.country}</span>
                          </div>
                          {job.isRemote && (
                            <Badge variant="secondary" className="text-xs">Remote</Badge>
                          )}
                        </div>

                        {/* Salary */}
                        {job.salary && (
                          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </div>
                        )}

                        {/* Job Details */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {job.level.charAt(0).toUpperCase() + job.level.slice(1)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {job.category}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>

                        {/* Posted By */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {job.postedAt?.toDate ? 
                                new Date(job.postedAt.toDate()).toLocaleDateString() : 
                                'Recently posted'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>by {job.postedByName || job.company}</span>
                            <Badge variant="outline" className="text-xs">
                              {job.postedByType}
                            </Badge>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{job.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{job.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{job.applies} applied</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => loadJobs(false)}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load More Jobs"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;