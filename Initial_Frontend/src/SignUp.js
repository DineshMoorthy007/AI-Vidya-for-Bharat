import React from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
            <nav className="w-full px-6 py-4 flex justify-between items-center bg-transparent relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
                        <span className="material-symbols-outlined text-2xl">auto_stories</span>
                    </div>
                    <span className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">AI Vidya</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm text-sm font-medium hover:bg-primary/10 transition-colors h-11">
                        <span className="material-symbols-outlined text-primary">language</span>
                        <span>हिन्दी / English</span>
                        <span className="material-symbols-outlined text-xs">expand_more</span>
                    </button>
                </div>
            </nav>

            <main className="flex-1 flex items-center justify-center p-4 relative">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(#fa9938 0.5px, transparent 0.5px), radial-gradient(#fa9938 0.5px, #f8f7f5 0.5px)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px'
                }}></div>
                <div className="max-w-md w-full bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-primary/10 overflow-hidden relative z-10">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Join AI Vidya for Bharat</h1>
                            <p className="text-slate-600 dark:text-slate-400">Multilingual AI-powered education for everyone</p>
                        </div>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Mobile Number</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400 font-medium">+91</span>
                                    <input
                                        className="w-full h-14 pl-14 pr-4 rounded-lg border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background-light dark:bg-slate-800 text-lg tracking-wider transition-all outline-none"
                                        maxLength="10"
                                        placeholder="98765 43210"
                                        type="tel"
                                    />
                                </div>
                            </div>
                            <button
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-lg transition-transform active:scale-95"
                                type="submit"
                            >
                                Send OTP
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Or continue with</span>
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <button className="w-full h-12 flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium" type="button">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.62z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    Google
                                </button>
                            </div>
                        </form>
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Already have an account?
                                <Link to="/login" className="text-primary hover:underline font-medium ml-1">Sign In</Link>
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-4">
                                By signing up, you agree to our
                                <a className="text-primary hover:underline font-medium mx-1" href="#">Terms</a> and
                                <a className="text-primary hover:underline font-medium mx-1" href="#">Privacy Policy</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full py-6 text-center text-slate-400 text-xs relative z-10">
                <div className="flex justify-center gap-6 mb-2">
                    <a className="hover:text-primary transition-colors" href="#">Help Center</a>
                    <a className="hover:text-primary transition-colors" href="#">Contact</a>
                    <a className="hover:text-primary transition-colors" href="#">Supported Languages</a>
                </div>
                <p>© 2024 AI Vidya for Bharat. Empowering India through AI.</p>
            </footer>

            <div className="fixed bottom-0 right-0 p-8 opacity-10 pointer-events-none select-none">
                <span className="material-symbols-outlined text-9xl">school</span>
            </div>
        </div>
    );
};

export default SignUp;
