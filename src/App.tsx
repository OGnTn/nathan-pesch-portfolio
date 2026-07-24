import { useState, useEffect } from 'react';
import { defaultPortfolioData, PortfolioData } from './types';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import { generateStaticHTML, downloadFile } from './utils';
import { Moon, Sun, Monitor, PenSquare, Download, FileText } from 'lucide-react';
import { cn } from './utils';
import { auth, db, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { get, set } from 'idb-keyval';

export default function App() {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Handle Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsEditMode(false);
      }
    }, (error) => {
      console.error("Auth state error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Handle Data Sync
  useEffect(() => {
    const docRef = doc(db, 'portfolios', 'main');
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const firestoreData = docSnap.data() as PortfolioData;
        setData(firestoreData);
      } else {
        // Migration from IndexedDB if Firestore is empty
        try {
          const idbData = await get('portfolio-data');
          if (idbData) {
            setData(idbData);
            // We can't write to Firestore if not authenticated, so wait for login
          }
        } catch (error) {
          console.error(error);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateData = async (newData: PortfolioData | ((prev: PortfolioData) => PortfolioData)) => {
    const updatedData = typeof newData === 'function' ? newData(data) : newData;
    setData(updatedData);
    
    if (user) {
      try {
        const docData = {
          ...updatedData,
          ownerUid: user.uid
        };
        
        // Firestore limit is ~1MB (1,048,576 bytes)
        const payloadString = JSON.stringify(docData);
        if (payloadString.length > 900000) { // Rough safety margin
          alert("Your portfolio data is too large to save. Please reduce the size or number of uploaded images.");
          return;
        }

        await setDoc(doc(db, 'portfolios', 'main'), docData);
      } catch (error) {
        console.error("Error saving to Firestore", error);
        alert("Error saving: Data might be too large.");
      }
    } else {
      // Save locally if not logged in
      set('portfolio-data', updatedData);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleExportHTML = () => {
    const htmlString = generateStaticHTML(data);
    downloadFile(`${data.name.replace(/\\s+/g, '_').toLowerCase()}_portfolio.html`, htmlString, 'text/html');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen font-sans transition-colors duration-200 bg-[#F5F5F3] text-[#1A1A1A] dark:bg-[#1A1A1A] dark:text-[#F5F5F3]">
      {/* Navigation / Toolbar - Hidden when printing */}
      <nav className="sticky top-0 z-50 bg-[#F5F5F3] dark:bg-[#1A1A1A] border-b border-[#1A1A1A] dark:border-[#F5F5F3] print:hidden">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
          </div>

          <div className="flex items-center gap-6">
            {/* View Toggle - Only show if logged in */}
            {user && (
              <div className="flex p-0.5 border border-[#1A1A1A] dark:border-[#F5F5F3]">
                <button
                  onClick={() => setIsEditMode(false)}
                  className={cn(
                    "px-4 py-1 text-[10px] uppercase tracking-[1px] font-bold transition-all",
                    !isEditMode ? "bg-[#1A1A1A] text-[#F5F5F3] dark:bg-[#F5F5F3] dark:text-[#1A1A1A]" : "bg-transparent hover:opacity-70"
                  )}
                >
                  View
                </button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className={cn(
                    "px-4 py-1 text-[10px] uppercase tracking-[1px] font-bold transition-all",
                    isEditMode ? "bg-[#1A1A1A] text-[#F5F5F3] dark:bg-[#F5F5F3] dark:text-[#1A1A1A]" : "bg-transparent hover:opacity-70"
                  )}
                >
                  Edit
                </button>
              </div>
            )}

            <div className="h-4 w-px bg-[#1A1A1A] dark:bg-[#F5F5F3] hidden sm:block"></div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="text-[10px] uppercase tracking-[1px] font-bold hover:underline"
                >
                  LOGOUT
                </button>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="text-[10px] uppercase tracking-[1px] font-bold hover:underline"
                >
                  ADMIN LOGIN
                </button>
              )}
              <button 
                onClick={handlePrint}
                title="Export as PDF"
                className="text-[10px] uppercase tracking-[1px] font-bold hover:underline"
              >
                PDF
              </button>
              <button 
                onClick={handleExportHTML}
                title="Download HTML"
                className="text-[10px] uppercase tracking-[1px] font-bold hover:underline"
              >
                HTML
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                title="Toggle Dark Mode"
                className="flex items-center gap-2 ml-2"
              >
                <div className="w-8 h-4 bg-[#1A1A1A] dark:bg-[#F5F5F3] rounded-full relative">
                  <div className={cn("w-3 h-3 bg-[#F5F5F3] dark:bg-[#1A1A1A] rounded-full absolute top-0.5 transition-all", darkMode ? "right-0.5" : "left-0.5")} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pb-24">
        {isEditMode && user ? (
          <Dashboard data={data} setData={handleUpdateData} />
        ) : (
          <Portfolio data={data} />
        )}
      </div>
    </div>
  );
}
