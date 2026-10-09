import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-800 rounded-xl flex items-center justify-center shadow-md">
            <Leaf size={22} className="text-esg-400" />
          </div>
          <span className="text-2xl font-bold text-navy-900 tracking-tight">MEIL ESG Platform</span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-navy-800">Reset your password</h2>
        <p className="mt-1 text-sm text-navy-500">
          Enter your MEIL corporate email address to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-esg-100 text-esg-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="text-base font-bold text-navy-900">Recovery Email Dispatched</h3>
              <p className="text-xs text-navy-500 leading-relaxed">
                If an account exists for <span className="font-semibold text-navy-700">{email}</span>, a secure password reset token has been sent. Please check your inbox.
              </p>
              <div className="pt-4">
                <Link to="/reset-password" className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-xs">
                  Proceed to Enter Token <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@meilgroup.com"
                    className="input-field pl-9 w-full text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-medium text-sm"
              >
                Send Password Reset Link <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-800">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
