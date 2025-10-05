import React, { useState } from 'react';
import { Clock, MessageSquare, AlertCircle, CheckCircle, XCircle, Plus, Search } from 'lucide-react';

export default function HelpDeskMini() {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: 'Login not working',
      description: 'Unable to login to the system',
      priority: 'high',
      status: 'open',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
      assignee: 'John Doe',
      comments: [
        { id: 1, author: 'Support Team', text: 'Investigating the issue', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) }
      ]
    },
    {
      id: 2,
      title: 'Feature request: Dark mode',
      description: 'Add dark mode to the application',
      priority: 'low',
      status: 'in-progress',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
      assignee: 'Jane Smith',
      comments: []
    }
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newComment, setNewComment] = useState('');

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: ''
  });

  const getSLATime = (priority) => {
    switch (priority) {
      case 'critical': return 4 * 60 * 60 * 1000; // 4 hours
      case 'high': return 8 * 60 * 60 * 1000; // 8 hours
      case 'medium': return 24 * 60 * 60 * 1000; // 24 hours
      case 'low': return 72 * 60 * 60 * 1000; // 72 hours
      default: return 24 * 60 * 60 * 1000;
    }
  };

  const calculateSLAStatus = (createdAt, deadline) => {
    const now = new Date();
    const totalTime = deadline.getTime() - createdAt.getTime();
    const timeLeft = deadline.getTime() - now.getTime();

    if (!isFinite(totalTime) || totalTime <= 0) {
      if (timeLeft < 0) return { status: 'breached', textClass: 'text-red-600', iconClass: 'text-red-600' };
      return { status: 'on-track', textClass: 'text-green-600', iconClass: 'text-green-600' };
    }

    const percentage = (timeLeft / totalTime) * 100;

    if (timeLeft < 0) return { status: 'breached', textClass: 'text-red-600', iconClass: 'text-red-600' };
    if (percentage < 25) return { status: 'critical', textClass: 'text-orange-600', iconClass: 'text-orange-600' };
    if (percentage < 60) return { status: 'at-risk', textClass: 'text-yellow-600', iconClass: 'text-yellow-600' };
    return { status: 'on-track', textClass: 'text-green-600', iconClass: 'text-green-600' };
  };

  const formatTimeLeft = (deadline) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff < 0) return 'SLA Breached';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) {
      return `${days}d ${hours}h left`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return;

    const ticket = {
      id: tickets.length + 1,
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'open',
      createdAt: new Date(),
      slaDeadline: new Date(Date.now() + getSLATime(newTicket.priority)),
      assignee: newTicket.assignee,
      comments: []
    };

    setTickets([...tickets, ticket]);
    setNewTicket({ title: '', description: '', priority: 'medium', assignee: '' });
    setShowNewTicket(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTicket) return;

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          comments: [
            ...t.comments,
            {
              id: t.comments.length + 1,
              author: 'Current User',
              text: newComment,
              timestamp: new Date()
            }
          ]
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id) || null);
    setNewComment('');
  };

  const handleStatusChange = (ticketId, newStatus) => {
    const updatedTickets = tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    );
    setTickets(updatedTickets);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updatedTickets.find(t => t.id === ticketId) || null);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch = ticket.title.toLowerCase().includes(lowerSearch) ||
                         ticket.description.toLowerCase().includes(lowerSearch);
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">HelpDesk Mini</h1>
          <button
            onClick={() => setShowNewTicket(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2 mb-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTickets.map(ticket => {
                const slaStatus = calculateSLAStatus(ticket.createdAt, ticket.slaDeadline);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer transition hover:shadow-md ${
                      selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1">{ticket.title}</h3>
                      {getStatusIcon(ticket.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {ticket.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className={`w-4 h-4 ${slaStatus.iconClass}`} />
                      <span className={`${slaStatus.textClass} font-medium`}>
                        {formatTimeLeft(ticket.slaDeadline)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicket.title}</h2>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm px-3 py-1 rounded-full border ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority.toUpperCase()}
                      </span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                        className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className={`w-5 h-5 ${calculateSLAStatus(selectedTicket.createdAt, selectedTicket.slaDeadline).iconClass}`} />
                    <span className="font-semibold text-gray-900">SLA Status</span>
                  </div>
                  <p className={`${calculateSLAStatus(selectedTicket.createdAt, selectedTicket.slaDeadline).textClass} text-lg font-medium`}>
                    {formatTimeLeft(selectedTicket.slaDeadline)}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedTicket.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Assignee:</span>
                      <p className="font-medium">{selectedTicket.assignee || 'Unassigned'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <p className="font-medium">{selectedTicket.createdAt.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comments ({selectedTicket.comments.length})
                  </h3>
                  
                  <div className="space-y-4 mb-4">
                    {selectedTicket.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.timestamp.toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddComment}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Ticket Selected</h3>
                <p className="text-gray-600">Select a ticket from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Ticket</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Detailed description of the issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={newTicket.assignee}
                    onChange={(e) => setNewTicket({ ...newTicket, assignee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Assign to team member"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewTicket(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
