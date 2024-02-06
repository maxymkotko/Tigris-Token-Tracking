import { ErrorOutlineOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import { styled } from '@mui/system';

interface notificationProps {
  content: string;
}

export const Notification = (props: notificationProps) => {
  return (
    <NotificationContainer>
      <ErrorOutlineOutlined sx={{ width: '20px', height: '20px', color: '#6FCF97', marginTop: '2px' }} />
      <AlertContent>{props.content}</AlertContent>
    </NotificationContainer>
  );
};

const NotificationContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#141416',
  borderRadius: '0px',
  padding: '20px 16px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '9px'
}));

const AlertContent = styled(Box)(({ theme }) => ({
  color: '#B1B5C3',
  fontSize: '14px',
  lineHeight: '24px',
  fontWeight: '400'
}));
