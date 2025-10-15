"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Users, AlertTriangle, CheckCircle, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  relationship?: string;
}

interface ParentEmailManagementProps {
  students: Student[];
  onUpdateStudent: (studentId: string, data: Partial<Student>) => Promise<void>;
}

export function ParentEmailManagement({ students, onUpdateStudent }: ParentEmailManagementProps) {
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: ''
  });

  const studentsWithParentEmail = students.filter(s => s.parentEmail);
  const studentsWithoutParentEmail = students.filter(s => !s.parentEmail);

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditForm({
      parentName: student.parentName || '',
      parentEmail: student.parentEmail || '',
      parentPhone: student.parentPhone || '',
      relationship: student.relationship || ''
    });
  };

  const handleSaveStudent = async () => {
    if (!editingStudent) return;

    try {
      await onUpdateStudent(editingStudent.id, editForm);
      setEditingStudent(null);
      toast({
        title: "Success",
        description: "Parent information updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update parent information",
        variant: "destructive",
      });
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test",
        variant: "destructive",
      });
      return;
    }

    setIsTestingEmail(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Test Email Sent",
          description: `Test email sent successfully to ${testEmail}`,
        });
        setIsTestDialogOpen(false);
        setTestEmail('');
      } else {
        toast({
          title: "Test Failed",
          description: result.error || "Failed to send test email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleCheckAttendance = async () => {
    try {
      const response = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkAll: true })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Attendance Check Complete",
          description: "Attendance has been checked for all students with parent emails",
        });
      } else {
        toast({
          title: "Check Failed",
          description: result.error || "Failed to check attendance",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check attendance",
        variant: "destructive",
      });
    }
  };

  const handleSendAlert = async (student: Student) => {
    try {
      const response = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id })
      });

      const result = await response.json();

      if (result.success && result.attendanceStats) {
        const stats = result.attendanceStats;
        const isGoodAttendance = stats.overallAttendance >= 50;
        
        if (isGoodAttendance) {
          toast({
            title: "Good News Sent",
            description: `Positive attendance update sent to ${student.parentName || 'parent'} for ${student.name} (${stats.overallAttendance}% attendance)`,
            variant: "default",
          });
        } else {
          toast({
            title: "Alert Sent",
            description: `Attendance alert sent to ${student.parentName || 'parent'} for ${student.name} (${stats.overallAttendance}% attendance)`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Alert Failed",
          description: result.error || "Failed to send attendance alert",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send attendance alert",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Parent Email Management</h2>
          <p className="text-muted-foreground">
            Manage parent/guardian contact information for attendance notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Test Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Email Service</DialogTitle>
                <DialogDescription>
                  Send a test email to verify the email service is working correctly.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address to test"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTestEmail} disabled={isTestingEmail}>
                  {isTestingEmail ? "Sending..." : "Send Test Email"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleCheckAttendance}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Check Attendance
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">All enrolled students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Parent Email</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{studentsWithParentEmail.length}</div>
            <p className="text-xs text-muted-foreground">Can receive notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Parent Email</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{studentsWithoutParentEmail.length}</div>
            <p className="text-xs text-muted-foreground">Need parent information</p>
          </CardContent>
        </Card>
      </div>

      {/* Students with Parent Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Students with Parent Email ({studentsWithParentEmail.length})
          </CardTitle>
          <CardDescription>
            These students can receive attendance notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentsWithParentEmail.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{student.name}</p>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {student.relationship || 'Parent'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  <p className="text-sm text-green-700">
                    📧 {student.parentEmail} ({student.parentName || 'Parent'})
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendAlert(student)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Mail className="mr-1 h-3 w-3" />
                    Send Update
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditStudent(student)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students without Parent Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Students Missing Parent Email ({studentsWithoutParentEmail.length})
          </CardTitle>
          <CardDescription>
            Add parent information to enable attendance notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentsWithoutParentEmail.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  <p className="text-sm text-orange-700">⚠️ No parent email configured</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditStudent(student)}
                >
                  Add Parent Info
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parent Information</DialogTitle>
            <DialogDescription>
              Update parent/guardian contact information for {editingStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent-name">Parent/Guardian Name</Label>
              <Input
                id="parent-name"
                value={editForm.parentName}
                onChange={(e) => setEditForm(prev => ({ ...prev, parentName: e.target.value }))}
                placeholder="e.g., John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-email">Parent/Guardian Email</Label>
              <Input
                id="parent-email"
                type="email"
                value={editForm.parentEmail}
                onChange={(e) => setEditForm(prev => ({ ...prev, parentEmail: e.target.value }))}
                placeholder="e.g., parent@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-phone">Parent/Guardian Phone</Label>
              <Input
                id="parent-phone"
                value={editForm.parentPhone}
                onChange={(e) => setEditForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                placeholder="e.g., +263 77 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select value={editForm.relationship} onValueChange={(value) => setEditForm(prev => ({ ...prev, relationship: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Uncle">Uncle</SelectItem>
                  <SelectItem value="Aunt">Aunt</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStudent}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
