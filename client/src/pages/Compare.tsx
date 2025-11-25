import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { ArrowLeft, X, ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Compare() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [compareRobots, setCompareRobots] = useState<any[]>([]);

  const robots = trpc.robots.list.useQuery();

  // Get selected robot IDs from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ids = params.get("ids");
    if (ids) {
      setSelectedIds(ids.split(",").map(Number));
    }
  }, []);

  // Fetch robots when IDs change
  useEffect(() => {
    if (selectedIds.length > 0 && robots.data) {
      const selected = robots.data.filter((r: any) => selectedIds.includes(r.id));
      setCompareRobots(selected);
    }
  }, [selectedIds, robots.data]);

  const removeRobot = (id: number) => {
    const newIds = selectedIds.filter((i) => i !== id);
    setSelectedIds(newIds);
    
    // Update URL
    const params = new URLSearchParams();
    if (newIds.length > 0) {
      params.set("ids", newIds.join(","));
      window.history.replaceState({}, "", `?${params.toString()}`);
    } else {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const comparisonFields = [
    { label: "Name", key: "name", render: (robot: any) => robot.websiteUrl ? (
      <a href={robot.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
        {robot.name}
        <ExternalLink className="h-3 w-3" />
      </a>
    ) : robot.name },
    { label: "Manufacturer", key: "manufacturer" },
    { label: "Type", key: "type", render: (robot: any) => <Badge variant="outline">{robot.type.replace("_", " ")}</Badge> },
    { label: "Length (mm)", key: "length" },
    { label: "Width (mm)", key: "width" },
    { label: "Height (mm)", key: "height" },
    { label: "Weight (kg)", key: "weight" },
    { label: "Payload (kg)", key: "usablePayload" },
    { label: "Functions", key: "functions" },
    { label: "Reach (mm)", key: "reach" },
    { label: "Drive System", key: "driveSystem" },
    { label: "Certifications", key: "certifications" },
    { label: "ROS Compatible", key: "rosCompatible", render: (robot: any) => (
      <Badge variant={robot.rosCompatible ? "default" : "secondary"}>
        {robot.rosCompatible ? "Yes" : "No"}
      </Badge>
    ) },
    { label: "ROS Distros", key: "rosDistros" },
    { label: "SDK Available", key: "sdkAvailable", render: (robot: any) => robot.sdkAvailable ? "Yes" : "No" },
    { label: "API Available", key: "apiAvailable", render: (robot: any) => robot.apiAvailable ? "Yes" : "No" },
    { label: "Operation Time (min)", key: "operationTime" },
    { label: "Battery Life (min)", key: "batteryLife" },
    { label: "Max Speed (mm/s)", key: "maxSpeed" },
    { label: "Force Sensor", key: "forceSensor", render: (robot: any) => (
      <Badge variant={robot.forceSensor ? "default" : "secondary"}>
        {robot.forceSensor ? "Yes" : "No"}
      </Badge>
    ) },
    { label: "EOAT Compatibility", key: "eoatCompatibility" },
    { label: "Arm Payload (kg)", key: "armPayload" },
    { label: "Arm Reach (mm)", key: "armReach" },
    { label: "Arm DOF", key: "armDof" },
    { label: "Remarks", key: "remarks" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </Link>
            {user && (
              <Button variant="outline" onClick={() => logout()}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Robot Comparison</CardTitle>
            <CardDescription>
              Compare specifications side-by-side
            </CardDescription>
          </CardHeader>
          <CardContent>
            {compareRobots.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No robots selected for comparison.</p>
                <Link href="/">
                  <Button className="mt-4">Go to Search</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48 sticky left-0 bg-white z-10">Specification</TableHead>
                      {compareRobots.map((robot: any) => (
                        <TableHead key={robot.id} className="min-w-[200px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold">{robot.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRobot(robot.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonFields.map((field) => (
                      <TableRow key={field.key}>
                        <TableCell className="font-medium sticky left-0 bg-white z-10">
                          {field.label}
                        </TableCell>
                        {compareRobots.map((robot: any) => (
                          <TableCell key={robot.id}>
                            {field.render
                              ? field.render(robot)
                              : robot[field.key] !== null && robot[field.key] !== undefined
                              ? robot[field.key]
                              : "—"}
                          </TableCell>
                        ))}
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
