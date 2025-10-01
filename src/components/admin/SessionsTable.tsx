import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import { Session, User } from './types';
import SessionDetailModal from './SessionDetailModal';

interface SessionsTableProps {
  sessions: Session[];
  users: User[];
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  onAdd: () => void;
}

const SessionsTable: React.FC<SessionsTableProps> = ({ sessions, users, onEdit, onDelete, onAdd }) => {
  const [modalData, setModalData] = useState<{
    open: boolean;
    title: string;
    data: any;
  }>({
    open: false,
    title: '',
    data: null,
  });

  const handleOpenModal = (title: string, data: any) => {
    setModalData({
      open: true,
      title,
      data,
    });
  };

  const handleCloseModal = () => {
    setModalData({
      open: false,
      title: '',
      data: null,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleDownloadJSON = () => {
    try {
      // Combine sessions with user data for complete export, excluding blob field
      const enrichedSessions = sessions.map(session => {
        const user = users.find(u => u._id === session.userId);
        // Extract session data and exclude blob field
        const { blob, ...sessionWithoutBlob } = session;
        return {
          ...sessionWithoutBlob,
          userDetails: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          } : null,
        };
      });

      const exportData = {
        exportMetadata: {
          timestamp: new Date().toISOString(),
          totalSessions: sessions.length,
          exportedBy: 'Admin Dashboard',
        },
        sessions: enrichedSessions,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `sessions-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading JSON:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-100">Sessions ({sessions.length})</h2>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadJSON}
            sx={{
              borderColor: '#22c55e',
              color: '#22c55e',
              '&:hover': { 
                borderColor: '#16a34a',
                color: '#16a34a',
                backgroundColor: 'rgba(34, 197, 94, 0.1)'
              }
            }}
          >
            Download JSON
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
            Add Session
          </Button>
        </div>
      </div>
      <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 120 }}>Actions</TableCell>
              <TableCell sx={{ minWidth: 80 }}>ID</TableCell>
              <TableCell sx={{ minWidth: 150 }}>User</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Subject</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Topic</TableCell>
              <TableCell sx={{ minWidth: 80 }}>Level</TableCell>
              <TableCell sx={{ minWidth: 60 }}>Step</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Created</TableCell>
              <TableCell sx={{ minWidth: 80 }}>Students</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Study Period</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Content</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Objectives</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Lesson Plan</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Materials</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Enhanced</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map(session => {
              const user = users.find(u => u._id === session.userId);
              return (
                <TableRow key={session._id}>
                  <TableCell>
                    <Tooltip title="Edit Session">
                      <IconButton 
                        size="small"
                        onClick={() => onEdit(session)}
                        sx={{ color: '#22c55e', mr: 0.5 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Session">
                      <IconButton 
                        size="small"
                        onClick={() => onDelete(session._id)}
                        sx={{ color: '#ef4444', mr: 0.5 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Full Session">
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenModal('Complete Session Data', session)}
                        sx={{ color: '#3b82f6' }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={session._id}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {session._id.slice(-8)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {user ? `${user.firstName} ${user.lastName}` : session.userEmail || 'Unknown'}
                    <br />
                    <small style={{ color: '#666', fontSize: '0.7rem' }}>
                      {user?.email || session.userEmail}
                    </small>
                  </TableCell>
                  <TableCell>{session.content?.subject || session.subject || '-'}</TableCell>
                  <TableCell>{session.content?.lessonTopic || session.lessonTopic || '-'}</TableCell>
                  <TableCell>{session.content?.level || session.level || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={session.configStep || '-'} 
                      size="small" 
                      sx={{ 
                        bgcolor: (session.configStep && session.configStep >= 3) ? '#22c55e' : '#f59e0b',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {session.createdAt ? (
                      <span style={{ fontSize: '0.75rem' }}>
                        {formatDate(session.createdAt)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{session.numStudents || '-'}</TableCell>
                  <TableCell>{session.studyPeriod || '-'}</TableCell>
                  <TableCell>
                    {session.content ? (
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenModal('Content Details', session.content)}
                        sx={{ color: '#8b5cf6' }}
                      >
                        <InfoIcon />
                      </IconButton>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {session.objectives ? (
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenModal('Learning Objectives', session.objectives)}
                        sx={{ color: '#06b6d4' }}
                      >
                        <InfoIcon />
                      </IconButton>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {session.lessonPlan ? (
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenModal('Lesson Plan', session.lessonPlan)}
                        sx={{ color: '#f59e0b' }}
                      >
                        <InfoIcon />
                      </IconButton>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {session.teachingMaterials ? (
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenModal('Teaching Materials', session.teachingMaterials)}
                        sx={{ color: '#84cc16' }}
                      >
                        <InfoIcon />
                      </IconButton>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {session.enhancedData ? (
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenModal('Enhanced Data', session.enhancedData)}
                        sx={{ color: '#ec4899' }}
                      >
                        <InfoIcon />
                      </IconButton>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <SessionDetailModal
        open={modalData.open}
        onClose={handleCloseModal}
        title={modalData.title}
        data={modalData.data}
      />
    </section>
  );
};

export default SessionsTable;
