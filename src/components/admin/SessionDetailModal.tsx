import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import JsonDynamicRenderer from '../JsonDynamicRenderer';

interface SessionDetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: any;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  open,
  onClose,
  title,
  data,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#0f2e3a',
          color: '#dcfce7',
          minHeight: '60vh',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          backgroundColor: '#0a1f2a',
          color: '#4ade80',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(34, 197, 94, 0.3)',
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: '#4ade80',
            '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {data ? (
          <JsonDynamicRenderer data={data} />
        ) : (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="200px"
          >
            <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
              No data available
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailModal;