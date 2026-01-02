import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import URLImage from '../components/URLImage'; 

const FURNITURE_PALETTE = [
  { type: 'sofa', url: 'https://i.ibb.co/spqNwGy6/sofa.png', label: 'Lounge Sofa' },
  { type: 'table', url: 'https://i.ibb.co/S70C19jP/table.png', label: 'Round Table' },
  { type: 'singlesofa', url: 'https://i.ibb.co/j9CX5ydN/singlesofa.png', label: 'Single Sofa' },
  { type: 'bed', url: 'https://i.ibb.co/ZzVbtQKZ/bed.jpg', label: 'King Bed' },
  { type: 'drawer', url: 'https://i.ibb.co/JWWtsZgf/drawer.png', label: 'Drawer' },
  { type: 'desk', url: 'https://i.ibb.co/MD4fGPTn/desk.png', label: 'Desk' },
  { type: 'tv', url: 'https://i.ibb.co/V6V57QN/tv.png', label: 'TV Unit' },
];

const DesignEditor = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  // --- STATE ---
  const [roomSize, setRoomSize] = useState({ width: 800, height: 600 });
  const [inputSize, setInputSize] = useState({ w: 800, h: 600 });
  const [isRoomSet, setIsRoomSet] = useState(false); 
  
  const [items, setItems] = useState([]); 
  const [selectedId, selectShape] = useState(null); 
  const [designName, setDesignName] = useState("Untitled Room");
  const [loading, setLoading] = useState(false);
  
  // Save Button Status: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle');

  const dragUrl = useRef();
  const stageRef = useRef();

  // --- 1. LOAD DATA ON MOUNT ---
  useEffect(() => {
    if (id) {
      setLoading(true);
      const fetchDesign = async () => {
        try {
          const res = await axios.get(`/api/design/${id}`);
          setDesignName(res.data.name);
          setRoomSize(res.data.roomDimensions);
          setItems(res.data.items);
          setIsRoomSet(true); 
        } catch (err) {
          console.error(err);
          navigate('/');
        } finally {
          setLoading(false);
        }
      };
      fetchDesign();
    }
  }, [id, navigate]);

  // --- 2. KEYBOARD LISTENERS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        handleDeleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, items]);

  // --- 3. CORE ACTIONS ---
  
  const saveLayout = async () => {
    setSaveStatus('saving');
    try {
      await axios.post('/api/design/save', {
        designId: id, 
        name: designName,
        roomDimensions: roomSize,
        items: items
      });
      
      setSaveStatus('saved');
      
      // If creating new, redirect. If updating, just show "Saved".
      if (!id) {
          setTimeout(() => navigate('/'), 1000);
      } else {
          setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current.setPointersPositions(e);
    const [pointer] = stageRef.current.getPointersPositions();
    if (!pointer) return;
    
    setItems(items.concat({
      ...pointer,
      id: uuidv4(),
      imageUrl: dragUrl.current,
      rotation: 0,
      scaleX: 0.35, // Default scale to 35% so items aren't huge
      scaleY: 0.35
    }));
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      const newItems = items.filter(item => item.id !== selectedId);
      setItems(newItems);
      selectShape(null);
    }
  };

  const handleRoomSetup = () => {
    setRoomSize({ width: Number(inputSize.w), height: Number(inputSize.h) });
    setIsRoomSet(true);
  };

  // --- 4. UI HELPERS ---
  
  const getButtonText = () => {
      if (saveStatus === 'saving') return 'Saving...';
      if (saveStatus === 'saved') return 'Saved!';
      if (saveStatus === 'error') return 'Error!';
      return 'Save Design';
  };

  const getButtonColor = () => {
      if (saveStatus === 'saved') return 'bg-green-600';
      if (saveStatus === 'error') return 'bg-red-600';
      if (saveStatus === 'saving') return 'bg-indigo-400';
      return 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg';
  };

  if (loading) return <div className="flex h-screen justify-center items-center text-slate-500 font-medium">Loading Studio...</div>;

  // --- VIEW: SETUP SCREEN (The Attractive Blueprint UI) ---
  if (!isRoomSet) {
    return (
      <div className="flex h-screen items-center justify-center relative overflow-hidden bg-slate-900">
        
        {/* Background Image (Architectural) */}
        <div 
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2500&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px) grayscale(50%)'
          }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/40 to-indigo-900/40"></div>

        {/* Setup Card */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-[500px] border border-white/20 animate-fade-in-up">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30 text-white transform -rotate-3">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Project Setup</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">Define your workspace dimensions</p>
          </div>

          <div className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Project Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-semibold text-slate-800"
                  value={designName}
                  placeholder="e.g. Dream Living Room"
                  onChange={(e) => setDesignName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Width (px)</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                   </div>
                   <input 
                    type="number" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-semibold text-slate-800"
                    value={inputSize.w} 
                    onChange={(e) => setInputSize({...inputSize, w: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Height (px)</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                     <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                   </div>
                   <input 
                    type="number" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-semibold text-slate-800"
                    value={inputSize.h}
                    onChange={(e) => setInputSize({...inputSize, h: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button 
              className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-500/30 transform hover:-translate-y-1 transition-all"
              onClick={handleRoomSetup}
            >
              Create Workspace
            </button>

          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: MAIN EDITOR ---
  return (
    <div className="flex h-screen flex-col bg-slate-100">
      
      {/* 1. TOP NAV */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-700 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">{designName}</h1>
              <p className="text-xs text-slate-400">Drag items to furnish your room</p>
            </div>
        </div>
        <button 
          onClick={saveLayout} 
          disabled={saveStatus === 'saving'}
          className={`px-6 py-2 rounded-lg text-white font-medium text-sm transition-all ${getButtonColor()}`}
        >
          {getButtonText()}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. SIDEBAR */}
        <div className="w-80 bg-slate-900 flex flex-col shadow-xl z-10 flex-shrink-0">
          
          {/* PROPERTIES PANEL */}
          <div className="p-5 border-b border-slate-800 bg-slate-800/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {selectedId ? "Selected Item" : "Room Properties"}
            </h3>
            
            {selectedId ? (
               <div className="animate-fade-in">
                  <div className="flex items-center justify-between text-white mb-4">
                     <span className="font-medium text-sm">Furniture Item</span>
                     <span className="text-xs text-slate-500 font-mono">{selectedId.split('-')[0]}</span>
                  </div>
                  <button 
                    onClick={handleDeleteSelected}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    Delete Item
                  </button>
               </div>
            ) : (
               <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-xs text-slate-500 block mb-1">Width</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-700 text-white text-sm p-2 rounded border border-slate-600 focus:border-indigo-500 outline-none"
                      // FIX: Safe Integer parsing
                      value={roomSize.width}
                      onChange={(e) => {
                         const val = parseInt(e.target.value) || 0;
                         setRoomSize({ ...roomSize, width: val });
                      }}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-slate-500 block mb-1">Height</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-700 text-white text-sm p-2 rounded border border-slate-600 focus:border-indigo-500 outline-none"
                      value={roomSize.height}
                      onChange={(e) => {
                         const val = parseInt(e.target.value) || 0;
                         setRoomSize({ ...roomSize, height: val });
                      }}
                    />
                 </div>
               </div>
            )}
          </div>
          
          {/* LIBRARY */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-2">Library</h3>
            <div className="grid grid-cols-2 gap-3">
              {FURNITURE_PALETTE.map((item, i) => (
                <div 
                  key={i} 
                  className="bg-slate-800 p-3 rounded-xl border border-slate-700/50 hover:border-indigo-500 hover:bg-slate-700 cursor-grab active:cursor-grabbing transition group"
                  draggable="true" 
                  onDragStart={(e) => { dragUrl.current = item.url; }}
                >
                  <div className="aspect-square flex items-center justify-center bg-white/5 rounded-lg mb-2 p-2">
                     <img src={item.url} alt={item.type} className="w-full h-full object-contain pointer-events-none opacity-80 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-xs text-center text-slate-400 font-medium group-hover:text-white transition">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. CANVAS AREA */}
        {/* FIX: 'flex' + 'overflow-auto' to allow scrolling large rooms */}
        <div 
          className="flex-1 bg-slate-100 relative overflow-auto flex"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Infinite Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] w-[4000px] h-[4000px]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>

          {/* FIX: 'm-auto' centers if small, allows scroll if large */}
          <div className="m-auto p-20 min-w-min min-h-min inline-block">
              <div className="relative shadow-2xl shadow-slate-300/60 bg-white">
                <Stage
                  // FIX: Prevent 0 width crash
                  width={Math.max(1, roomSize.width)}
                  height={Math.max(1, roomSize.height)}
                  ref={stageRef}
                  onMouseDown={(e) => {
                    const clickedOnEmpty = e.target === e.target.getStage();
                    if (clickedOnEmpty) selectShape(null);
                  }}
                >
                  <Layer>
                    <Rect 
                        width={Math.max(1, roomSize.width)} 
                        height={Math.max(1, roomSize.height)} 
                        fill="#ffffff" 
                        stroke="#1e293b" 
                        strokeWidth={20}
                        shadowColor="black"
                        shadowBlur={30}
                        shadowOpacity={0.2}
                    />
                    {items.map((item, i) => (
                      <URLImage
                        key={item.id}
                        shapeProps={item}
                        isSelected={item.id === selectedId}
                        onSelect={() => selectShape(item.id)}
                        onChange={(newAttrs) => {
                          const newItems = items.slice();
                          newItems[i] = newAttrs;
                          setItems(newItems);
                        }}
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DesignEditor;