import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { IoEyeOutline, IoEyeOffOutline, IoArrowForwardOutline } from 'react-icons/io5';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isSignup) {
        await signup(data);
        toast.success('Account created successfully!');
      } else {
        await login(data.email, data.password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || (isSignup ? 'Signup failed' : 'Invalid credentials');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    reset();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F5F3FF 100%)',
      padding: 'var(--space-4)',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}></div>
      <div style={{
        position: 'fixed',
        bottom: -80,
        left: -80,
        width: 350,
        height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}></div>

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 440 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)',
            boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>A</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Asset<span style={{ color: 'var(--primary)' }}>Flow</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>
            Enterprise Asset & Resource Management
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
          }}>
            <button
              onClick={() => !isSignup || toggleMode()}
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                background: !isSignup ? 'var(--bg-card)' : 'var(--bg-main)',
                color: !isSignup ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: !isSignup ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              id="login-tab"
            >
              Sign In
            </button>
            <button
              onClick={() => isSignup || toggleMode()}
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                background: isSignup ? 'var(--bg-card)' : 'var(--bg-main)',
                color: isSignup ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: isSignup ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              id="signup-tab"
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 'var(--space-6)' }}>
            {isSignup && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  {...register('name', { required: 'Name is required' })}
                  id="signup-name-input"
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@company.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                })}
                id="email-input"
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                  })}
                  style={{ paddingRight: 44 }}
                  id="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    padding: 6,
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {isSignup && (
              <div className="form-group">
                <label className="form-label">Department (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Engineering, HR, Finance"
                  {...register('department')}
                  id="signup-dept-input"
                />
              </div>
            )}

            {!isSignup && (
              <div style={{ textAlign: 'right', marginBottom: 'var(--space-4)' }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  id="forgot-password-btn"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: 'var(--space-2)',
                gap: 'var(--space-2)',
              }}
              id="auth-submit-btn"
            >
              {loading ? (
                <div className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}></div>
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <IoArrowForwardOutline size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-6)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}>
          {isSignup
            ? 'By signing up, you agree to our Terms of Service'
            : "Don't have an account? Click Sign Up above"}
        </p>
      </div>
    </div>
  );
}
