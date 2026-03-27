import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, ChevronRight, Zap } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { useParticipant } from '../context/ParticipantContext.jsx';
import api from '../lib/api.js';
import { playStepComplete } from '../lib/sounds.js';

export default function Step1Register() {
  const navigate = useNavigate();
  const { updateParticipant } = useParticipant();

  const [form, setForm] = useState({ firstName: '', lastName: '', companyName: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())   e.firstName   = 'Required';
    if (!form.lastName.trim())    e.lastName    = 'Required';
    if (!form.email.trim())       e.email       = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim())       e.phone       = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true); setApiError('');
    try {
      const { data } = await api.post('/participants', form);
      updateParticipant(data.participant);
      playStepComplete();
      navigate('/step/2');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, icon, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-400 dark:text-gray-400 mb-1.5">
        {label} {name !== 'companyName' && <span className="text-brand-orange">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
        <input
          type={type}
          value={form[name]}
          onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(ev => ({ ...ev, [name]: '' })); }}
          placeholder={placeholder}
          className={`input pl-10 ${errors[name] ? 'border-red-500 focus:ring-red-500/40' : ''}`}
        />
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name]}</p>}
    </div>
  );

  return (
    <Layout step={1}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-2"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="step-badge"><Zap size={11} /> Step 1 of 4</span>
            <span className="points-pill">+100 pts</span>
          </div>
          <h2 className="font-display font-black text-3xl text-white dark:text-white uppercase tracking-tight leading-tight">
            Tell Us<br />About You
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-2">
            Register to start your Race to Capture journey.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('firstName', 'First Name', <User size={14} />, 'text', 'Kavin')}
            {field('lastName',  'Last Name',  <User size={14} />, 'text', 'Perera')}
          </div>
          {field('companyName', 'Company (optional)', <Building2 size={14} />, 'text', 'Acme Corp')}
          {field('email', 'Email Address', <Mail size={14} />, 'email', 'kavin@example.com')}
          {field('phone', 'Phone Number', <Phone size={14} />, 'tel', '+94 77 123 4567')}

          {apiError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {apiError}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Registering…' : 'Continue'}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>
      </motion.div>
    </Layout>
  );
}
