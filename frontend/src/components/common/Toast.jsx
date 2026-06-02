import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        top: 80,
        right: 20,
      }}
      toastOptions={{
        duration: 3500,
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          borderRadius: '16px',
          padding: '14px 18px',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          boxShadow: '0 8px 24px rgba(195, 177, 225, 0.25)',
          border: '1px solid #E8DCF5',
          maxWidth: '380px',
        },
        success: {
          iconTheme: {
            primary: '#69CEA9',
            secondary: '#FFFFFF',
          },
          style: {
            background: 'linear-gradient(135deg, #D9F7E9 0%, #C7F2C7 100%)',
            border: '1px solid #B5EAD7',
          },
        },
        error: {
          iconTheme: {
            primary: '#FF6565',
            secondary: '#FFFFFF',
          },
          style: {
            background: 'linear-gradient(135deg, #FFD9D9 0%, #FFB3B3 100%)',
            border: '1px solid #FF8C8C',
          },
        },
        loading: {
          iconTheme: {
            primary: '#A98FD1',
            secondary: '#FFFFFF',
          },
          style: {
            background: 'linear-gradient(135deg, #E8DCF5 0%, #D5C2EB 100%)',
            border: '1px solid #C3B1E1',
          },
        },
      }}
    />
  );
};

export default Toast;