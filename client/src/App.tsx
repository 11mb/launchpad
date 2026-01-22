import { useState, useEffect } from 'react';
import type { Project } from './types';
import { ProjectCard } from './components/ProjectCard';
import { ProjectGroupCard } from './components/ProjectGroupCard';
import { Terminal } from './components/Terminal';
import { LayoutGrid, Search } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'RUNNING' | 'STOPPED'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTerminals, setActiveTerminals] = useState<Project[]>([]);
  const [terminalZIndexes, setTerminalZIndexes] = useState<Record<string, number>>({});
  const [nextZIndex, setNextZIndex] = useState(100);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // Poll every 5 seconds for status updates
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (project: Project) => {
    try {
      await fetch(`${API_URL}/projects/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: project.path, id: project.id })
      });
      fetchProjects(); // Refresh immediately
    } catch (err) {
      console.error('Failed to start', err);
    }
  };

  const handleStop = async (project: Project) => {
    try {
      await fetch(`${API_URL}/projects/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: project.path, id: project.id })
      });
      fetchProjects(); // Refresh immediately
    } catch (err) {
      console.error('Failed to stop', err);
    }
  };

  const handleViewLogs = (project: Project) => {
    if (!activeTerminals.find(t => t.id === project.id)) {
      setActiveTerminals([...activeTerminals, project]);
    }
    handleFocusTerminal(project.id);
  };

  const handleCloseTerminal = (projectId: string) => {
    setActiveTerminals(prev => prev.filter(t => t.id !== projectId));
  };

  const handleFocusTerminal = (projectId: string) => {
    setTerminalZIndexes(prev => ({
      ...prev,
      [projectId]: nextZIndex
    }));
    setNextZIndex(prev => prev + 1);
  };

  const filteredProjects = projects
    .filter(p => {
      if (filter === 'RUNNING') return p.status === 'RUNNING';
      if (filter === 'STOPPED') return p.status === 'STOPPED';
      return true;
    })
    .filter(p => {
      if (!selectedCategory) return true;
      if (selectedCategory === 'Uncategorized') return !p.config.category;
      return p.config.category === selectedCategory;
    })
    .filter(p => p.config.name.toLowerCase().includes(search.toLowerCase()));

  const runningCount = projects.filter(p => p.status === 'RUNNING').length;

  // Extract unique categories
  const categories = Array.from(new Set(projects.map(p => p.config.category).filter(Boolean))) as string[];
  const hasUncategorized = projects.some(p => !p.config.category);
  if (hasUncategorized && categories.length > 0) {
    categories.push('Uncategorized');
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 fixed h-full z-10 hidden md:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <span className="font-bold text-xl tracking-tight">Launchpad</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${selectedCategory === null ? 'bg-gray-50 text-black' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
          >
            <LayoutGrid size={20} /> All Apps
          </button>

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Categories
          </div>

          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${selectedCategory === cat ? 'bg-gray-50 text-black' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
            >
              <div className={`w-2 h-2 rounded-full ${selectedCategory === cat ? 'bg-black' : 'bg-gray-300'}`}></div>
              {cat}
            </button>
          ))}

          {categories.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-300 italic">No categories found</div>
          )}
        </nav>

        <div className="mt-auto">
          <div className="bg-gray-900 rounded-2xl p-4 text-white">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Active Projects</div>
            <div className="text-3xl font-bold">{runningCount}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 md:p-12">
        {/* Terminals */}
        {activeTerminals.map(term => (
          <Terminal
            key={term.id}
            projectId={term.id}
            projectName={term.config.name}
            onClose={() => handleCloseTerminal(term.id)}
            zIndex={terminalZIndexes[term.id] || 50}
            onFocus={() => handleFocusTerminal(term.id)}
          />
        ))}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-1">Your Projects</h1>
            <p className="text-gray-400">Manage your local development environment.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-100 w-64 shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="bg-white p-1 rounded-full border border-gray-100 shadow-sm flex">
              {(['ALL', 'RUNNING', 'STOPPED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                >
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-400">Scanning for projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="mb-4 text-4xl">🍌</div>
              <h3 className="text-lg font-bold text-gray-900">No projects found.</h3>
              <p className="text-gray-400 mt-2">Add a <code className="bg-gray-100 px-2 py-1 rounded">.launchpad</code> file to your project roots.</p>
            </div>
          ) : (
            Object.values(
              filteredProjects.reduce((acc, project) => {
                if (!acc[project.path]) acc[project.path] = [];
                acc[project.path].push(project);
                return acc;
              }, {} as Record<string, Project[]>)
            ).map((group) => {
              if (group.length === 1) {
                return (
                  <ProjectCard
                    key={group[0].id}
                    project={group[0]}
                    onStart={handleStart}
                    onStop={handleStop}
                    onViewLogs={handleViewLogs}
                  />
                );
              }
              return (
                <ProjectGroupCard
                  key={group[0].path}
                  path={group[0].path}
                  projects={group}
                  onStart={handleStart}
                  onStop={handleStop}
                  onViewLogs={handleViewLogs}
                />
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
