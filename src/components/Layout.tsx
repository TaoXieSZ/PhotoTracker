import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, 
  PlusOutlined 
} from '@ant-design/icons';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      key: '/projects',
      icon: <HomeOutlined />,
      label: 'My moments',
      path: '/projects'
    },
    {
      key: '/projects/create',
      icon: <PlusOutlined />,
      label: 'Start capturing',
      path: '/projects/create'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/projects') {
      return location.pathname === '/' || location.pathname === '/projects';
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="mac-app-layout">
      {/* Mac 风格的顶部导航栏 */}
      <header className="mac-header">
        <div className="mac-header-content">
          {/* 应用标题 */}
          <div className="mac-app-title">
            <span className="mac-app-icon">✨</span>
            <h1 className="mac-app-name">Moments</h1>
          </div>
          
          {/* 导航菜单和主题切换 */}
          <div className="mac-nav-section">
            <nav className="mac-nav">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  className={`mac-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            
            {/* 主题切换按钮 */}
            <div className="mac-theme-toggle-wrapper">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="mac-main">
        <div className="mac-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 