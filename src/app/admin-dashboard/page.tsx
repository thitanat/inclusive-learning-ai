"use client"
import React, { useEffect, useState } from 'react';
import JsonDynamicResponse from '../../components/JsonDynamicRenderer';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
// Add Material UI imports
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface User {
  id: string;
  name: string;
  email: string;
  _id?: string;
  [key: string]: any;
}

interface Session {
  [key: string]: any;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  // Pagination and filtering for users
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [userFilters, setUserFilters] = useState<Record<string, string>>({});
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUserFields, setEditUserFields] = useState<Record<string, string>>({});
  const [sessions, setSessions] = useState<Session[]>([]);
  // Pagination and filtering for sessions
  const [sessionPage, setSessionPage] = useState(0);
  const [sessionRowsPerPage, setSessionRowsPerPage] = useState(10);
  const [sessionFilters, setSessionFilters] = useState<Record<string, string>>({});
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonModalTitle, setJsonModalTitle] = useState('');
  const [jsonModalData, setJsonModalData] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0); // 0: Users, 1: Sessions

  // Fetch users and sessions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersRes = await fetch('/api/admin/users');
        const sessionsRes = await fetch('/api/admin/sessions');
        if (!usersRes.ok || !sessionsRes.ok) throw new Error('Failed to fetch');
        setUsers(await usersRes.json());
        setSessions(await sessionsRes.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // CRUD handlers
  const handleAddUser = async () => {
    const name = prompt('Enter user name:');
    const email = prompt('Enter user email:');
    if (!name || !email) return;
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (res.ok) setUsers([...users, await res.json()]);
  };

  const handleEditUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const name = prompt('Edit user name:', user.name);
    const email = prompt('Edit user email:', user.email);
    if (!name || !email) return;
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, email }),
    });
    if (res.ok) setUsers(users.map(u => (u.id === id ? { ...u, name, email } : u)));
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setUsers(users.filter(u => u.id !== id));
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session?')) return;
    const res = await fetch('/api/admin/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    if (res.ok) setSessions(sessions.filter(s => s._id !== sessionId));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-green-50 drop-shadow-lg">Admin Dashboard</h1>
      {/* Material UI Tabs */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'rgba(34, 197, 94, 0.3)', 
        mb: 4,
        background: "rgba(21, 128, 61, 0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(34, 197, 94, 0.18)",
        borderRadius: 2,
        p: 2,
      }}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)}
          sx={{
            "& .MuiTab-root": {
              color: "#bbf7d0",
              "&.Mui-selected": {
                color: "#f0fdf4",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#22c55e",
            },
          }}
        >
          <Tab label="Users" />
          <Tab label="Sessions" />
        </Tabs>
      </Box>
      {tab === 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-green-100">Users</h2>
          <button className="mb-2 px-4 py-2 glass-button rounded-lg text-green-100 font-medium transition-all duration-300 hover:scale-105" onClick={handleAddUser}>Add User</button>
          {(() => {
            // Compute all unique keys from all users
            const allUserKeysSet = new Set<string>();
            users.forEach(user => {
              Object.keys(user).forEach(key => allUserKeysSet.add(key));
            });
            const allUserKeys = Array.from(allUserKeysSet);
            // Filtering
            const filteredUsers = users.filter(user =>
              Object.entries(userFilters).every(([key, value]) =>
                value === '' || (user[key] && String(user[key]).toLowerCase().includes(value.toLowerCase()))
              )
            );
            // Pagination
            const pagedUsers = filteredUsers.slice(userPage * userRowsPerPage, (userPage + 1) * userRowsPerPage);
            return (
              <>
                {/* Filter Inputs */}
                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {allUserKeys.map(key => (
                    <input
                      key={key}
                      placeholder={`Filter by ${key}`}
                      value={userFilters[key] || ''}
                      onChange={e => {
                        setUserFilters(f => ({ ...f, [key]: e.target.value }));
                        setUserPage(0);
                      }}
                      className="glass-input border-0 px-2 py-1 rounded-lg text-green-50 placeholder-green-200"
                      style={{ minWidth: 120 }}
                    />
                  ))}
                </Box>
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    maxHeight: 600,
                    background: "rgba(21, 128, 61, 0.08)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(34, 197, 94, 0.18)",
                    "& .MuiTableCell-root": {
                      color: "#dcfce7",
                      borderColor: "rgba(34, 197, 94, 0.15)",
                    },
                    "& .MuiTableHead-root .MuiTableCell-root": {
                      background: "rgba(21, 128, 61, 0.15)",
                      color: "#f0fdf4",
                      fontWeight: 600,
                    },
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        {allUserKeys.map((key) => (
                          <TableCell key={key} sx={{ fontWeight: 'bold' }}>{key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedUsers.map(user => (
                        <TableRow key={user._id ?? user.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button color="warning" variant="contained" size="small" onClick={() => {
                                // Open edit modal with editable fields
                                const editableKeys = Object.keys(user).filter(k => typeof user[k] !== 'object' && k !== '_id' && k !== 'id');
                                const fields: Record<string, string> = {};
                                editableKeys.forEach(k => { fields[k] = String(user[k] ?? ''); });
                                setEditUserFields(fields);
                                setEditUserId((user._id ?? user.id) as string);
                                setEditUserModalOpen(true);
                              }}>
                                Edit
                              </Button>
                              <Button color="error" variant="contained" size="small" onClick={() => handleDeleteUser((user._id ?? user.id) as string)}>
                                Delete
                              </Button>
                            </Box>
                          </TableCell>
                          {allUserKeys.map((key) => (
                            <TableCell key={key}>
                              {key in user ? (
                                typeof user[key] === 'object' && user[key] !== null ? (
                                  <Button size="small" variant="outlined" onClick={() => {
                                    setJsonModalTitle(`${key} of user ${(user._id ?? user.id) as string}`);
                                    setJsonModalData(user[key]);
                                    setJsonModalOpen(true);
                                  }}>View JSON</Button>
                                ) : (
                                  String(user[key])
                                )
                              ) : ''}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Pagination Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                  <div>
                    <Button disabled={userPage === 0} onClick={() => setUserPage(p => Math.max(0, p - 1))}>Prev</Button>
                    <span style={{ margin: '0 8px' }}>Page {userPage + 1} of {Math.ceil(filteredUsers.length / userRowsPerPage) || 1}</span>
                    <Button disabled={(userPage + 1) * userRowsPerPage >= filteredUsers.length} onClick={() => setUserPage(p => p + 1)}>Next</Button>
                  </div>
                  <div>
                    Rows per page:
                    <select value={userRowsPerPage} onChange={e => { setUserRowsPerPage(Number(e.target.value)); setUserPage(0); }} className="ml-2 border rounded px-2 py-1">
                      {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </Box>
              </>
            );
          })()}
          {/* Edit User Modal */}
          <Modal open={editUserModalOpen} onClose={() => setEditUserModalOpen(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, minWidth: 400, maxWidth: 500, maxHeight: '80vh', overflowY: 'auto' }}>
              <h3 className="text-lg font-bold mb-4">Edit User</h3>
              {Object.keys(editUserFields).map((key) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <label className="block font-semibold mb-1">{key}</label>
                  <input
                    className="w-full border px-2 py-1 rounded"
                    value={editUserFields[key]}
                    onChange={e => setEditUserFields(f => ({ ...f, [key]: e.target.value }))}
                  />
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={() => setEditUserModalOpen(false)} variant="outlined">Cancel</Button>
                <Button variant="contained" onClick={async () => {
                  if (!editUserId) return;
                  const updates = { ...editUserFields };
                  const res = await fetch('/api/admin/users', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editUserId, ...updates }),
                  });
                  if (res.ok) {
                    setUsers(users => users.map(u => ((u._id ?? u.id) === editUserId ? { ...u, ...updates } : u)));
                    setEditUserModalOpen(false);
                  }
                }}>Save</Button>
              </Box>
            </Box>
          </Modal>
        </section>
      )}
      {tab === 1 && (
        <section>
          <h2 className="text-xl font-semibold mb-2 text-green-100">Sessions</h2>
          {(() => {
            // Compute all unique keys from all sessions, ensure 'userEmail' is included and appears after 'Actions'
            const allKeysSet = new Set<string>();
            sessions.forEach(session => {
              Object.keys(session).forEach(key => allKeysSet.add(key));
            });
            let allKeys = Array.from(allKeysSet);
            if (!allKeys.includes('userEmail')) allKeys.push('userEmail');
            // Move 'userEmail' to the front after Actions
            allKeys = [
              ...allKeys.filter(k => k === 'userEmail'),
              ...allKeys.filter(k => k !== 'userEmail')
            ];
            // Filtering
            const filteredSessions = sessions.filter(session =>
              Object.entries(sessionFilters).every(([key, value]) => {
                if (value === '') return true;
                if (key === 'userEmail') {
                  const email = session.userEmail || session.email || (session.user && session.user.email) || '';
                  return String(email).toLowerCase().includes(value.toLowerCase());
                }
                return session[key] && String(session[key]).toLowerCase().includes(value.toLowerCase());
              })
            );
            // Pagination
            const pagedSessions = filteredSessions.slice(sessionPage * sessionRowsPerPage, (sessionPage + 1) * sessionRowsPerPage);
            return (
              <>
                {/* Filter Inputs */}
                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {allKeys.map(key => (
                    <input
                      key={key}
                      placeholder={`Filter by ${key}`}
                      value={sessionFilters[key] || ''}
                      onChange={e => {
                        setSessionFilters(f => ({ ...f, [key]: e.target.value }));
                        setSessionPage(0);
                      }}
                      className="glass-input border-0 px-2 py-1 rounded-lg text-green-50 placeholder-green-200"
                      style={{ minWidth: 120 }}
                    />
                  ))}
                </Box>
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        {allKeys.map((key) => (
                          <TableCell key={key} sx={{ fontWeight: 'bold' }}>{key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedSessions.map(session => (
                        <TableRow key={session._id || session.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button color="warning" variant="contained" size="small" onClick={() => {
                                // Open edit modal with editable fields
                                const editableKeys = Object.keys(session).filter(k => typeof session[k] !== 'object' && k !== '_id' && k !== 'id');
                                const fields: Record<string, string> = {};
                                editableKeys.forEach(k => { fields[k] = String(session[k] ?? ''); });
                                setEditFields(fields);
                                setEditSessionId(session._id || session.id);
                                setEditModalOpen(true);
                              }}>
                                Edit
                              </Button>
                              <Button color="error" variant="contained" size="small" onClick={() => handleDeleteSession(session._id || session.id)}>
                                Delete
                              </Button>
                            </Box>
                          </TableCell>
                          {allKeys.map((key) => (
                            <TableCell key={key}>
                              {key === 'userEmail' ? (
                                // Prefer session.userEmail, fallback to session.email, then session.user?.email, else blank
                                session.userEmail ? String(session.userEmail) : (session.email ? String(session.email) : (session.user && session.user.email ? String(session.user.email) : ''))
                              ) : key in session ? (
                                typeof session[key] === 'object' && session[key] !== null ? (
                                  <Button size="small" variant="outlined" onClick={() => {
                                    setJsonModalTitle(`${key} of session ${session._id || session.id}`);
                                    setJsonModalData(session[key]);
                                    setJsonModalOpen(true);
                                  }}>View JSON</Button>
                                ) : (
                                  String(session[key])
                                )
                              ) : ''}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Pagination Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                  <div>
                    <Button disabled={sessionPage === 0} onClick={() => setSessionPage(p => Math.max(0, p - 1))}>Prev</Button>
                    <span style={{ margin: '0 8px' }}>Page {sessionPage + 1} of {Math.ceil(filteredSessions.length / sessionRowsPerPage) || 1}</span>
                    <Button disabled={(sessionPage + 1) * sessionRowsPerPage >= filteredSessions.length} onClick={() => setSessionPage(p => p + 1)}>Next</Button>
                  </div>
                  <div>
                    Rows per page:
                    <select value={sessionRowsPerPage} onChange={e => { setSessionRowsPerPage(Number(e.target.value)); setSessionPage(0); }} className="ml-2 border rounded px-2 py-1">
                      {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </Box>
              </>
            );
          })()}
          <Modal open={jsonModalOpen} onClose={() => setJsonModalOpen(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, minWidth: 400, maxHeight: '80vh', overflow: 'auto' }}>
              <h3 className="text-lg font-bold mb-2">{jsonModalTitle}</h3>
              <JsonDynamicResponse data={jsonModalData} />
              <Button onClick={() => setJsonModalOpen(false)} sx={{ mt: 2 }}>Close</Button>
            </Box>
          </Modal>
          {/* Edit Modal */}
          <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, minWidth: 400, maxWidth: 500, maxHeight: '80vh', overflowY: 'auto' }}>
              <h3 className="text-lg font-bold mb-4">Edit Session</h3>
              {Object.keys(editFields).map((key) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <label className="block font-semibold mb-1">{key}</label>
                  <input
                    className="w-full border px-2 py-1 rounded"
                    value={editFields[key]}
                    onChange={e => setEditFields(f => ({ ...f, [key]: e.target.value }))}
                  />
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={() => setEditModalOpen(false)} variant="outlined">Cancel</Button>
                <Button variant="contained" onClick={async () => {
                  if (!editSessionId) return;
                  const updates = { ...editFields };
                  const res = await fetch('/api/admin/sessions', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: editSessionId, ...updates }),
                  });
                  if (res.ok) {
                    setSessions(sessions => sessions.map(s => (s._id === editSessionId ? { ...s, ...updates } : s)));
                    setEditModalOpen(false);
                  }
                }}>Save</Button>
              </Box>
            </Box>
          </Modal>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
