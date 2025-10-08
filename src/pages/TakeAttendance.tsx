import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import attendigoBg2 from "@/assets/attendigo_bg2.png";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  createClass,
  fetchTeacherClasses,
  removeClass,
  submitAttendance,
  updateClass,
  type ApiClass,
  type ApiStudent,
} from "@/lib/api";
import { Check, ChevronDown, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  phone: string;
  status: "present" | "absent";
  notes: string;
}

interface StudentDraft {
  key: string;
  name: string;
  phone: string;
  existingId?: string;
}

interface ClassFormState {
  name: string;
  students: StudentDraft[];
}

const generateDraftKey = () =>
  `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createStudentDraft = (overrides?: Partial<StudentDraft>): StudentDraft => ({
  key: overrides?.key ?? generateDraftKey(),
  name: overrides?.name ?? "",
  phone: overrides?.phone ?? "",
  existingId: overrides?.existingId,
});

const mapApiStudentToAttendance = (student: ApiStudent): Student => ({
  id: student.id,
  name: student.full_name,
  phone: student.parent_phone,
  status: "present",
  notes: "none",
});

const TakeAttendance = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const teacherId = user?.id ?? null;

  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [classSelectorOpen, setClassSelectorOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classFormData, setClassFormData] = useState<ClassFormState>(() => ({
    name: "",
    students: [createStudentDraft()],
  }));
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isSavingClass, setIsSavingClass] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);
  const [isDeletingClassId, setIsDeletingClassId] = useState<string | null>(null);
  const [classesError, setClassesError] = useState<string | null>(null);

  const selectedClassName = useMemo(
    () => classes.find((cls) => cls.id === selectedClass)?.name ?? "",
    [classes, selectedClass],
  );

  const loadClasses = useCallback(async (): Promise<ApiClass[]> => {
    if (!teacherId) {
      return [];
    }

    setIsLoadingClasses(true);
    setClassesError(null);

    try {
      const data = await fetchTeacherClasses(teacherId);
      const classList = data.classes ?? [];
      setClasses(classList);
      return classList;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load classes.";
      setClasses([]);
      setClassesError(message);
      toast({
        title: "Unable to fetch classes",
        description: message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingClasses(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!teacherId) {
      setClasses([]);
      setSelectedClass("");
      setStudents([]);
      toast({
        title: "Missing teacher profile",
        description: "No teacher information is available. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    loadClasses();
  }, [authLoading, teacherId, loadClasses]);

  useEffect(() => {
    if (classes.length === 0) {
      setSelectedClass("");
      setStudents([]);
      return;
    }

    setSelectedClass((current) => {
      if (current && classes.some((cls) => cls.id === current)) {
        return current;
      }
      return classes[0].id;
    });
  }, [classes]);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    const classInfo = classes.find((cls) => cls.id === selectedClass);
    if (!classInfo) {
      setStudents([]);
      return;
    }

    const activeStudents = classInfo.students
      .filter((student) => student.active)
      .map(mapApiStudentToAttendance);

    setStudents(activeStudents);
    setSubmitted(false);
  }, [classes, selectedClass]);

  const updateStudentStatus = (studentId: string, status: "present" | "absent") => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student,
      ),
    );
  };

  const updateStudentNotes = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, notes } : student,
      ),
    );
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setClassSelectorOpen(false);
    setSubmitted(false);
  };

  const resetClassForm = () => {
    setClassFormData({
      name: "",
      students: [createStudentDraft()],
    });
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
      students:
        classInfo.students.filter((student) => student.active).length > 0
          ? classInfo.students
              .filter((student) => student.active)
              .map((student) =>
                createStudentDraft({
                  key: `existing-${student.id}`,
                  name: student.full_name,
                  phone: student.parent_phone,
                  existingId: student.id,
                }),
              )
          : [createStudentDraft()],
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

  const updateFormStudent = (key: string, field: "name" | "phone", value: string) => {
    setClassFormData((prev) => ({
      ...prev,
      students: prev.students.map((student) =>
        student.key === key ? { ...student, [field]: value } : student,
      ),
    }));
  };

  const handleAddStudentDraft = () => {
    setClassFormData((prev) => ({
      ...prev,
      students: [...prev.students, createStudentDraft()],
    }));
  };

  const handleRemoveStudentDraft = (key: string) => {
    setClassFormData((prev) => {
      if (prev.students.length === 1) {
        return prev;
      }
      return {
        ...prev,
        students: prev.students.filter((student) => student.key !== key),
      };
    });
  };

  const validateClassForm = () => {
    const trimmedName = classFormData.name.trim();
    const sanitizedStudents = classFormData.students.map((student) => ({
      key: student.key,
      existingId: student.existingId,
      name: student.name.trim(),
      phone: student.phone.trim(),
    }));

    if (!trimmedName) {
      toast({ title: "Please enter a class name." });
      return null;
    }

    const validStudents = sanitizedStudents.filter(
      (student) => student.name && student.phone,
    );

    if (validStudents.length === 0) {
      toast({ title: "Add at least one student with a phone number." });
      return null;
    }

    const hasIncompleteStudent = sanitizedStudents.some(
      (student) => !student.name || !student.phone,
    );

    if (hasIncompleteStudent) {
      toast({ title: "All students must include a name and phone number." });
      return null;
    }

    return {
      trimmedName,
      validStudents,
    };
  };

  const handleCreateClassSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teacherId) {
      toast({
        title: "Missing teacher profile",
        description: "No teacher information is available. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    const validation = validateClassForm();
    if (!validation) {
      return;
    }

    setIsSavingClass(true);
    try {
      const response = await createClass({
        name: validation.trimmedName,
        teacher_user_id: teacherId,
        students: validation.validStudents.map((student) => ({
          full_name: student.name,
          parent_phone: student.phone,
        })),
      });

      toast({
        title: "Class created",
        description: response.message ?? "The class was added successfully.",
      });

      const latestClasses = await loadClasses();

      if (response.class_id) {
        const exists = latestClasses.some((cls) => cls.id === response.class_id);
        if (exists) {
          setSelectedClass(response.class_id);
        }
      }

      setIsCreateDialogOpen(false);
      resetClassForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create class.";
      toast({
        title: "Unable to create class",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSavingClass(false);
    }
  };

  const handleEditClassSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingClassId) {
      return;
    }

    if (!teacherId) {
      toast({
        title: "Missing teacher profile",
        description: "No teacher information is available. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    const validation = validateClassForm();
    if (!validation) {
      return;
    }

    setIsSavingClass(true);
    try {
      const existingStudentsPayload = validation.validStudents
        .filter((student) => student.existingId)
        .map((student) => ({
          id: student.existingId,
          full_name: student.name,
          parent_phone: student.phone,
          active: true,
        }));

      const newStudentsPayload = validation.validStudents
        .filter((student) => !student.existingId)
        .map((student) => ({
          full_name: student.name,
          parent_phone: student.phone,
        }));

      const payload: Parameters<typeof updateClass>[1] = {
        name: validation.trimmedName,
        teacher_user_id: teacherId,
      };

      if (existingStudentsPayload.length > 0) {
        payload.students = existingStudentsPayload;
      }

      if (newStudentsPayload.length > 0) {
        payload.new_students = newStudentsPayload;
      }

      const response = await updateClass(editingClassId, payload);

      toast({
        title: "Class updated",
        description:
          response.message ??
          (newStudentsPayload.length > 0
            ? `${newStudentsPayload.length} student(s) added successfully.`
            : "The class was updated successfully."),
      });

      await loadClasses();
      setSelectedClass(editingClassId);
      setIsEditDialogOpen(false);
      setEditingClassId(null);
      resetClassForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update class.";
      toast({
        title: "Unable to update class",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSavingClass(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const targetClass = classes.find((cls) => cls.id === classId);
    if (!targetClass) {
      return;
    }

    setIsDeletingClassId(classId);
    try {
      const response = await removeClass(classId);
      toast({
        title: "Class deleted",
        description: response.message ?? `${targetClass.name} was removed.`,
      });

      await loadClasses();
      if (selectedClass === classId) {
        setSelectedClass("");
        setStudents([]);
        setSubmitted(false);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete class.";
      toast({
        title: "Unable to delete class",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingClassId(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      toast({
        title: "Select a class",
        description: "Choose a class before submitting attendance.",
      });
      return;
    }

    if (!teacherId) {
      toast({
        title: "Missing teacher profile",
        description: "No teacher information is available. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    if (students.length === 0) {
      toast({
        title: "No students to submit",
        description: "Add students to this class before submitting attendance.",
      });
      return;
    }

    setIsSubmittingAttendance(true);
    try {
      const response = await submitAttendance({
        class_id: selectedClass,
        marked_by: teacherId,
        date: new Date().toISOString().slice(0, 10),
        records: students.map((student) => ({
          student_id: student.id,
          status: student.status,
          note: student.notes === "none" ? null : student.notes,
        })),
      });

      setSubmitted(true);
      toast({
        title: "Attendance submitted",
        description: response.message ?? "Records saved successfully.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit attendance.";
      toast({
        title: "Unable to submit attendance",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const renderStudentFormFields = ({ disabled = false }: { disabled?: boolean } = {}) => (
    <div className="space-y-4">
      {classFormData.students.map((student, index) => (
        <div
          key={student.key}
          className="space-y-3 rounded-lg border border-muted/40 bg-muted/10 p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Student {index + 1}</p>
            {classFormData.students.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => handleRemoveStudentDraft(student.key)}
                disabled={disabled}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`student-name-${student.key}`}>Student name</Label>
              <Input
                id={`student-name-${student.key}`}
                value={student.name}
                onChange={(event) =>
                  updateFormStudent(student.key, "name", event.target.value)
                }
                placeholder="e.g. Priya Agarwal"
                disabled={disabled}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`student-phone-${student.key}`}>Phone number</Label>
              <Input
                id={`student-phone-${student.key}`}
                value={student.phone}
                onChange={(event) =>
                  updateFormStudent(student.key, "phone", event.target.value)
                }
                placeholder="e.g. +923001234567"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAddStudentDraft}
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
        Add student
      </Button>
    </div>
  );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${attendigoBg2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
                        {selectedClassName || (isLoadingClasses ? "Loading..." : "Select a class")}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingClasses ? "Loading classes..." : "No classes found."}
                        </CommandEmpty>
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
                                    disabled={isDeletingClassId === cls.id}
                                  >
                                    {isDeletingClassId === cls.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
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
            {classesError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {classesError}
              </div>
            )}
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-1 gap-4 font-semibold text-primary md:grid-cols-3 md:gap-4 md:pb-4">
                  <div>Student Name</div>
                  <div>Status</div>
                  <div>Notes</div>
                </div>
                {isLoadingClasses ? (
                  <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" />
                    Loading classes...
                  </div>
                ) : !selectedClass ? (
                  <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                    No classes available yet. Create a class to get started.
                  </div>
                ) : students.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                    No students available for this class yet. Add students from the class menu above.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="grid grid-cols-1 gap-4 rounded-lg bg-muted/30 p-4 md:grid-cols-3 md:gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue text-sm font-medium">
                            {student.name
                              .split(" ")
                              .filter(Boolean)
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium leading-snug">{student.name}</span>
                            <span className="text-xs text-muted-foreground">{student.phone}</span>
                          </div>
                        </div>

                        <RadioGroup
                          value={student.status}
                          onValueChange={(value) =>
                            updateStudentStatus(student.id, value as "present" | "absent")
                          }
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

                        <Select
                          value={student.notes}
                          onValueChange={(value) => updateStudentNotes(student.id, value)}
                        >
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
              <div className="mt-6 rounded-lg border border-accent-green/30 bg-accent-green/20 p-4">
                <p className="font-medium text-secondary">
                  Attendance submitted successfully.
                </p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              className="mt-6 w-full"
              variant="secondary"
              size="lg"
              disabled={!selectedClass || students.length === 0 || isSubmittingAttendance}
            >
              {isSubmittingAttendance ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </CardContent>
        </Card>

        <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
          <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
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
                  disabled={isSavingClass}
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Students</Label>
                  <p className="text-xs text-muted-foreground">
                    Provide each student's name and phone number.
                  </p>
                </div>
                {renderStudentFormFields({ disabled: isSavingClass })}
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreateDialogOpenChange(false)}
                  disabled={isSavingClass}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingClass}>
                  {isSavingClass ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save class"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
          <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
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
                  disabled={isSavingClass}
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Students</Label>
                  <p className="text-xs text-muted-foreground">
                    Update the roster by editing names or phone numbers, or remove students.
                  </p>
                </div>
                {renderStudentFormFields({ disabled: isSavingClass })}
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleEditDialogOpenChange(false)}
                  disabled={isSavingClass}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingClass}>
                  {isSavingClass ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TakeAttendance;
