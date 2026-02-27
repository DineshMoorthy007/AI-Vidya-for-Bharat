import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignIn = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
            <div className="relative flex flex-col min-h-screen">
                {/* Navigation Header */}
                <header className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-accent-warm dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="text-primary size-8">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                                <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight">AI Vidya</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden md:flex items-center gap-2 bg-neutral-warm dark:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold border border-accent-warm dark:border-slate-700">
                            <span className="material-symbols-outlined text-[18px]">language</span>
                            English
                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        </button>
                        <button className="md:hidden flex items-center justify-center bg-neutral-warm dark:bg-slate-800 size-10 rounded-full border border-accent-warm dark:border-slate-700">
                            <span className="material-symbols-outlined">language</span>
                        </button>
                    </div>
                </header>

                {/* Main Content Section */}
                <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-20">
                    <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 shadow-xl border border-accent-warm/50 dark:border-slate-800 rounded-lg overflow-hidden">
                        {/* Sign In Card Content */}
                        <div className="p-8 md:p-10 flex flex-col items-center">
                            <div className="mb-8 text-center">
                                <h1 className="font-heading text-3xl md:text-4xl text-slate-900 dark:text-slate-100 mb-2">Welcome Back</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Empowering Bharat through Knowledge</p>
                            </div>
                            {/* Sign In Form */}
                            <div className="w-full space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Mobile Number or Email
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary">person</span>
                                        <input className="w-full h-14 pl-12 pr-4 bg-background-light dark:bg-slate-800 border border-accent-warm dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base" placeholder="e.g. 9876543210" type="text" />
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogin}
                                    className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-lg"
                                >
                                    <span>Continue with OTP</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-accent-warm dark:border-slate-800"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">Or continue with</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <button className="flex items-center justify-center gap-3 w-full h-12 border border-accent-warm dark:border-slate-700 rounded-xl hover:bg-neutral-warm dark:hover:bg-slate-800 transition-colors">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.62z" fill="#FBBC05"></path>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                        </svg>
                                        <span className="text-sm font-semibold">Google</span>
                                    </button>
                                </div>
                            </div>
                            {/* Sign Up Link */}
                            <div className="mt-8 text-center">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Don't have an account?
                                    <Link to="/signup" className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1">Join now for free</Link>
                                </p>
                            </div>
                        </div>
                        {/* Footer/Trust Badges */}
                        <div className="bg-neutral-warm dark:bg-slate-800/50 p-6 flex flex-col md:flex-row items-center justify-center gap-6 border-t border-accent-warm dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                                Secure OTP Login
                            </div>
                            <div className="hidden md:block w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-primary text-[18px]">public</span>
                                Available in 6 Languages
                            </div>
                        </div>
                    </div>
                </main>

                {/* Decorative elements */}
                <div className="fixed top-20 left-10 opacity-20 pointer-events-none select-none">
                    <div className="w-64 h-64 bg-primary blur-[100px] rounded-full"></div>
                </div>
                <div className="fixed bottom-20 right-10 opacity-10 pointer-events-none select-none">
                    <div className="w-80 h-80 bg-primary blur-[120px] rounded-full"></div>
                </div>
                {/* Footer Text */}
                <footer className="py-6 text-center text-slate-400 dark:text-slate-600 text-[10px] uppercase tracking-widest">
                    © 2024 AI Vidya for Bharat • Education for Everyone
                </footer>
            </div>
        </div>
    );
};

export default SignIn;
