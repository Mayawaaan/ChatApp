import React from 'react'
import { useThemeStore } from '../store/useThemeStore';

const Settings = () => {
  const { theme, setTheme, themes } = useThemeStore();

  return (
    <div className='flex w-full min-h-screen justify-center items-center p-4' style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className='w-full max-w-lg p-8 space-y-8 rounded-2xl shadow-lg' style={{ backgroundColor: 'var(--bg-card-color)' }}>
        <div className='text-center'>
          <h1 className='text-4xl font-bold' style={{ color: 'var(--text-primary)' }}>Settings</h1>
          <p className='mt-2' style={{ color: 'var(--text-secondary)' }}>Customize your application experience.</p>
        </div>

        {/* Chat Theme Preview Section */}
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold' style={{ color: 'var(--text-primary)' }}>Theme Preview</h3>
          <div className='p-4 rounded-lg shadow-inner space-y-3' style={{ backgroundColor: 'var(--bg-color)' }}>
            {/* Other's message */}
            <div className='flex justify-start'>
              <div className='p-2 rounded-lg max-w-xs' style={{ backgroundColor: 'var(--bg-card-color)' }}>
                <p className='text-sm' style={{ color: 'var(--text-primary)' }}>Hey! How's it going?</p>
              </div>
            </div>
            {/* Your message */}
            <div className='flex justify-end'>
              <div className='p-2 rounded-lg max-w-xs text-white' style={{ backgroundColor: 'var(--primary-color)' }}>
                <p className='text-sm'>Great! Just checking out these awesome themes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <h2 className='text-2xl font-semibold' style={{ color: 'var(--text-primary)' }}>Theme Selection</h2>
          <div className='grid grid-cols-4 gap-4'>
            {themes.map((t) => (
              <div
                key={t}
                className={`relative w-full h-20 rounded-lg cursor-pointer flex items-center justify-center border-2 transition-all duration-200
                            ${theme === t ? 'border-[var(--primary-color)] shadow-md' : 'border-gray-300 hover:border-gray-400'} h-16`}
                style={{ backgroundColor: `var(--${t.replace('theme-', '')}-color)` }} // Use a specific color variable for swatch background
                onClick={() => setTheme(t)}
              >
                {theme === t && (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                <span className="absolute bottom-1 text-xs font-medium text-white capitalize drop-shadow-sm">
                  {t.replace('theme-', '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings