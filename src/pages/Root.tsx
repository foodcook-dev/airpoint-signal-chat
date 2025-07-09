import { Route, Routes } from 'react-router-dom';
import SignalChat from './signal-chat/templates';

export default function Root() {
  return (
    <Routes>
      {/* <Route element={<BaseLayout />}> */}
      <Route path="/" element={<SignalChat />} />
      {/* </Route> */}
    </Routes>
  );
}
