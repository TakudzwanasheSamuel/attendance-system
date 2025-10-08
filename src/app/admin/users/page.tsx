import { UserTable } from "@/components/admin/user-table";
import { getAllUsers } from "@/lib/database-actions";
import { Search } from "lucide-react";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { UserSearch } from "@/components/admin/user-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@prisma/client";

export default async function UserManagementPage() {
    const users = await getAllUsers();
    
    // Group users by role
    const admins = users.filter(user => user.role === 'ADMIN');
    const lecturers = users.filter(user => user.role === 'LECTURER');
    const students = users.filter(user => user.role === 'STUDENT');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline">User Management</h2>
                    <p className="text-muted-foreground">View, create, and manage all users in the system.</p>
                </div>
                <div className="flex items-center gap-2">
                    <UserSearch />
                    <AddUserDialog />
                </div>
            </div>
            
            <Tabs defaultValue="admins" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="admins" className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">ADMIN</Badge>
                        <span>Administrators ({admins.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="lecturers" className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">LECTURER</Badge>
                        <span>Lecturers ({lecturers.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="students" className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">STUDENT</Badge>
                        <span>Students ({students.length})</span>
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="admins" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Administrators</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UserTable users={admins} />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="lecturers" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lecturers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UserTable users={lecturers} />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="students" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UserTable users={students} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
