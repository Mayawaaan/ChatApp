import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Loader, Camera, User, Mail, Calendar, ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(authUser?.profilePic || '/Avatar.jpg');

  useEffect(() => { setImgUrl(authUser?.profilePic || '/Avatar.jpg'); }, [authUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImgUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (selectedFile) {
      // imgUrl is already a base64 string from FileReader
      await updateProfile(imgUrl);
      setSelectedFile(null); // Reset after update
    }
  };

  if (!authUser) return null; // or a loading spinner

  return (
    <div className='flex w-full h-screen justify-center items-center' style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className='w-full max-w-lg p-8 space-y-8 rounded-2xl shadow-lg' style={{ backgroundColor: 'var(--bg-card-color)' }}>
        <div className='text-center'>
          <h1 className='text-4xl font-bold' style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className='mt-2' style={{ color: 'var(--text-secondary)' }}>Manage your account settings and details.</p>
        </div>

        <div className='flex flex-col items-center space-y-6'>
          <input type='file' hidden ref={fileInputRef} onChange={handleFileChange} accept='image/*' />
          <div className='relative group w-32 h-32' onClick={() => fileInputRef.current.click()}>
            <img src={imgUrl} alt='Profile' className='w-full h-full rounded-full object-cover border-4 border-[var(--primary-color-light)] group-hover:border-[var(--primary-color)] transition-all duration-300' />
            <div className='absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300'>
              <Camera className='h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </div>
          </div>

          <div className=' flex flex-col items-center w-full py-4 border-t border-[var(--primary-color-light)] space-y-4'>
            <h3 className='text-xl font-semibold' style={{ color: 'var(--text-primary)' }}>User Details</h3>

            <ul className='space-y-5 flex flex-col ' style={{ color: 'var(--text-primary)' }}>
              <li className='flex items-center space-x-4 p-2 border-t border-x border-[var(--primary-color-light)]'>
                <User className='w-5 h-5' style={{ color: 'var(--text-primary)' }} />
                <span className='font-medium' style={{ color: 'var(--text-primary)' }}>{authUser?.fullName || 'User'}</span>
              </li>
              <li className='flex items-center space-x-4 p-2 border-t border-x border-[var(--primary-color-light)]'>
                <Mail className='w-5 h-5' style={{ color: 'var(--text-primary)' }} />
                <span>{authUser?.email || 'user@example.com'}</span>
              </li>
              <li className='flex items-center space-x-4 p-2 border-t border-x border-[var(--primary-color-light)]'>
                <Calendar className='w-5 h-5' style={{ color: 'var(--text-primary)' }} />
                <span>
                  Member since: {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </li>
              <li className='flex items-center space-x-4 p-2 border-t border-x border-[var(--primary-color-light)]' style={{ color: 'var(--text-primary)' }}>
                <ShieldCheck className='w-5 h-5' />
                <span className='font-medium'>Account Status: Active</span>
              </li>
            </ul>
          </div>

          {selectedFile && (
            <button
              className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300'
              style={{ backgroundColor: 'var(--primary-color)', '--tw-ring-color': 'var(--primary-color)' }}
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? <Loader className='animate-spin' /> : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
