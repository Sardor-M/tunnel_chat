import { TunnelChatUserProvider } from './context/TunnelChatUserContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chat from '@/pages/Chat/Chat';
import Login from '@/pages/Auth/Login';
import MyPage from '@/pages/MyPage/MyPage';
import TunnelRooms from '@/pages/Rooms/Rooms';
import ProtectedRoute from '@/utils/ProtectedRoute';
import Layout from '@/layout/Layout';
import Home from '@/pages/Home/index';

export default function App() {
    return (
        <TunnelChatUserProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/myPage"
                            element={
                                <ProtectedRoute>
                                    <MyPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/rooms"
                            element={
                                <ProtectedRoute>
                                    <TunnelRooms />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/chat/:roomId"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </TunnelChatUserProvider>
    );
}
