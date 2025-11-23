import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, Settings, User } from "lucide-react";

const Navbar = () => {
	const { authUser, logout } = useAuthStore();
	const location = useLocation();

	const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/settings";

	if (!authUser && !isAuthPage) {
		return null;
	}

	return (
		<header className='bg-white shadow-sm'>
			<div className={`container mx-auto px-2 py-3 flex items-center justify-between`}>
				<Link to='/' className='text-2xl font-bold' style={{ color: 'var(--primary-color)' }}>
					ChatApp
				</Link>
				<div className="flex gap-4">
				{authUser && ( 
					<nav className='flex items-center gap-4'>
						<Link to='/profile' className='flex items-center gap-2 text-(--primary-color)'>
							<User size={20} />
							<span>Profile</span>
						</Link>
						<button onClick={logout} className='flex items-center gap-2 hover:text-red-500' style={{ color: 'var(--primary-color)' }}>
							<LogOut size={20} />
							<span>Logout</span>
						</button>
					</nav>
					)
				}
				<Link to='/settings' className='flex items-center gap-2 text-(--primary-color)'>
					<Settings size={20} />
					<span>Settings</span>
				</Link>
				</div>
			</div>
		</header>
	);
};

export default Navbar;