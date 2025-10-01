import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import attendigoBg2 from "@/assets/attendigo_bg2.png";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: number;
  name: string;
  status: 'present' | 'absent';
  notes: string;
}

const TakeAttendance = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: 'Emma Johnson', status: 'present', notes: 'none' },
    { id: 2, name: 'Michael Brown', status: 'absent', notes: 'Left early' },
    { id: 3, name: 'Sarah Davis', status: 'present', notes: 'none' },
    { id: 4, name: 'Alex Wilson', status: 'absent', notes: 'Sick' },
    { id: 5, name: 'Jessica Miller', status: 'present', notes: 'none' },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const updateStudentStatus = (studentId: number, status: 'present' | 'absent') => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const updateStudentNotes = (studentId: number, notes: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, notes } : student
      )
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast({
      title: "Success!",
      description: "Attendance submitted and parents notified successfully!",
    });
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
      <Navbar showReportsButton />
      
      <div className="container mx-auto p-4 space-y-6">
        <Card className="backdrop-blur-sm bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Take Attendance</CardTitle>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grade8-b">Grade 8 - Section B</SelectItem>
                <SelectItem value="grade7-a">Grade 7 - Section A</SelectItem>
                <SelectItem value="grade6-c">Grade 6 - Section C</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 font-semibold text-primary">
                  <div>Student Name</div>
                  <div>Status</div>
                  <div>Notes</div>
                </div>
                
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
      </div>
    </div>
  );
};

export default TakeAttendance;