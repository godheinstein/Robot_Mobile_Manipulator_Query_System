import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

type RobotFormData = {
  name: string;
  manufacturer: string;
  type: "mobile_manipulator" | "mobile_base" | "manipulator_arm";
  length: string;
  width: string;
  height: string;
  weight: string;
  usablePayload: string;
  functions: string;
  reach: string;
  driveSystem: string;
  certifications: string;
  rosCompatible: string;
  rosDistros: string;
  sdkAvailable: string;
  apiAvailable: string;
  operationTime: string;
  batteryLife: string;
  maxSpeed: string;
  forceSensor: string;
  eoatCompatibility: string;
  armPayload: string;
  armReach: string;
  armDof: string;
  remarks: string;
};

const emptyForm: RobotFormData = {
  name: "",
  manufacturer: "",
  type: "mobile_manipulator",
  length: "",
  width: "",
  height: "",
  weight: "",
  usablePayload: "",
  functions: "",
  reach: "",
  driveSystem: "",
  certifications: "",
  rosCompatible: "0",
  rosDistros: "",
  sdkAvailable: "0",
  apiAvailable: "0",
  operationTime: "",
  batteryLife: "",
  maxSpeed: "",
  forceSensor: "0",
  eoatCompatibility: "",
  armPayload: "",
  armReach: "",
  armDof: "",
  remarks: "",
};

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRobot, setEditingRobot] = useState<any>(null);
  const [formData, setFormData] = useState<RobotFormData>(emptyForm);

  const utils = trpc.useUtils();
  const robots = trpc.robots.list.useQuery();
  const createMutation = trpc.robots.create.useMutation({
    onSuccess: () => {
      utils.robots.list.invalidate();
      toast.success("Robot created successfully");
      setIsDialogOpen(false);
      setFormData(emptyForm);
    },
    onError: (error) => {
      toast.error("Failed to create robot: " + error.message);
    },
  });

  const updateMutation = trpc.robots.update.useMutation({
    onSuccess: () => {
      utils.robots.list.invalidate();
      toast.success("Robot updated successfully");
      setIsDialogOpen(false);
      setEditingRobot(null);
      setFormData(emptyForm);
    },
    onError: (error) => {
      toast.error("Failed to update robot: " + error.message);
    },
  });

  const deleteMutation = trpc.robots.delete.useMutation({
    onSuccess: () => {
      utils.robots.list.invalidate();
      toast.success("Robot deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete robot: " + error.message);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <a href={getLoginUrl()}>
              <Button className="w-full">Login</Button>
            </a>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOpenDialog = (robot?: any) => {
    if (robot) {
      setEditingRobot(robot);
      setFormData({
        name: robot.name || "",
        manufacturer: robot.manufacturer || "",
        type: robot.type || "mobile_manipulator",
        length: robot.length?.toString() || "",
        width: robot.width?.toString() || "",
        height: robot.height?.toString() || "",
        weight: robot.weight?.toString() || "",
        usablePayload: robot.usablePayload?.toString() || "",
        functions: robot.functions || "",
        reach: robot.reach?.toString() || "",
        driveSystem: robot.driveSystem || "",
        certifications: robot.certifications || "",
        rosCompatible: robot.rosCompatible?.toString() || "0",
        rosDistros: robot.rosDistros || "",
        sdkAvailable: robot.sdkAvailable?.toString() || "0",
        apiAvailable: robot.apiAvailable?.toString() || "0",
        operationTime: robot.operationTime?.toString() || "",
        batteryLife: robot.batteryLife?.toString() || "",
        maxSpeed: robot.maxSpeed?.toString() || "",
        forceSensor: robot.forceSensor?.toString() || "0",
        eoatCompatibility: robot.eoatCompatibility || "",
        armPayload: robot.armPayload?.toString() || "",
        armReach: robot.armReach?.toString() || "",
        armDof: robot.armDof?.toString() || "",
        remarks: robot.remarks || "",
      });
    } else {
      setEditingRobot(null);
      setFormData(emptyForm);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Robot name is required");
      return;
    }

    const payload: any = {
      name: formData.name,
      manufacturer: formData.manufacturer || undefined,
      type: formData.type,
      length: formData.length ? Number(formData.length) : undefined,
      width: formData.width ? Number(formData.width) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      usablePayload: formData.usablePayload ? Number(formData.usablePayload) : undefined,
      functions: formData.functions || undefined,
      reach: formData.reach ? Number(formData.reach) : undefined,
      driveSystem: formData.driveSystem || undefined,
      certifications: formData.certifications || undefined,
      rosCompatible: Number(formData.rosCompatible),
      rosDistros: formData.rosDistros || undefined,
      sdkAvailable: Number(formData.sdkAvailable),
      apiAvailable: Number(formData.apiAvailable),
      operationTime: formData.operationTime ? Number(formData.operationTime) : undefined,
      batteryLife: formData.batteryLife ? Number(formData.batteryLife) : undefined,
      maxSpeed: formData.maxSpeed ? Number(formData.maxSpeed) : undefined,
      forceSensor: Number(formData.forceSensor),
      eoatCompatibility: formData.eoatCompatibility || undefined,
      armPayload: formData.armPayload ? Number(formData.armPayload) : undefined,
      armReach: formData.armReach ? Number(formData.armReach) : undefined,
      armDof: formData.armDof ? Number(formData.armDof) : undefined,
      remarks: formData.remarks || undefined,
    };

    if (editingRobot) {
      updateMutation.mutate({ id: editingRobot.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this robot?")) {
      deleteMutation.mutate({ id });
    }
  };

  const showArmFields = formData.type === "mobile_manipulator" || formData.type === "manipulator_arm";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Manage Robots</CardTitle>
                <CardDescription>Add, edit, or remove robots from the database</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Robot
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingRobot ? "Edit Robot" : "Add New Robot"}</DialogTitle>
                    <DialogDescription>
                      Fill in the robot specifications. Fields marked with * are required.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {/* Basic Information */}
                    <div className="space-y-2 md:col-span-2">
                      <h3 className="font-semibold text-sm">Basic Information</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile_manipulator">Mobile Manipulator</SelectItem>
                          <SelectItem value="mobile_base">Mobile Base</SelectItem>
                          <SelectItem value="manipulator_arm">Manipulator Arm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Physical Specifications */}
                    <div className="space-y-2 md:col-span-2">
                      <h3 className="font-semibold text-sm mt-4">Physical Specifications</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="length">Length (mm)</Label>
                      <Input
                        id="length"
                        type="number"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="width">Width (mm)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (mm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="usablePayload">Usable Payload (kg)</Label>
                      <Input
                        id="usablePayload"
                        type="number"
                        value={formData.usablePayload}
                        onChange={(e) => setFormData({ ...formData, usablePayload: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reach">Reach (mm)</Label>
                      <Input
                        id="reach"
                        type="number"
                        value={formData.reach}
                        onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                      />
                    </div>

                    {/* Functional Specifications */}
                    <div className="space-y-2 md:col-span-2">
                      <h3 className="font-semibold text-sm mt-4">Functional Specifications</h3>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="functions">Functions</Label>
                      <Input
                        id="functions"
                        placeholder="e.g., pick and place, navigation, inspection"
                        value={formData.functions}
                        onChange={(e) => setFormData({ ...formData, functions: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driveSystem">Drive System</Label>
                      <Input
                        id="driveSystem"
                        placeholder="e.g., differential, omnidirectional"
                        value={formData.driveSystem}
                        onChange={(e) => setFormData({ ...formData, driveSystem: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications</Label>
                      <Input
                        id="certifications"
                        placeholder="e.g., ISO 9001, Cleanroom Class 5"
                        value={formData.certifications}
                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      />
                    </div>

                    {/* Integration */}
                    <div className="space-y-2 md:col-span-2">
                      <h3 className="font-semibold text-sm mt-4">Integration</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rosCompatible">ROS Compatible</Label>
                      <Select value={formData.rosCompatible} onValueChange={(v) => setFormData({ ...formData, rosCompatible: v })}>
                        <SelectTrigger id="rosCompatible">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rosDistros">ROS Distros</Label>
                      <Input
                        id="rosDistros"
                        placeholder="e.g., Noetic, Humble, Jazzy"
                        value={formData.rosDistros}
                        onChange={(e) => setFormData({ ...formData, rosDistros: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sdkAvailable">SDK Available</Label>
                      <Select value={formData.sdkAvailable} onValueChange={(v) => setFormData({ ...formData, sdkAvailable: v })}>
                        <SelectTrigger id="sdkAvailable">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiAvailable">API Available</Label>
                      <Select value={formData.apiAvailable} onValueChange={(v) => setFormData({ ...formData, apiAvailable: v })}>
                        <SelectTrigger id="apiAvailable">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Performance */}
                    <div className="space-y-2 md:col-span-2">
                      <h3 className="font-semibold text-sm mt-4">Performance</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operationTime">Operation Time (minutes)</Label>
                      <Input
                        id="operationTime"
                        type="number"
                        value={formData.operationTime}
                        onChange={(e) => setFormData({ ...formData, operationTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batteryLife">Battery Life (minutes)</Label>
                      <Input
                        id="batteryLife"
                        type="number"
                        value={formData.batteryLife}
                        onChange={(e) => setFormData({ ...formData, batteryLife: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxSpeed">Max Speed (mm/s)</Label>
                      <Input
                        id="maxSpeed"
                        type="number"
                        value={formData.maxSpeed}
                        onChange={(e) => setFormData({ ...formData, maxSpeed: e.target.value })}
                      />
                    </div>

                    {/* Arm-Specific Criteria */}
                    {showArmFields && (
                      <>
                        <div className="space-y-2 md:col-span-2">
                          <h3 className="font-semibold text-sm mt-4">Arm-Specific Criteria</h3>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="forceSensor">Force Sensor</Label>
                          <Select value={formData.forceSensor} onValueChange={(v) => setFormData({ ...formData, forceSensor: v })}>
                            <SelectTrigger id="forceSensor">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No</SelectItem>
                              <SelectItem value="1">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="eoatCompatibility">EOAT Compatibility</Label>
                          <Input
                            id="eoatCompatibility"
                            placeholder="e.g., Gripper, Suction Cup"
                            value={formData.eoatCompatibility}
                            onChange={(e) => setFormData({ ...formData, eoatCompatibility: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="armPayload">Arm Payload (kg)</Label>
                          <Input
                            id="armPayload"
                            type="number"
                            value={formData.armPayload}
                            onChange={(e) => setFormData({ ...formData, armPayload: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="armReach">Arm Reach (mm)</Label>
                          <Input
                            id="armReach"
                            type="number"
                            value={formData.armReach}
                            onChange={(e) => setFormData({ ...formData, armReach: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="armDof">Arm DOF</Label>
                          <Input
                            id="armDof"
                            type="number"
                            value={formData.armDof}
                            onChange={(e) => setFormData({ ...formData, armDof: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* Remarks */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Textarea
                        id="remarks"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {editingRobot ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {robots.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : robots.data && robots.data.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No robots yet. Click "Add Robot" to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Payload (kg)</TableHead>
                      <TableHead>Reach (mm)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {robots.data?.map((robot: any) => (
                      <TableRow key={robot.id}>
                        <TableCell className="font-medium">{robot.name}</TableCell>
                        <TableCell>{robot.type.replace("_", " ")}</TableCell>
                        <TableCell>{robot.manufacturer || "—"}</TableCell>
                        <TableCell>{robot.usablePayload || "—"}</TableCell>
                        <TableCell>{robot.reach || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(robot)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(robot.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
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
