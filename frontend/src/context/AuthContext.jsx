import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // Check if onboarding is complete
          if (!userData.onboardingComplete) {
            setIsFirstLogin(true);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // TODO: Replace with actual API call
      // const response = await authService.login(email, password);
      
      // MOCK login for now
      const mockUser = {
        id: '1',
        name: 'Demo User',
        email: email,
        onboardingComplete: false,
        isStudent: null,
        hasGoal: null,
        goal: null,
        goalDuration: null,
        foodPreference: null,
        sleepSchedule: null,
      };
      const mockToken = 'mock-jwt-token-' + Date.now();

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);

      setUser(mockUser);
      setIsFirstLogin(true);

      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    try {
      // TODO: Replace with actual API call
      const mockUser = {
        id: Date.now().toString(),
        name,
        email,
        onboardingComplete: false,
        isStudent: null,
        hasGoal: null,
        goal: null,
        goalDuration: null,
        foodPreference: null,
        sleepSchedule: null,
      };
      const mockToken = 'mock-jwt-token-' + Date.now();

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);

      setUser(mockUser);
      setIsFirstLogin(true);

      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Signup failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Complete onboarding (Student? Goal? Duration?)
  const completeOnboarding = (onboardingData) => {
    const updatedUser = {
      ...user,
      ...onboardingData,
      onboardingComplete: true,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsFirstLogin(false);
  };

  // Update user data (sleep schedule, food preference, etc.)
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsFirstLogin(false);
  };

  const value = {
    user,
    loading,
    isFirstLogin,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;