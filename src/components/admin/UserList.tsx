
import { Button } from '@/components/ui/button';
import { useUserManagement } from './UserManagementContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminUser } from './types';

export function UserList() {
  const { 
    users, 
    isLoading, 
    handleToggleUserStatus,
    setSelectedUser,
    setIsConfirmDeleteOpen,
    setIsUserDetailsOpen
  } = useUserManagement();

  const handleViewUserDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User List</CardTitle>
        <CardDescription>Manage existing users</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading users...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} className="cursor-pointer">
                  <TableCell 
                    className="font-medium"
                    onClick={() => handleViewUserDetails(user)}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell onClick={() => handleViewUserDetails(user)}>
                    {user.role || 'user'}
                  </TableCell>
                  <TableCell onClick={() => handleViewUserDetails(user)}>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.disabled ? 'Suspended' : 'Active'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                      >
                        {user.disabled ? 'Activate' : 'Suspend'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsConfirmDeleteOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
