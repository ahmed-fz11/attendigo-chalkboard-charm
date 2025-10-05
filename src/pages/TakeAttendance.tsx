import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import attendigoBg2 from "@/assets/attendigo_bg2.png";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Check, ChevronDown, Pencil, Trash2 } from "lucide-react";

interface Student {
  id: number;
  name: string;
  status: 'present' | 'absent';
  notes: string;
}

interface ClassInfo {
  id: string;
  name: string;
  students: Student[];
}

const CLASS_API_BASE_URL = "https://api.example.com/classes";

const INITIAL_CLASSES: ClassInfo[] = [
  {
    id: "grade8-b",
    name: "Grade 8 - Section B",
    students: [
      { id: 1, name: "Emma Johnson", status: "present", notes: "none" },
      { id: 2, name: "Michael Brown", status: "absent", notes: "Left early" },
      { id: 3, name: "Sarah Davis", status: "present", notes: "none" },
      { id: 4, name: "Alex Wilson", status: "absent", notes: "Sick" },
      { id: 5, name: "Jessica Miller", status: "present", notes: "none" },
    ],
  },
  {
    id: "grade7-a",
    name: "Grade 7 - Section A",
    students: [
      { id: 101, name: "Liam Carter", status: "present", notes: "none" },
      { id: 102, name: "Olivia Reed", status: "present", notes: "none" },
      { id: 103, name: "Noah Brooks", status: "absent", notes: "Sick" },
      { id: 104, name: "Ava Morgan", status: "present", notes: "none" },
    ],
  },
  {
    id: "grade6-c",
    name: "Grade 6 - Section C",
    students: [
      { id: 201, name: "Ethan Cooper", status: "present", notes: "none" },
      { id: 202, name: "Mia Flores", status: "present", notes: "none" },
      { id: 203, name: "Benjamin Hughes", status: "absent", notes: "Travel" },
    ],
  },
];

const cloneStudents = (list: Student[]) => list.map((student) => ({ ...student }));

const parseStudentNames = (input: string) =>
  input
    .split(/\r?\n|,/)
    .map((name) => name.trim())
    .filter(Boolean);

const simulateApiCall = async (endpoint: string, payload: unknown) => {
  // TODO: replace with real API integration once endpoints are available
  console.debug(`API placeholder → ${endpoint}`, payload);
  await Promise.resolve();
};

const TakeAttendance = () => {
  const { logout } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>(INITIAL_CLASSES);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>(cloneStudents(INITIAL_CLASSES[0]?.students ?? []));
  const [submitted, setSubmitted] = useState(false);
  const [classSelectorOpen, setClassSelectorOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classFormData, setClassFormData] = useState<{ name: string; studentsText: string }>({
    name: '',
    studentsText: '',
  });

  const selectedClassName = useMemo(
    () => classes.find((cls) => cls.id === selectedClass)?.name ?? '',
    [classes, selectedClass],
  );

  const updateStudentStatus = (studentId: number, status: 'present' | 'absent') => {
    setStudents((prev) =>
      prev.map((student) => (student.id === studentId ? { ...student, status } : student)),
    );
  };

  const updateStudentNotes = (studentId: number, notes: string) => {
    setStudents((prev) =>
      prev.map((student) => (student.id === studentId ? { ...student, notes } : student)),
    );
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    const classInfo = classes.find((cls) => cls.id === classId);
    setStudents(classInfo ? cloneStudents(classInfo.students) : []);
    setSubmitted(false);
    setClassSelectorOpen(false);
  };

  const resetClassForm = () => {
    setClassFormData({ name: '', studentsText: '' });
  };

  const handleOpenCreateDialog = () => {
    resetClassForm();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (classId: string) => {
    const classInfo = classes.find((cls) => cls.id === classId);
    if (!classInfo) {
      return;
    }
    setEditingClassId(classId);
    setClassFormData({
      name: classInfo.name,
      studentsText: classInfo.students.map((student) => student.name).join('\n'),
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      resetClassForm();
    }
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingClassId(null);
      resetClassForm();
    }
  };

  const handleCreateClassSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = classFormData.name.trim();
    const studentNames = parseStudentNames(classFormData.studentsText);

    if (!trimmedName) {
      toast({ title: 'Please enter a class name.' });
      return;
    }

    if (studentNames.length === 0) {
      toast({ title: 'Add at least one student name.' });
      return;
    }

    const timestamp = Date.now();
    let nextId = timestamp;
    const newStudents = studentNames.map((name) => ({
      id: nextId++,
      name,
      status: 'present' as const,
      notes: 'none',
    }));

    const newClass: ClassInfo = {
      id: `class-${timestamp}`,
      name: trimmedName,
      students: newStudents,
    };

    await simulateApiCall(`${CLASS_API_BASE_URL}/create`, {
      method: 'POST',
      body: { name: trimmedName, students: studentNames },
    });

    setClasses((prev) => [...prev, newClass]);
    setSelectedClass(newClass.id);
    setStudents(cloneStudents(newStudents));
    setSubmitted(false);
    setIsCreateDialogOpen(false);
    resetClassForm();
    toast({ title: 'Class created', description: `${trimmedName} was added successfully.` });
  };

  const handleEditClassSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingClassId) {
      return;
    }

    const trimmedName = classFormData.name.trim();
    const studentNames = parseStudentNames(classFormData.studentsText);

    if (!trimmedName) {
      toast({ title: 'Please enter a class name.' });
      return;
    }

    if (studentNames.length === 0) {
      toast({ title: 'Add at least one student name.' });
      return;
    }

    const targetClass = classes.find((cls) => cls.id === editingClassId);
    if (!targetClass) {
      return;
    }

    let nextId = Date.now();
    const updatedStudents = studentNames.map((name) => {
      const existing = targetClass.students.find(
        (student) => student.name.toLowerCase() === name.toLowerCase(),
      );
      if (existing) {
        return { ...existing };
      }
      return {
        id: nextId++,
        name,
        status: 'present' as const,
        notes: 'none',
      };
    });

    const updatedClass: ClassInfo = {
      ...targetClass,
      name: trimmedName,
      students: updatedStudents,
    };

    await simulateApiCall(`${CLASS_API_BASE_URL}/${editingClassId}`, {
      method: 'PUT',
      body: { name: trimmedName, students: studentNames },
    });

    setClasses((prev) =>
      prev.map((cls) => (cls.id === editingClassId ? updatedClass : cls)),
    );

    if (selectedClass === editingClassId) {
      setStudents(cloneStudents(updatedStudents));
      setSubmitted(false);
    }

    setIsEditDialogOpen(false);
    setEditingClassId(null);
    resetClassForm();
    toast({ title: 'Class updated', description: `${trimmedName} was updated successfully.` });
  };

  const handleDeleteClass = async (classId: string) => {
    const targetClass = classes.find((cls) => cls.id === classId);
    if (!targetClass) {
      return;
    }

    await simulateApiCall(`${CLASS_API_BASE_URL}/${classId}`, {
      method: 'DELETE',
    });

    setClasses((prev) => prev.filter((cls) => cls.id !== classId));
    if (selectedClass === classId) {
      setSelectedClass('');
      setStudents([]);
      setSubmitted(false);
    }
    toast({ title: 'Class deleted', description: `${targetClass.name} was removed.` });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast({
      title: "Success!",
      description: "Attendance submitted and parents notified successfully!",
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url(${attendigoBg2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Navbar showReportsButton onLogout={handleLogout} />
      
      <div className="container mx-auto p-4 space-y-6">
        <Card className="backdrop-blur-sm bg-card/95 shadow-lg">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl text-primary">Take Attendance</CardTitle>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex w-full flex-col gap-2 md:max-w-md">
                <Label className="text-sm font-medium text-primary">Select a class</Label>
                <Popover open={classSelectorOpen} onOpenChange={setClassSelectorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex w-full items-center justify-between"
                    >
                      <span className="truncate">
                        {selectedClassName || 'Select a class'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandEmpty>No classes found.</CommandEmpty>
                        <CommandGroup>
                          {classes.map((cls) => (
                            <CommandItem
                              key={cls.id}
                              value={cls.name}
                              onSelect={() => handleClassSelect(cls.id)}
                            >
                              <div className="flex w-full items-center gap-2">
                                <div className="flex items-center gap-2 truncate">
                                  {selectedClass === cls.id ? (
                                    <Check className="h-4 w-4 text-primary" />
                                  ) : (
                                    <span className="h-4 w-4" />
                                  )}
                                  <span className="truncate">{cls.name}</span>
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setClassSelectorOpen(false);
                                      handleOpenEditDialog(cls.id);
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setClassSelectorOpen(false);
                                      handleDeleteClass(cls.id);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Delete</span>
                                  </Button>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="w-full md:w-auto"
                onClick={() => {
                  setClassSelectorOpen(false);
                  handleOpenCreateDialog();
                }}
              >
                Create class
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 font-semibold text-primary">
                  <div>Student Name</div>
                  <div>Status</div>
                  <div>Notes</div>
                </div>
                {students.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                    No students available for this class yet. Add students from the class menu above.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center text-sm font-medium">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                        
                        <RadioGroup 
                          value={student.status} 
                          onValueChange={(value) => updateStudentStatus(student.id, value as 'present' | 'absent')}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="present" id={`present-${student.id}`} />
                            <Label htmlFor={`present-${student.id}`}>Present</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                            <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                          </div>
                        </RadioGroup>
                        
                        <Select value={student.notes} onValueChange={(value) => updateStudentNotes(student.id, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select notes..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No notes</SelectItem>
                            <SelectItem value="Left early">Left early</SelectItem>
                            <SelectItem value="Sick">Sick</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="Late arrival">Late arrival</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {submitted && (
              <div className="mt-6 p-4 bg-accent-green/20 border border-accent-green/30 rounded-lg">
                <p className="text-secondary font-medium">
                  Attendance submitted and parents notified successfully!
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleSubmit}
              className="w-full mt-6"
              variant="secondary"
              size="lg"
              disabled={!selectedClass}
            >
              Submit & Notify Parents
            </Button>
          </CardContent>
        </Card>

        <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClassSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="create-class-name">Class name</Label>
                <Input
                  id="create-class-name"
                  value={classFormData.name}
                  onChange={(event) =>
                    setClassFormData((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="e.g. Grade 5 - Section A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-student-names">Student names</Label>
                <Textarea
                  id="create-student-names"
                  value={classFormData.studentsText}
                  onChange={(event) =>
                    setClassFormData((prev) => ({ ...prev, studentsText: event.target.value }))
                  }
                  placeholder="Enter one student per line"
                  className="h-40"
                />
                <p className="text-xs text-muted-foreground">
                  Enter one name per line or separate with commas.
                </p>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreateDialogOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save class</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditClassSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-class-name">Class name</Label>
                <Input
                  id="edit-class-name"
                  value={classFormData.name}
                  onChange={(event) =>
                    setClassFormData((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="e.g. Grade 5 - Section A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-student-names">Student names</Label>
                <Textarea
                  id="edit-student-names"
                  value={classFormData.studentsText}
                  onChange={(event) =>
                    setClassFormData((prev) => ({ ...prev, studentsText: event.target.value }))
                  }
                  placeholder="Enter one student per line"
                  className="h-40"
                />
                <p className="text-xs text-muted-foreground">
                  Update the roster by adding, editing, or removing names.
                </p>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleEditDialogOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TakeAttendance;
