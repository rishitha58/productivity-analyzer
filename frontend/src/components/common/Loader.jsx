import { motion } from 'framer-motion';

const Loader = ({ size = 'md', text = '', fullScreen = false }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className={`${sizes[size]} rounded-full border-4 border-lavender-100 border-t-lavender-400`}
        />
        {/* Inner pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-gradient-to-br from-lavender-300 to-babyBlue-300"
        />
      </div>
      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-gray-500 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loader for content
export const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-lavender-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-lavender-100 rounded w-3/4" />
        <div className="h-3 bg-lavender-100 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-lavender-100 rounded w-full" />
      <div className="h-3 bg-lavender-100 rounded w-5/6" />
    </div>
  </div>
);

export default Loader;