import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Demo users data
  const demoUsers = [
    {
      email: 'admin@coffee.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin' as const
    },
    {
      email: 'cashier@coffee.com',
      password: 'cashier123',
      name: 'Cashier User',
      role: 'cashier' as const
    },
    {
      email: 'server@coffee.com',
      password: 'server123',
      name: 'Server User',
      role: 'server' as const
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Update last login
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            lastLogin: serverTimestamp()
          });

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name,
              role: userData.role,
              isActive: userData.isActive,
              createdAt: userData.createdAt?.toDate() || new Date(),
              lastLogin: new Date(),
            });
          } else {
            // If user document doesn't exist, create it with default data
            const defaultUserData = {
              name: firebaseUser.email?.split('@')[0] || 'User',
              role: 'cashier',
              isActive: true,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), defaultUserData);
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: defaultUserData.name,
              role: defaultUserData.role as 'admin' | 'cashier' | 'server',
              isActive: defaultUserData.isActive,
              createdAt: new Date(),
              lastLogin: new Date(),
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Error loading user data');
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createDemoUsers = async () => {
    try {
      for (const demoUser of demoUsers) {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            demoUser.email, 
            demoUser.password
          );
          
          // Create user document in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: demoUser.name,
            role: demoUser.role,
            isActive: true,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          });
          
          console.log(`Created demo user: ${demoUser.email}`);
        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            console.log(`Demo user already exists: ${demoUser.email}`);
          } else {
            console.error(`Error creating demo user ${demoUser.email}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error creating demo users:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Try to sign in first
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully');
      } catch (signInError: any) {
        if (signInError.code === 'auth/user-not-found' || 
            signInError.code === 'auth/invalid-credential' ||
            signInError.code === 'auth/wrong-password') {
          // If it's a demo user, create the account
          const demoUser = demoUsers.find(user => user.email === email && user.password === password);
          if (demoUser) {
            toast.loading('Setting up demo account...');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              name: demoUser.name,
              role: demoUser.role,
              isActive: true,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
            
            toast.dismiss();
            toast.success('Demo account created and logged in successfully');
          } else {
            throw signInError;
          }
        } else {
          throw signInError;
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Incorrect email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message || 'Login failed';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  // Initialize demo users on first load
  useEffect(() => {
    const initializeDemoUsers = async () => {
      // Only create demo users if we're not already authenticated
      if (!firebaseUser && !loading) {
        await createDemoUsers();
      }
    };

    initializeDemoUsers();
  }, [firebaseUser, loading]);

  return {
    user,
    firebaseUser,
    loading,
    login,
    logout,
  };
};