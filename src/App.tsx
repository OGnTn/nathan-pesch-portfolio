import { useState, useEffect, useRef } from 'react';
import { defaultPortfolioData, PortfolioData } from './types';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import { generateStaticHTML, downloadFile } from './utils';
import { Moon, Sun, Monitor, PenSquare, Download, FileText } from 'lucide-react';
import { cn } from './utils';
import { auth, db, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { get, set } from 'idb-keyval';

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; 
  }
  return Math.abs(hash).toString(36);
};

export default function App() {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStaticHost, setIsStaticHost] = useState(false);
  const uploadedMediaRef = useRef<Set<string>>(new Set());
  
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
    const fetchData = async () => {
      try {
        let response = await fetch('/api/data');
        if (!response.ok) {
          setIsStaticHost(true);
          response = await fetch('./data.json');
        } else {
          setIsStaticHost(false);
        }
        if (response.ok) {
          const apiData = await response.json();
          setData(apiData);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log("Local API not running or data.json not found, falling back to Firebase...");
      }

      // Fallback to Firebase
      try {
        const docRef = doc(db, 'portfolios', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          let parsedData: any = firestoreData;
          if (firestoreData.isChunked) {
            try {
              const chunkCount = firestoreData.chunkCount;
              let fullString = '';
              for (let i = 0; i < chunkCount; i++) {
                const chunkSnap = await getDoc(doc(db, 'portfolios', 'main', 'chunks', i.toString()));
                if (chunkSnap.exists()) {
                  fullString += chunkSnap.data().data;
                }
              }
              if (fullString) {
                parsedData = JSON.parse(fullString);
              }
            } catch (e) {
              console.error("Error loading chunks", e);
            }
          }
          
          if (parsedData.projects) {
            for (const p of parsedData.projects) {
              if (p.images) {
                for (let i = 0; i < p.images.length; i++) {
                  if (typeof p.images[i] === 'string' && p.images[i].startsWith('media-ref:')) {
                    const mediaId = p.images[i].substring('media-ref:'.length);
                    try {
                      const mediaDoc = await getDoc(doc(db, 'portfolios', 'main', 'media', mediaId));
                      if (mediaDoc.exists()) {
                        const mediaData = mediaDoc.data();
                        let resolvedStr = mediaData.data;
                        if (mediaData.isChunked) {
                          resolvedStr = '';
                          for (let c = 0; c < mediaData.chunkCount; c++) {
                            const cDoc = await getDoc(doc(db, 'portfolios', 'main', 'media', `${mediaId}_chunk_${c}`));
                            if (cDoc.exists()) {
                               resolvedStr += cDoc.data().data;
                            }
                          }
                        }
                        if (resolvedStr) {
                           p.images[i] = resolvedStr;
                        }
                      }
                    } catch (e) {
                      console.error("Error loading media", e);
                    }
                  }
                }
              }
            }
          }
          
          setData(parsedData as PortfolioData);
        } else {
          // Migration from IndexedDB if Firestore is empty
          try {
            const idbData = await get('portfolio-data');
            if (idbData) {
              setData(idbData);
            }
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpdateData = (newData: PortfolioData | ((prev: PortfolioData) => PortfolioData)) => {
    const updatedData = typeof newData === 'function' ? newData(data) : newData;
    setData(updatedData);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });
      } catch (error) {
        console.error("Error saving data to local API", error);
      }
      
      // Also save locally as a backup for users who are not running the dev server
      set('portfolio-data', updatedData);
    }, 1500); // Debounce save
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

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(`data.json`, jsonString, 'application/json');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && typeof importedData === 'object') {
          handleUpdateData(importedData as PortfolioData);
          alert("Imported successfully!");
        }
      } catch (error) {
        alert("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            {!isStaticHost && (
              <>
                {/* View Toggle */}
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

                <div className="h-4 w-px bg-[#1A1A1A] dark:bg-[#F5F5F3] hidden sm:block"></div>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              {!isStaticHost && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    title="Import JSON"
                    className="text-[10px] uppercase tracking-[1px] font-bold hover:underline"
                  >
                    IMPORT JSON
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportJSON}
                    accept=".json"
                    className="hidden"
                  />
                  <button 
                    onClick={handleExportJSON}
                    title="Export JSON"
                    className="text-[10px] uppercase tracking-[1px] font-bold hover:underline"
                  >
                    EXPORT JSON
                  </button>
                  <div className="h-4 w-px bg-[#1A1A1A] dark:bg-[#F5F5F3] opacity-30"></div>
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
                      LOAD FIREBASE DATA (LOGIN)
                    </button>
                  )}
                  <button 
                    onClick={handleExportHTML}
                    title="Download HTML"
                    className="text-[10px] uppercase tracking-[1px] font-bold hover:underline"
                  >
                    HTML
                  </button>
                  <button 
                    onClick={handlePrint}
                    title="Export as PDF"
                    className="text-[10px] uppercase tracking-[1px] font-bold hover:underline"
                  >
                    PDF
                  </button>
                </>
              )}
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
        {isEditMode && user && !isStaticHost ? (
          <Dashboard data={data} setData={handleUpdateData} />
        ) : (
          <Portfolio data={data} />
        )}
      </div>
    </div>
  );
}
