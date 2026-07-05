import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { path: '/',          icon: import.meta.env.BASE_URL + 'logos/nav-smile.png', label: '首页',   color: '#5B9BD5' },
  { path: '/water',     icon: import.meta.env.BASE_URL + 'logos/nav-lie.png',   label: '喝水',   color: '#5B9BD5' },
  { path: '/calendar',  icon: import.meta.env.BASE_URL + 'logos/nav-run.png',   label: '日历',   color: '#E91E63' },
  { path: '/todo',      icon: import.meta.env.BASE_URL + 'logos/nav-wave.png',  label: '待办',   color: '#FF9800' },
]

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      {/* 内容区 */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* 底部导航栏 — 可爱风格 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-app mx-auto bg-white/90 backdrop-blur-lg rounded-t-3xl"
             style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.04), 0 -1px 4px rgba(0,0,0,0.02)' }}>
          <div className="flex justify-around items-center h-16 px-1">
            {tabs.map(tab => (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[44px] ${
                    isActive
                      ? 'scale-110'
                      : 'text-gray-400 hover:text-gray-600'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? tab.color : undefined,
                })}
              >
                {({ isActive }) => (
                  <>
                    <span className="text-xl leading-none relative">
                      <img
                        src={tab.icon}
                        alt={tab.label}
                        className="w-7 h-7 object-contain"
                        style={{
                          filter: isActive ? 'none' : 'grayscale(40%) opacity(0.55)',
                          transition: 'filter 0.2s ease',
                        }}
                      />
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                              style={{ background: tab.color, opacity: 0.6 }} />
                      )}
                    </span>
                    <span className={`text-[10px] font-bold ${isActive ? '' : 'font-medium'}`}>
                      {tab.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
