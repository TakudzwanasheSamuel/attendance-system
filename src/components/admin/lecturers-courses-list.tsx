"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Book, Mail, User } from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Lecturer {
  id: string;
  name: string;
  email: string;
  courses: Course[];
}

interface LecturersCoursesListProps {
  lecturers: Lecturer[];
}

export function LecturersCoursesList({ lecturers }: LecturersCoursesListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {lecturers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No lecturers found</p>
        </div>
      ) : (
        lecturers.map((lecturer) => (
          <Card key={lecturer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(lecturer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg font-semibold">
                    {lecturer.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {lecturer.email}
                  </div>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {lecturer.courses.length} {lecturer.courses.length === 1 ? 'Course' : 'Courses'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {lecturer.courses.length === 0 ? (
                <div className="text-sm text-muted-foreground italic py-2">
                  No courses assigned
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Book className="h-4 w-4" />
                    Assigned Courses
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {lecturer.courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {course.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course.code}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
