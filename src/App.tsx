import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 导入主题提供者
import { ThemeProvider } from './contexts/ThemeContext';

// 导入Mac风格样式
import './styles/theme.css';
import './styles/layout.css';
import './styles/pages.css';

// 导入页面组件
import Layout from './components/Layout';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import CreateRecord from './pages/CreateRecord';
import EditRecord from './pages/EditRecord';
import ExportPage from './pages/ExportPage';

// 设置dayjs中文
dayjs.locale('zh-cn');

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5分钟
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={zhCN}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<ProjectList />} />
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/create" element={<CreateProject />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/projects/:id/edit" element={<EditProject />} />
                <Route path="/projects/:id/records/create" element={<CreateRecord />} />
                <Route path="/projects/:projectId/records/:recordId/edit" element={<EditRecord />} />
                <Route path="/projects/:id/export" element={<ExportPage />} />
              </Routes>
            </Layout>
          </Router>
        </ConfigProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App; 