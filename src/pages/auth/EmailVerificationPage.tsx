import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);

  const handleInputChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    if (val && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerified(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
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
        <h2 className="mt-4 text-xl font-bold text-navy-800">Verify Corporate Email</h2>
        <p className="mt-1 text-sm text-navy-500">
          Enter the 6-digit confirmation code dispatched to your corporate inbox
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          {verified ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-esg-100 text-esg-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-base font-bold text-navy-900">Email Verified!</h3>
              <p className="text-xs text-navy-500">
                Your account is active and verified. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-between gap-2 max-w-xs mx-auto">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`code-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="w-11 h-12 text-center text-lg font-bold border border-slate-300 rounded-lg focus:border-esg-500 focus:ring-2 focus:ring-esg-200 outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-medium text-sm"
              >
                Confirm Verification <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-between text-xs text-navy-500 pt-2">
                <span>Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={() => setCode(['4', '8', '1', '9', '0', '2'])}
                  className="text-esg-600 hover:text-esg-700 font-semibold inline-flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Auto-fill Demo Code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link to="/login" className="text-xs text-navy-500 hover:text-navy-800">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
