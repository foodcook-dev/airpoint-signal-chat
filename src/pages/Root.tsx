import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import SignalChat from './signal-chat';
import { DEFAULT_CHANNEL, isSignalChannel } from '@/constants/signal';

// 기존 진입 경로(/, /chat)는 유료 채널로 연결. token 쿼리가 유실되지 않도록 search 유지
function RedirectToDefaultChannel() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: `/chat/${DEFAULT_CHANNEL}`, search }} replace />;
}

function ChannelRoute() {
  const { channel } = useParams();
  if (!isSignalChannel(channel)) return <RedirectToDefaultChannel />;
  // 채널 전환 시 스레드·스크롤 상태 초기화 (작성 중인 내용은 store에 채널별로 유지)
  return <SignalChat key={channel} channel={channel} />;
}

export default function Root() {
  return (
    <Routes>
      {/* <Route element={<BaseLayout />}> */}
      <Route path="/" element={<RedirectToDefaultChannel />} />
      <Route path="/chat" element={<RedirectToDefaultChannel />} />
      <Route path="/chat/:channel" element={<ChannelRoute />} />
      <Route path="*" element={<RedirectToDefaultChannel />} />
      {/* </Route> */}
    </Routes>
  );
}
