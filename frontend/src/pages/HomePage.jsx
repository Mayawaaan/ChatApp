import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <main className="h-[calc(100dvh-3rem)] md:h-[calc(100dvh-5.25rem)] w-full flex bg-surface overflow-hidden">
      <Sidebar />
      {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
    </main>
  );
};

export default HomePage;
