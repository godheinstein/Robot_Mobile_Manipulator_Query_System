import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Filter, Loader2, Settings, LogOut } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  
  // Natural language search state
  const [nlQuery, setNlQuery] = useState("");
  
  // Filter state
  const [filters, setFilters] = useState({
    type: "",
    minPayload: "",
    maxPayload: "",
    minReach: "",
    maxReach: "",
    rosCompatible: "",
    driveSystem: "",
    minArmDof: "",
    forceSensor: "",
  });

  // Query states
  const [activeTab, setActiveTab] = useState<"nl" | "filter">("nl");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);

  // tRPC queries
  const allRobots = trpc.robots.list.useQuery();
  const nlSearchMutation = trpc.robots.naturalLanguageQuery.useMutation();
  const filterSearchQuery = trpc.robots.search.useQuery(
    {
      type: filters.type || undefined,
      minPayload: filters.minPayload ? Number(filters.minPayload) : undefined,
      maxPayload: filters.maxPayload ? Number(filters.maxPayload) : undefined,
      minReach: filters.minReach ? Number(filters.minReach) : undefined,
      maxReach: filters.maxReach ? Number(filters.maxReach) : undefined,
      rosCompatible: filters.rosCompatible === "true" ? true : filters.rosCompatible === "false" ? false : undefined,
      driveSystem: filters.driveSystem || undefined,
      minArmDof: filters.minArmDof ? Number(filters.minArmDof) : undefined,
      forceSensor: filters.forceSensor === "true" ? true : filters.forceSensor === "false" ? false : undefined,
    },
    { enabled: false }
  );

  const handleNaturalLanguageSearch = async () => {
    if (!nlQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      const result = await nlSearchMutation.mutateAsync({ query: nlQuery });
      setSearchResults(result.results);
      toast.success(result.explanation);
    } catch (error) {
      toast.error("Failed to process search query");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterSearch = async () => {
    setIsSearching(true);
    try {
      const result = await filterSearchQuery.refetch();
      if (result.data) {
        setSearchResults(result.data);
        toast.success(`Found ${result.data.length} robot(s)`);
      }
    } catch (error) {
      toast.error("Failed to search robots");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      type: "",
      minPayload: "",
      maxPayload: "",
      minReach: "",
      maxReach: "",
      rosCompatible: "",
      driveSystem: "",
      minArmDof: "",
      forceSensor: "",
    });
    setSearchResults([]);
  };

  const displayRobots = searchResults.length > 0 ? searchResults : (allRobots.data || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-slate-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Login</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Robots</CardTitle>
            <CardDescription>
              Use natural language or filters to find the perfect robot for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tab Selection */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "nl" ? "default" : "outline"}
                onClick={() => setActiveTab("nl")}
              >
                <Search className="h-4 w-4 mr-2" />
                Natural Language
              </Button>
              <Button
                variant={activeTab === "filter" ? "default" : "outline"}
                onClick={() => setActiveTab("filter")}
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>

            {/* Natural Language Search */}
            {activeTab === "nl" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Find a mobile manipulator with at least 5kg payload and ROS support"
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNaturalLanguageSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleNaturalLanguageSearch} disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-slate-600">
                  Try: "Show me robots with force sensors" or "Find mobile bases with long battery life"
                </p>
              </div>
            )}

            {/* Filter Search */}
            {activeTab === "filter" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Robot Type</Label>
                    <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="mobile_manipulator">Mobile Manipulator</SelectItem>
                        <SelectItem value="mobile_base">Mobile Base</SelectItem>
                        <SelectItem value="manipulator_arm">Manipulator Arm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Min Payload (kg)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 5"
                      value={filters.minPayload}
                      onChange={(e) => setFilters({ ...filters, minPayload: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Payload (kg)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={filters.maxPayload}
                      onChange={(e) => setFilters({ ...filters, maxPayload: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Reach (mm)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      value={filters.minReach}
                      onChange={(e) => setFilters({ ...filters, minReach: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Reach (mm)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2000"
                      value={filters.maxReach}
                      onChange={(e) => setFilters({ ...filters, maxReach: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ROS Compatible</Label>
                    <Select value={filters.rosCompatible} onValueChange={(v) => setFilters({ ...filters, rosCompatible: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Drive System</Label>
                    <Input
                      placeholder="e.g., differential"
                      value={filters.driveSystem}
                      onChange={(e) => setFilters({ ...filters, driveSystem: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Arm DOF</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 6"
                      value={filters.minArmDof}
                      onChange={(e) => setFilters({ ...filters, minArmDof: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Force Sensor</Label>
                    <Select value={filters.forceSensor} onValueChange={(v) => setFilters({ ...filters, forceSensor: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleFilterSearch} disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {searchResults.length > 0 ? "Search Results" : "All Robots"}
                <Badge variant="secondary" className="ml-2">
                  {displayRobots.length}
                </Badge>
              </CardTitle>
              {selectedForComparison.length > 0 && (
                <Link href={`/compare?ids=${selectedForComparison.join(",")}`}>
                  <Button>
                    Compare ({selectedForComparison.length})
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {allRobots.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : displayRobots.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No robots found. {isAuthenticated && "Add some robots from the admin panel!"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={selectedForComparison.length === displayRobots.length && displayRobots.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedForComparison(displayRobots.map((r: any) => r.id));
                            } else {
                              setSelectedForComparison([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Payload (kg)</TableHead>
                      <TableHead>Reach (mm)</TableHead>
                      <TableHead>ROS</TableHead>
                      <TableHead>Arm DOF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayRobots.map((robot: any) => (
                      <TableRow key={robot.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={selectedForComparison.includes(robot.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedForComparison([...selectedForComparison, robot.id]);
                              } else {
                                setSelectedForComparison(selectedForComparison.filter(id => id !== robot.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {robot.websiteUrl ? (
                            <a
                              href={robot.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 transition-colors"
                            >
                              {robot.name}
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ) : (
                            <span>{robot.name}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {robot.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{robot.manufacturer || "—"}</TableCell>
                        <TableCell>{robot.usablePayload || "—"}</TableCell>
                        <TableCell>{robot.reach || "—"}</TableCell>
                        <TableCell>
                          {robot.rosCompatible ? (
                            <Badge variant="default" className="bg-green-600">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{robot.armDof || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
