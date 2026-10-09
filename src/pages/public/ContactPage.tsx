import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'ESG & Sustainability Cell',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 border-b border-slate-100 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-navy-800 rounded-lg flex items-center justify-center">
              <Leaf size={18} className="text-esg-400" />
            </div>
            <div>
              <span className="text-base font-bold text-navy-900">MEIL ESG</span>
              <span className="hidden sm:inline text-xs text-navy-400 ml-2">BRSR Platform</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">Features</Link>
            <Link to="/how-it-works" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">How It Works</Link>
            <Link to="/about" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-semibold text-esg-600">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost btn-sm">Sign In</Link>
            <Link to="/login" className="btn-primary btn-sm">Launch Portal</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-esg-50 text-esg-700 text-xs font-medium mb-4 border border-esg-200">
            ESG Cell & Technical Helpdesk
          </div>
          <h1 className="text-4xl font-bold text-navy-900 mb-4">
            Contact MEIL Sustainability Bureau
          </h1>
          <p className="text-navy-500 text-base leading-relaxed">
            Need assistance with parameter definitions, evidence verification requirements, or access permissions? Reach out to our corporate ESG operations team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3 text-navy-900 font-semibold mb-2">
                <MapPin size={20} className="text-esg-600" />
                <span>MEIL Corporate Headquarters</span>
              </div>
              <p className="text-sm text-navy-600 leading-relaxed pl-8">
                Megha Engineering & Infrastructures Ltd.<br />
                S-2, Technocrat Industrial Estate, Balanagar,<br />
                Hyderabad - 500037, Telangana, India
              </p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3 text-navy-900 font-semibold mb-2">
                <Mail size={20} className="text-esg-600" />
                <span>ESG Inquiries & Reporting</span>
              </div>
              <p className="text-sm text-navy-600 pl-8">
                esg.cell@meilgroup.com<br />
                brsr.audit@meilgroup.com
              </p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3 text-navy-900 font-semibold mb-2">
                <Phone size={20} className="text-esg-600" />
                <span>Internal Helpline</span>
              </div>
              <p className="text-sm text-navy-600 pl-8">
                +91 (40) 4433-6700 (Ext. 408)<br />
                Mon - Fri, 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 bg-esg-100 text-esg-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-navy-900">Inquiry Dispatched to ESG Cell</h3>
                <p className="text-sm text-navy-500 max-w-md mx-auto">
                  Thank you. Your message has been assigned Ticket #ESG-INQ-{(Math.random() * 8999 + 1000).toFixed(0)}. An ESG officer will follow up with you.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary btn-sm mt-4"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand V."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="anand@meilgroup.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field w-full text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                      Department / Function
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="input-field w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scope 1 Factor Clarification"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="input-field w-full text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                    Inquiry Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about your query or data clarification request..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-field w-full text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 font-medium text-sm mt-2"
                >
                  <Send size={16} /> Send Message to ESG Desk
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
