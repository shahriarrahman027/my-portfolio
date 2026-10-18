import { useState, type SyntheticEvent } from 'react';
import type { Locale } from '@/types';

interface Props {
  locale: Locale;
}

export function ContactForm({ locale }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, hp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Submission failed. Please try again.');
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        locale === 'bn'
          ? 'সার্ভারে সংযোগ স্থাপন করা সম্ভব হয়নি। অনুগ্রহ করে সরাসরি ইমেইল করুন।'
          : 'Network error. Please try again or reach out directly via email.'
      );
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {/* Honeypot field for spam prevention */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="hp-field">Leave this empty</label>
        <input
          id="hp-field"
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status === 'success' && (
        <div className="alert alert-success" role="alert">
          <strong>{locale === 'bn' ? 'বার্তা গৃহীত হয়েছে!' : 'Message Received!'}</strong>
          <p>
            {locale === 'bn'
              ? 'ধন্যবাদ। আপনার বার্তা সফলভাবে জমা হয়েছে এবং আর্কাইভে সংরক্ষিত হয়েছে।'
              : 'Thank you. Your message has been safely recorded and I will respond as soon as possible.'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="alert alert-error" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="contact-name" className="form-label">
          {locale === 'bn' ? 'আপনার নাম' : 'Your Name'} <span className="required">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          className="form-input"
          placeholder={locale === 'bn' ? 'যেমন: আহমেদ রফিক' : 'e.g. Alan Turing'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === 'loading'}
        />
      </div>

      <div className="form-group">
        <label htmlFor="contact-email" className="form-label">
          {locale === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'} <span className="required">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          className="form-input"
          placeholder={locale === 'bn' ? 'you@example.com' : 'you@example.com'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
        />
      </div>

      <div className="form-group">
        <label htmlFor="contact-subject" className="form-label">
          {locale === 'bn' ? 'বিষয় (ঐচ্ছিক)' : 'Subject (Optional)'}
        </label>
        <input
          id="contact-subject"
          type="text"
          className="form-input"
          placeholder={locale === 'bn' ? 'কী বিষয়ে কথা বলতে চান...' : 'What would you like to discuss...'}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={status === 'loading'}
        />
      </div>

      <div className="form-group">
        <label htmlFor="contact-message" className="form-label">
          {locale === 'bn' ? 'আপনার বার্তা' : 'Your Message'} <span className="required">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          className="form-textarea"
          placeholder={locale === 'bn' ? 'আপনার ভাবনা, প্রশ্ন বা প্রস্তাব লিখুন...' : 'Write your thoughts, inquiry, or collaboration proposal...'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === 'loading'}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary submit-btn"
        disabled={status === 'loading'}
      >
        {status === 'loading'
          ? locale === 'bn' ? 'রেকর্ড করা হচ্ছে...' : 'Recording...'
          : locale === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}
      </button>

      <style>{`
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .form-label {
          font-size: var(--text-xs);
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }
        .required {
          color: #d9534f;
        }
        .form-input, .form-textarea {
          font-family: inherit;
          font-size: var(--text-base);
          background: var(--bg-primary);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          color: var(--text-primary);
          transition: border-color var(--transition-fast);
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--accent-subtle);
        }
        .submit-btn {
          align-self: flex-start;
          padding: 0.65rem 1.5rem;
          font-size: var(--text-base);
          cursor: pointer;
        }
        .alert {
          padding: 1rem;
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
        }
        .alert-success {
          background: var(--accent-subtle);
          border: 1px solid var(--accent-primary);
          color: var(--accent-text);
        }
        .alert-error {
          background: rgba(217, 83, 79, 0.1);
          border: 1px solid rgba(217, 83, 79, 0.4);
          color: #d9534f;
        }
      `}</style>
    </form>
  );
}

