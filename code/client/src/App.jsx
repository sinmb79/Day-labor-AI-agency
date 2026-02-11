import React, { useState, useEffect } from 'react';
import './index.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
    const [view, setView] = useState('jobs'); // 'jobs' or 'agents'
    const [jobs, setJobs] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [newJob, setNewJob] = useState({ title: '', budget: 10, required_skills: '' });
    const [newAgent, setNewAgent] = useState({ name: '', price: 5, skills: '' });

    useEffect(() => {
        fetchJobs();
        fetchAgents();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${API_BASE}/jobs`);
            const data = await res.json();
            setJobs(data);
        } catch (e) {
            console.error("Failed to fetch jobs", e);
        }
    };

    const fetchAgents = async () => {
        try {
            const res = await fetch(`${API_BASE}/agents`);
            const data = await res.json();
            setAgents(data);
        } catch (e) {
            console.error("Failed to fetch agents", e);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...newJob,
                required_skills: newJob.required_skills.split(',').map(s => s.trim())
            };

            const res = await fetch(`${API_BASE}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setNewJob({ title: '', budget: 10, required_skills: '' });
                fetchJobs(); // Refresh list to see auto-match result
            }
        } catch (e) {
            alert("Error posting job");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterAgent = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newAgent.name,
                price_per_task: Number(newAgent.price),
                skills: newAgent.skills.split(',').map(s => s.trim())
            };

            await fetch(`${API_BASE}/agents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            setNewAgent({ name: '', price: 5, skills: '' });
            fetchAgents();
        } catch (e) {
            alert("Error registering agent");
        }
    };

    return (
        <div className="container">
            <header>
                <h1>Day Labor AI Agency</h1>
                <nav>
                    <button onClick={() => setView('jobs')} className={view === 'jobs' ? 'active' : ''}>Job Board</button>
                    <button onClick={() => setView('agents')} className={view === 'agents' ? 'active' : ''}>Agent Registry</button>
                </nav>
            </header>

            <main>
                {view === 'jobs' && (
                    <div className="dashboard">
                        <section className="form-section">
                            <h2>Post a New Task</h2>
                            <form onSubmit={handlePostJob}>
                                <input
                                    type="text"
                                    placeholder="Task Title (e.g. Summarize Text)"
                                    value={newJob.title}
                                    onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Budget ($)"
                                    value={newJob.budget}
                                    onChange={e => setNewJob({ ...newJob, budget: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Required Skills (comma separated)"
                                    value={newJob.required_skills}
                                    onChange={e => setNewJob({ ...newJob, required_skills: e.target.value })}
                                />
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Matching...' : 'Post Job & Auto-Match'}
                                </button>
                            </form>
                        </section>

                        <section className="list-section">
                            <h2>Active Jobs</h2>
                            {jobs.length === 0 ? <p className="empty">No jobs found.</p> : (
                                <div className="job-list">
                                    {jobs.map(job => (
                                        <div key={job.id} className={`card job-card ${job.status.toLowerCase()}`}>
                                            <h3>{job.title}</h3>
                                            <div className="meta">
                                                <span className="badge budget">${job.budget}</span>
                                                <span className={`badge status ${job.status.toLowerCase()}`}>{job.status}</span>
                                            </div>
                                            <p>Skills: {job.required_skills.join(', ')}</p>
                                            {job.assigned_agent_id && (
                                                <div className="match-info">
                                                    <strong>Matched Agent:</strong> {job.assigned_agent_id}
                                                    <br />
                                                    <small>Match Score: {(job.match_score * 100).toFixed(1)}%</small>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {view === 'agents' && (
                    <div className="dashboard">
                        <section className="form-section">
                            <h2>Register AI Agent</h2>
                            <form onSubmit={handleRegisterAgent}>
                                <input
                                    type="text"
                                    placeholder="Agent Name"
                                    value={newAgent.name}
                                    onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Price per Task ($)"
                                    value={newAgent.price}
                                    onChange={e => setNewAgent({ ...newAgent, price: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Skills (comma separated)"
                                    value={newAgent.skills}
                                    onChange={e => setNewAgent({ ...newAgent, skills: e.target.value })}
                                />
                                <button type="submit">Register Agent</button>
                            </form>
                        </section>

                        <section className="list-section">
                            <h2>Registered Agents</h2>
                            <div className="agent-list">
                                {agents.map(agent => (
                                    <div key={agent.id} className="card agent-card">
                                        <h3>{agent.name} <small>({agent.id})</small></h3>
                                        <p>Price: ${agent.price_per_task}</p>
                                        <p>Skills: {agent.skills.join(', ')}</p>
                                        <p>Rating: ⭐ {agent.rating}</p>
                                        <p>Success Rate: {(agent.success_rate * 100).toFixed(0)}%</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
