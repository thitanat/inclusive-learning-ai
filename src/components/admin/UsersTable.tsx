import React from 'react';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { User } from './types';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onAdd: () => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete, onAdd }) => {
  // Function to convert users data to CSV format
  const downloadCSV = () => {
    // Define CSV headers
    const headers = ['ID', 'First Name', 'Last Name', 'Email'];
    
    // Convert users data to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...users.map(user => [
        user._id,
        user.firstName,
        user.lastName,
        user.email
      ].join(','))
    ];
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-100">Users ({users.length})</h2>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadCSV}
            sx={{
              color: '#22c55e',
              borderColor: '#22c55e',
              '&:hover': { 
                borderColor: '#16a34a',
                backgroundColor: 'rgba(34, 197, 94, 0.1)'
              }
            }}
          >
            Download CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              '&:hover': { background: 'linear-gradient(135deg, #16a34a, #15803d)' }
            }}
          >
            Add User
          </Button>
        </div>
      </div>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Actions</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user._id}>
                <TableCell>
                  <IconButton 
                    size="small"
                    onClick={() => onEdit(user)}
                    sx={{ color: '#22c55e', mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => onDelete(user._id)}
                    sx={{ color: '#ef4444' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
                <TableCell>{user._id}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
};

export default UsersTable;
