import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState('Designer');
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    const fetchDesigns = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/design/my-designs', {
          headers: { 'x-auth-token': token }
        });
        setDesigns(res.data);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // --- NEW: DELETE FUNCTION ---
  const handleDeleteDesign = async (e, id) => {
    e.preventDefault(); // Prevent navigating to the editor
    e.stopPropagation(); // Stop event bubbling

    if (window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/design/${id}`, {
          headers: { 'x-auth-token': token }
        });
        
        // Remove from state immediately so UI updates without reload
        setDesigns(designs.filter(design => design._id !== id));
      } catch (err) {
        console.error("Delete error", err);
        alert("Failed to delete project");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const Navbar = () => (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
          R
        </div>
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">Room<span className="text-indigo-600">Craft</span></span>
      </div>

      <div className="relative">
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{userName}</span>
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-200">
            {userName.charAt(0).toUpperCase()}
          </div>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-fade-in-up origin-top-right">
            <div className="px-4 py-3 border-b border-slate-50">
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
               <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition font-medium flex items-center gap-2"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );

  if (loading) return <div className="flex h-screen justify-center items-center text-slate-400 font-medium">Loading your studio...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <div className="relative h-96 bg-slate-900 overflow-hidden">
        <div 
            className="absolute inset-0 opacity-60"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop')",
                backgroundSize: 'cover',
                backgroundPosition: 'center 60%'
            }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-8 h-full flex flex-col justify-center">
            <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                Welcome, {userName}.
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
                Ready to transform spaces? Manage your floor plans and bring your interior design ideas to life with RoomCraft.
            </p>
            <div className="mt-8 flex gap-4">
                <Link to="/design/new" className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Start New Project
                </Link>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-20 relative z-10 pb-20">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">Your Recent Projects</h2>
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                {designs.length} Projects Found
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/design/new" className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center h-72 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner relative z-10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-lg font-bold text-slate-700 group-hover:text-indigo-700 relative z-10">Create New Room</span>
            <span className="text-sm text-slate-400 mt-1 relative z-10">Start from a blank canvas</span>
          </Link>

          {designs.map((design) => (
            <div key={design._id} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-slate-200 hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col h-72 group hover:-translate-y-1 relative">
              
              <div className="h-40 bg-slate-100 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                 <div className="absolute inset-0 opacity-[0.05]" 
                    style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
                 </div>
                 <div className="text-slate-300 group-hover:text-indigo-500/50 group-hover:scale-110 transition-all duration-500">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-6H4v3zm19-8v-3l-2-5H3l-2 5v3h22zm-9-4h6v2h-6V6zm-8 2h6V6H6v2z"/></svg>
                 </div>
                 <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-semibold text-slate-500 px-2 py-1 rounded-md shadow-sm">
                    {formatDate(design.createdAt)}
                 </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{design.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                         {design.roomDimensions.width} x {design.roomDimensions.height}
                      </span>
                      <span className="text-xs text-slate-400">{design.items.length} Items</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 border-t border-slate-50 pt-3">
                  
                  {/* OPEN BUTTON */}
                  <Link 
                    to={`/design/${design._id}`} 
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Open Studio <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>

                  {/* NEW: DELETE BUTTON */}
                  <button 
                    onClick={(e) => handleDeleteDesign(e, design._id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                    title="Delete Project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {designs.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 mt-6 shadow-sm">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <h3 className="text-xl font-bold text-slate-700">No designs created yet</h3>
             <p className="text-slate-500 mt-2 max-w-md mx-auto">It looks a bit empty here. Start your first project to begin your interior design journey.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;