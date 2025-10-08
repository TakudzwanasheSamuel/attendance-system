import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { UserTableActions } from "./user-table-actions";
import { User } from "@prisma/client";

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
    const userAvatar = PlaceHolderImages.find(p => p.id === "avatar-1");
  
  return (
    <div className="border rounded-md">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {users.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No users found.</TableCell>
                </TableRow>
            )}
            {users.map((user) => (
            <TableRow key={user.id}>
                <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar>
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint}/>}
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'LECTURER' ? 'default' : 'secondary'}>
                    {user.role}
                </Badge>
                </TableCell>
                <TableCell className="text-right">
                   <UserTableActions user={user} />
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
