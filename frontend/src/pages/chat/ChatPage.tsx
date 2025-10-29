import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../lib/http';
import { useSocket } from '../../lib/hooks/useSocket';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../lib/hooks/useAuth';

type ChatThread = {
  threadId: string;
  productId: string;
  productName: string;
  participantId: string;
  lastMessage?: {
    message: string;
    createdAt: string;
  };
};

type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  productId: string;
  message: string;
  createdAt: string;
};

export const ChatPage = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const {
    data: threads = [],
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['chat:threads'],
    queryFn: async () => {
      try {
        const response = await httpClient.get('/chat/threads');
        return (response.data as ChatThread[]) ?? [];
      } catch (error) {
        console.warn('Chat threads not available yet', error);
        return [];
      }
    },
  });

  useEffect(() => {
    if (!socket || !activeThread || !user) return;

    socket.emit('join_room', {
      productId: activeThread.productId,
      participantId: activeThread.participantId,
    });

    const handleReceive = (payload: ChatMessage) => {
      setMessages((prev) => [...prev, payload]);
    };

    socket.on('receive_message', handleReceive);

    (async () => {
      try {
        const response = await httpClient.get('/chat/messages', {
          params: {
            productId: activeThread.productId,
            participantId: activeThread.participantId,
          },
        });
        setMessages(response.data as ChatMessage[]);
      } catch (error) {
        console.warn('Unable to fetch chat history', error);
        setMessages([]);
      }
    })();

    return () => {
      socket.off('receive_message', handleReceive);
    };
  }, [socket, activeThread, user]);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (!socket || !activeThread || !input.trim()) return;

    const payload = {
      productId: activeThread.productId,
      receiverId: activeThread.participantId,
      message: input.trim(),
    };

    socket.emit('send_message', payload);
    setInput('');
  };

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      const dateA = a.lastMessage?.createdAt ?? '';
      const dateB = b.lastMessage?.createdAt ?? '';
      return dateA < dateB ? 1 : -1;
    });
  }, [threads]);

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[20rem,1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Conversations</h2>
          <Button variant="ghost" onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </Button>
        </div>
        <div className="divide-y divide-slate-100">
          {sortedThreads.length ? (
            sortedThreads.map((thread) => (
              <button
                key={thread.threadId}
                onClick={() => setActiveThread(thread)}
                className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-50 ${
                  activeThread?.threadId === thread.threadId ? 'bg-indigo-50/60' : ''
                }`}
              >
                <span className="text-sm font-medium text-slate-800">{thread.productName}</span>
                <span className="text-xs text-slate-500">
                  {thread.lastMessage?.message ?? 'Start the conversation'}
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-slate-500">
              {isFetching ? 'Loading conversations…' : 'No conversations yet.'}
            </p>
          )}
        </div>
      </aside>
      <section className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        {activeThread ? (
          <>
            <header className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-800">Product • {activeThread.productName}</h3>
              <p className="text-xs text-slate-500">Chat with participant {activeThread.participantId}</p>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {messages.length ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-md rounded-2xl px-4 py-2 text-sm shadow ${
                        message.senderId === user?.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p>{message.message}</p>
                      <span className="mt-1 block text-[10px] opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-500">No messages yet. Say hello!</p>
              )}
            </div>
            <form onSubmit={handleSend} className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Write a message"
                  className="flex-1"
                />
                <Button type="submit" disabled={!input.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-slate-500">
            <h3 className="text-lg font-semibold text-slate-700">Select a conversation</h3>
            <p className="text-sm">
              Pick a product chat on the left to start messaging or refresh your active conversations.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
