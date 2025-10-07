"use client";

import { UserTable } from "@/components/admin/user-table";
import { admins, lecturers, students } from "@/lib/mock-data";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddUserDialog } from "@/components/admin/add-user-dialog";

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const allUsers = useMemo(() => {
        const users = [
            ...admins.map(u => ({...u, role: 'Admin'})),
            ...lecturers.map(u => ({...u, role: 'Lecturer'})),
            ...students.map(u => ({...u, role: 'Student'}))
        ];

        if (!searchTerm) {
            return users;
        }

        return users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline">User Management</h2>
                    <p className="text-muted-foreground">View, create, and manage all users in the system.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <AddUserDialog />
                </div>
            </div>
            <UserTable users={allUsers} />
        </div>
    );
}
