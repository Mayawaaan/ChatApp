import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader, User, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

import ThreeScene from "../components/ThreeScene";
import { useAuthStore } from "../store/useAuthStore";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const { signup, isSigningUp } = useAuthStore();

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Avoid trimming password fields
        if (name === "password" || name === "confirmPassword") {
            setFormData({ ...formData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value.trim() });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.fullName || !formData.confirmPassword) {
            // You can add a toast notification here
            return toast.error("Please fill all fields", { id: "signup-toast" });
        }
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match", { id: "signup-toast" });
        }

        // We don't need to send confirmPassword to the backend
        const { confirmPassword, ...rest } = formData;
        await signup(rest);
    };

    return (
        <div className='flex w-full h-screen'>
            {/* Left side - Form */}
            <div className='flex-1 flex justify-center items-center' style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className='w-full max-w-md p-8 space-y-4 rounded-lg shadow-md' style={{ backgroundColor: 'var(--bg-card-color)' }}>
                    <div className='text-center'>
                        <h1 className='text-3xl font-bold' style={{ color: 'var(--text-primary)' }}>Create an Account</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Join us and start your journey!</p>
                    </div>
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        <div className='relative'>
                            <label className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>Full Name</label>
                            <User className='absolute left-3 top-9 h-5 w-5 text-gray-400' />
                            <input
                                type='text'
                                name='fullName'
                                value={formData.fullName}
                                onChange={handleChange}
                                className='w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]'
                                placeholder='Your full name'
                            />
                        </div>
                        <div className='relative'>
                            <label className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>Email</label>
                            <Mail className='absolute left-3 top-9 h-5 w-5 text-gray-400' />
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                className='w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]'
                                placeholder='you@example.com'
                            />
                        </div>
                        <div className='relative'>
                            <label className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>Password</label>
                            <Lock className='absolute left-3 top-9 h-5 w-5 text-gray-400' />
                            <input
                                type={showPassword ? "text" : "password"}
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                className='w-full pl-10 pr-10 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]'
                                placeholder='••••••••'
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500'
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className='relative'>
                            <label className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>Confirm Password</label>
                            <Lock className='absolute left-3 top-9 h-5 w-5 text-gray-400' />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name='confirmPassword'
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className='w-full pl-10 pr-10 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]'
                                placeholder='••••••••'
                            />
                            <button
                                type='button'
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className='absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500'
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type='submit'
                            className='w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50'
							style={{ backgroundColor: 'var(--primary-color)', '--tw-ring-color': 'var(--primary-color)' }}
                            disabled={isSigningUp}
                        >
                            {isSigningUp ? <Loader className='animate-spin' /> : "Sign Up"}
                        </button>
                    </form>
                    <p className='text-center text-sm' style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{" "}
                        <Link to='/login' className='font-medium hover:underline' style={{ color: 'var(--primary-color)' }}>
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
            {/* Right side - Welcome message */}
            <div className='flex-1 hidden md:flex' style={{ backgroundColor: 'var(--primary-color-light)' }}>
                <ThreeScene />
            </div>
        </div>
    );
};

export default SignUpPage;