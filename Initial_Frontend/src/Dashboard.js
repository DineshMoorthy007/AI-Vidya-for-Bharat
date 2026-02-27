import React, { useState } from 'react';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background-light dark:bg-background-dark border-r border-neutral-accent dark:border-slate-800 p-4 shrink-0 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col`}>
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="size-10 bg-primary rounded-full flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-2xl">auto_stories</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-none">AI Vidya</h1>
                        <p className="text-primary text-xs font-medium">Education for Bharat</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold" href="#">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-sm">Dashboard</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-neutral-accent dark:hover:bg-slate-800 transition-colors" href="#">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        <span className="text-sm">Generate Course</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-neutral-accent dark:hover:bg-slate-800 transition-colors" href="#">
                        <span className="material-symbols-outlined">book_4</span>
                        <span className="text-sm">My Courses</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-neutral-accent dark:hover:bg-slate-800 transition-colors" href="#">
                        <span className="material-symbols-outlined">psychology</span>
                        <span className="text-sm">AI Guru</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-neutral-accent dark:hover:bg-slate-800 transition-colors" href="#">
                        <span className="material-symbols-outlined">cloud_off</span>
                        <span className="text-sm">Offline Mode</span>
                    </a>
                    <div className="mt-auto pt-4 border-t border-neutral-accent dark:border-slate-800">
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-neutral-accent dark:hover:bg-slate-800 transition-colors" href="#">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-sm">Settings</span>
                        </a>
                    </div>
                </nav>

                <div className="flex items-center gap-3 mt-4 p-2 bg-neutral-accent dark:bg-slate-800 rounded-xl">
                    <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCVNiavsFqkPOIdr7v1hPT1XtQeiDWwqVmy-qAOGfJGdGE8zMC3J1Lp2wk8HbITtiig5Uk4DGZAlnLDHonEf2KeV-h1Ay3jq_EqWvA4ZLznLPreP2pHEPzEINkAYc053MWPUVN_Rncwl8T8XnJKS7f3BObFFs59az5hscchHWv9LkMfwYRuyU0jev3LeakGpWC3dnugAZkdT4FAAkWbJDzA_gKfFl3TWYFquimeVkCkU8ENbGVP8vcJAEBpArycuZgvR2RwbNxjkTQ')" }}></div>
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-semibold truncate">Rajesh Kumar</p>
                        <p className="text-xs text-slate-500 truncate">Uttar Pradesh, IN</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
                {/* Top Navigation */}
                <header className="flex items-center justify-between px-6 py-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-neutral-accent dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 rounded-full hover:bg-neutral-accent dark:hover:bg-slate-800"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold">Namaste, Rajesh</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-neutral-accent dark:bg-slate-800 px-3 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-lg">language</span>
                            <select className="bg-transparent border-none focus:ring-0 text-sm font-medium pr-8 py-0">
                                <option>Hindi</option>
                                <option>Tamil</option>
                                <option>English</option>
                                <option>Marathi</option>
                            </select>
                        </div>
                        <button className="relative p-2 rounded-full bg-neutral-accent dark:bg-slate-800 hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1 right-1 size-2.5 bg-primary border-2 border-background-light dark:border-background-dark rounded-full"></span>
                        </button>
                        <div className="size-10 rounded-full bg-cover bg-center md:hidden" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAM5-JJZmxl7O4yjV0yQwaG5WNC7i_Diga1rMfc5jxNnalwwpp_ZtC0w3hbJ1dG447tFLPT-klE513aqWUUfo31qzrMxKXSYUF9WTpjp87dmznd35qIjBUSZwOgxcKWM1zDn4ecnFiDVwFB7Fy05RojwOgnlCqEaulhGfhxGWCXXA8N9Z9asLSY4GRPabZMfzQsg-QtwYsu75ANv5VTbvZRJuSrHNq6bS1BZMLzz-Msto8Z8BnMKu-xTZ0Ee9zq1squ22xJBjsd3OA')" }}></div>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
                    {/* Hero Input Card */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-neutral-accent dark:border-slate-800 p-6 md:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 size-64 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight">What do you want to learn today?</h1>
                                <p className="text-slate-500 dark:text-slate-400">AI-powered education in your language, at your speed.</p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input className="w-full pl-12 pr-4 py-4 rounded-xl bg-neutral-accent dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-lg" placeholder="Enter any topic (e.g., Solar Energy, Goat Farming...)" type="text" />
                                </div>
                                <div className="flex gap-3">
                                    <button className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all border-2 border-primary/20 group relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-xl animate-ping opacity-20"></div>
                                        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">mic</span>
                                    </button>
                                    <button className="flex-1 md:flex-none px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all text-lg">
                                        Generate Course
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats */}
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-neutral-accent dark:border-slate-800 flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined">library_books</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">12</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Courses Generated</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-neutral-accent dark:border-slate-800 flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-india-green/10 text-india-green flex items-center justify-center">
                                <span className="material-symbols-outlined">quiz</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">45</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Quizzes Taken</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-neutral-accent dark:border-slate-800 flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">download</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">8</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Offline Saved</p>
                            </div>
                        </div>
                    </section>

                    {/* My Courses Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">My Courses</h3>
                            <a className="text-primary text-sm font-semibold hover:underline" href="#">View All</a>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                            {/* Course Card 1 */}
                            <div className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-slate-900 rounded-xl border border-neutral-accent dark:border-slate-800 overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-32 bg-slate-200 bg-cover bg-center relative" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAy2v7kl9p-ZoNVkah-YF28dmOkNGgQabGvMpvTp6mKAimV1vGW3IbM_G8nZ_Gt3_YkSuOr2P52LxMZhCSl1VVMYgb7zCPJPnImsm5yCOL-9pTcj9qRDZ55oUNDCkxHfE-YNTeMFXs9_GNVBWw-PO9jdxre0hzWw93Pcm256KxU2CUIZ1A08b0zGIcrWwi8axpiJV9dBTu6oMe7yPL27TH6Aq5pUIH-1SRtEnE78b9SUjsY04xdoR7ic8qZ4VamVUHBlRiiCEKjGF4')" }}>
                                    <span className="absolute top-2 right-2 bg-india-green text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Hindi</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <h4 className="font-bold text-lg leading-tight">Digital Literacy for Beginners</h4>
                                    <div className="w-full bg-neutral-accent dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-india-green h-full" style={{ width: "65%" }}></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                        <span>65% Complete</span>
                                        <span>8 Lessons left</span>
                                    </div>
                                    <button className="w-full py-2 bg-neutral-accent dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">Continue</button>
                                </div>
                            </div>
                            {/* Course Card 2 */}
                            <div className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-slate-900 rounded-xl border border-neutral-accent dark:border-slate-800 overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-32 bg-slate-200 bg-cover bg-center relative" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeDmbN2qJCEzSvdx-BBhk3xy9SZ5JH6DBK9eOocqJO6YFPhJ6qHv_6en7MRs2-HtfRvwugapaZqgUk_i5SiFG_kHuB6VXijuBk88dEq__u_GSzQjhmG3ZtPstEIp2tPLYoXASUaaYgi4_wZOmSt5b3y-fHPyg64LoDwB9SAoDmw8mJulXGdEtEFYqi9NiBv1lM7S5Q61jkAiLVnpxVS5MOEL-IuzPLBfNuGYWGGMKFGblTb7I1mhDSYGbL1aGXNGVZFo2LD3EXHz8')" }}>
                                    <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Tamil</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <h4 className="font-bold text-lg leading-tight">Organic Farming Essentials</h4>
                                    <div className="w-full bg-neutral-accent dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full" style={{ width: "20%" }}></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                        <span>20% Complete</span>
                                        <span>14 Lessons left</span>
                                    </div>
                                    <button className="w-full py-2 bg-neutral-accent dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">Continue</button>
                                </div>
                            </div>
                            {/* Course Card 3 */}
                            <div className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-slate-900 rounded-xl border border-neutral-accent dark:border-slate-800 overflow-hidden snap-start shadow-sm">
                                <div className="h-32 bg-slate-200 bg-cover bg-center relative" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClHrMT7AkGwoL2eq73gK_mTYc67aPYWSyg7e1j1NNuQF14Tx1aZC6kUEIrgKYrWiYDBQnZlQRk05YRtb026Z4sYbGTRvdLIUhX559008HvmdO_lK73vHQ-bXNwr_4V-jZ8qIxPxFWLRpfkFMe6qIQJaYi76wfC1wqPw-h1jiMIa07MKGSxXCjNB8Q9A9JzyZyNZ62vMu19tpU4aWTFJeqsJK-ulwwhjK4gfR-withiIn3kXX-ifInXfoX4XVys4wilJNnpVUAbiaw')" }}>
                                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">English</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <h4 className="font-bold text-lg leading-tight">Financial Savings 101</h4>
                                    <div className="w-full bg-neutral-accent dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full" style={{ width: "0%" }}></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                        <span>Not started</span>
                                        <span>10 Lessons</span>
                                    </div>
                                    <button className="w-full py-2 bg-neutral-accent dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">Start Learning</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Offline Courses */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Offline Courses</h3>
                                <span className="flex items-center gap-1 text-xs text-india-green font-bold">
                                    <span className="material-symbols-outlined text-sm">wifi_off</span>
                                    Available Offline
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-neutral-accent dark:border-slate-800 items-center">
                                    <div className="size-16 bg-neutral-accent dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">solar_power</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold truncate">Solar Maintenance</p>
                                        <p className="text-xs text-slate-500">240 MB • Hindi</p>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-primary">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                                <div className="flex gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-neutral-accent dark:border-slate-800 items-center">
                                    <div className="size-16 bg-neutral-accent dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">health_and_safety</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold truncate">First Aid Training</p>
                                        <p className="text-xs text-slate-500">185 MB • Marathi</p>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-primary">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Recent Activity */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Recent Activity</h3>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-neutral-accent dark:border-slate-800 p-4">
                                <ul className="space-y-4">
                                    <li className="flex gap-4 relative">
                                        <div className="absolute left-3 top-6 bottom-0 w-px bg-neutral-accent dark:border-slate-800"></div>
                                        <div className="size-6 rounded-full bg-primary flex items-center justify-center text-white z-10 shrink-0">
                                            <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-sm font-semibold">Resumed "Digital Literacy"</p>
                                            <p className="text-xs text-slate-500">2 hours ago</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4 relative">
                                        <div className="absolute left-3 top-6 bottom-0 w-px bg-neutral-accent dark:border-slate-800"></div>
                                        <div className="size-6 rounded-full bg-india-green flex items-center justify-center text-white z-10 shrink-0">
                                            <span className="material-symbols-outlined text-[14px]">check</span>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-sm font-semibold">Completed Quiz: Soil Prep</p>
                                            <p className="text-xs text-slate-500">Yesterday</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="size-6 rounded-full bg-blue-500 flex items-center justify-center text-white z-10 shrink-0">
                                            <span className="material-symbols-outlined text-[14px]">add</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">New Course: Solar Energy</p>
                                            <p className="text-xs text-slate-500">3 days ago</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer for Desktop/Bottom Nav for Mobile */}
                <footer className="mt-auto py-8 px-6 text-center text-slate-500 text-sm">
                    <p>© 2024 AI Vidya. Empowering Bharat through multilingual AI.</p>
                </footer>
            </main>

            {/* Mobile Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-neutral-accent dark:border-slate-800 flex justify-around items-center p-3 z-50">
                <button className="flex flex-col items-center gap-1 text-primary">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] font-bold">Dashboard</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <span className="text-[10px] font-bold">Generate</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">book_4</span>
                    <span className="text-[10px] font-bold">Courses</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">psychology</span>
                    <span className="text-[10px] font-bold">Guru</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-[10px] font-bold">Settings</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
