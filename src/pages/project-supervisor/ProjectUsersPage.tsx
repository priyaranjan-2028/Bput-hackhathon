import React, { useState } from 'react';
import { projects, parameterSubmissions, users } from '../../data/mockData';
import { Users, UserPlus, CheckCircle2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createProjectUser, getProjectUsers } from '../../services/projectSupervisorService';
import { getBusinessUnitProjects } from '../../services/businessUnitService';

export default function ProjectUsersPage() {
  const { user } = useAuth();
  const availableProjects = getBusinessUnitProjects(user?.businessUnitId || 'BU001');
  const supervisedProjects = availableProjects.filter(project => user?.assignedProjectIds?.includes(project.id));
  const projectOptions = supervisedProjects.length ? supervisedProjects : availableProjects;
  const [selectedProjectId, setSelectedProjectId] = useState(user?.assignedProjectIds?.[0] ?? projectOptions[0]?.id ?? projects[0]?.id ?? '');
  const projectId = projectOptions.some(project => project.id === selectedProjectId) ? selectedProjectId : supervisedProjects[0]?.id ?? projectOptions[0]?.id;
  const project = availableProjects.find(item => item.id === projectId) ?? projects.find(item => item.id === projectId);
  const projectSupervisor = users.find(account => account.id === project?.supervisorId);
  const [refresh, setRefresh] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const siteUsers = projectId ? getProjectUsers(projectId) : [];
  void refresh;

  const filtered = siteUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Project Field Data Officers</h1>
          <p className="text-sm text-navy-500 mt-1">Manage project users and their ESG data entry activity. Supervisor: {projectSupervisor?.name ?? 'Assigned Project Supervisor'}.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
        <label className="block text-xs font-semibold text-navy-700">Project<select value={projectId} onChange={event => setSelectedProjectId(event.target.value)} className="input-field mt-1 w-full sm:min-w-64">{projectOptions.map(option => <option key={option.id} value={option.id}>{option.name}{supervisedProjects.some(assigned => assigned.id === option.id) ? ' · Assigned to you' : ' · Demo project'}</option>)}</select></label>
        <button
          onClick={() => { setError(''); setShowInviteModal(true); }}
          className="btn-primary flex items-center gap-2 text-xs font-semibold py-2.5 px-4"
        >
          <UserPlus size={16} /> Add Project User
        </button>
        </div>
      </div>

      <div className="search-panel">
        <div className="relative w-full sm:max-w-md">
          <Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="search"
            aria-label="Search project users"
            placeholder="Search by name, email, or employee ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field pl-10"
          />
        </div>
        <div className="text-xs text-navy-400">
        Total Authorized: <span className="font-bold text-navy-800">{siteUsers.length} Officers</span>
        </div>
      </div>

      {success && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(officer => {
          const userSubs = parameterSubmissions.filter(s => (s.userId === officer.id || s.submittedBy === officer.id) && s.projectId === officer.projectId);
          const prj = projects.find(p => p.id === officer.projectId);

          return (
            <div key={officer.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-navy-800 text-esg-400 font-bold rounded-xl flex items-center justify-center text-sm shadow-inner">
                  {officer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900">{officer.name}</h3>
                  <p className="text-xs text-navy-400">{officer.email}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-navy-400">Assigned Project:</span>
                  <span className="font-semibold text-navy-800">{prj?.name || project?.name || 'Project'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-400">Data Submissions:</span>
                  <span className="font-bold text-navy-900">{userSubs.length} entries</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-400">Status:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active & Trained
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-navy-400">
                <span className="font-mono">ID: {officer.id}</span>
                <span className="text-navy-600 font-medium">Role: Field Data Entry</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No project users found for this project yet.</div>}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={event=>{event.preventDefault();try{createProjectUser({name,email},projectId);setRefresh(value=>value+1);setSuccess(`${name.trim()} was added. Login email: ${email.trim().toLowerCase()} · Demo password: demo123`);setName('');setEmail('');setError('');setShowInviteModal(false);}catch(cause){setError(cause instanceof Error?cause.message:'Could not add this project user.');}}} className="form-card w-full max-w-lg space-y-5 shadow-2xl">
            <div className="border-b border-slate-100 pb-4"><p className="text-[10px] font-bold uppercase tracking-wider text-esg-700">Project access</p><h3 className="mt-1 text-lg font-bold text-navy-900">Add project user</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add a project user to {project?.name ?? 'your assigned project'}. They can sign in with their email and the demo password shown after creation.
            </p></div>
            {error && <p role="alert" className="form-error">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="form-label">Full name</label>
                <input required minLength={2} maxLength={80} autoComplete="name" type="text" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Ramesh Chandra" className="input-field" />
              </div>
              <div>
                <label className="form-label">Corporate email</label>
                <input required maxLength={120} autoComplete="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="r.chandra@meilgroup.com" className="input-field" />
              </div>
              <div>
                <label className="form-label">Assigned project</label>
                <input type="text" disabled value={`${project?.name ?? 'Project'} (${projectId})`} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary rounded-xl px-4 py-2.5">
                Cancel
              </button>
              <button type="submit" className="btn-primary rounded-xl px-4 py-2.5">
                Add project user
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
