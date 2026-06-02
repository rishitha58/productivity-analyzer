import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  footer = null,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => closeOnBackdrop && onClose()}
            className="absolute inset-0 bg-gradient-to-br from-lavender-900/30 to-babyBlue-900/30 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative w-full ${sizes[size]} bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
          >
            {/* Decorative gradient top */}
            <div className="h-1.5 bg-gradient-to-r from-lavender-300 via-peach-300 to-mint-300" />

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="px-6 py-4 flex items-center justify-between border-b border-lavender-100">
                {title && (
                  <h3 className="text-xl font-display font-bold text-gray-800">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-blush-100 transition-colors group ml-auto"
                  >
                    <X
                      size={20}
                      className="text-gray-400 group-hover:text-blush-500"
                    />
                  </motion.button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 bg-gradient-to-r from-lavender-50 to-babyBlue-50 border-t border-lavender-100 flex items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Confirmation Modal variant
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning' | 'danger' | 'info'
}) => {
  const typeStyles = {
    warning: 'bg-gradient-to-r from-yellow-300 to-peach-300',
    danger: 'bg-gradient-to-r from-blush-300 to-blush-400',
    info: 'bg-gradient-to-r from-lavender-300 to-babyBlue-300',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-outline">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-3 ${typeStyles[type]} text-white font-medium rounded-xl shadow-soft hover:shadow-medium hover:scale-105 transition-all duration-300`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-gray-600 leading-relaxed">{message}</p>
    </Modal>
  );
};

export default Modal;