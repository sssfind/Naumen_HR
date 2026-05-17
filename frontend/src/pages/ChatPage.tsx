import { FormEvent, useEffect, useRef, useState } from 'react'
import { Bot, Loader2, Send, Trash2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChat } from '@/hooks/useChat'
import {
  CHAT_MAX_MESSAGES,
  CHAT_WELCOME_ID,
  clearChatHistory,
  createWelcomeMessage,
  loadChatMessages,
  nextMessageId,
  saveChatMessages,
  trimChatMessages,
  type ChatMessage,
} from '@/lib/chatHistoryStorage'
import { cn } from '@/lib/utils'

const suggestedQuestions = [
  'Как оформить отпуск?',
  'Где найти регламент?',
  'Как заказать пропуск?',
]

export function ChatPage() {
  const chat = useChat()
  const nextId = useRef(nextMessageId(loadChatMessages()))
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessages())

  useEffect(() => {
    saveChatMessages(messages)
  }, [messages])

  const hasConversation = messages.some((m) => m.id !== CHAT_WELCOME_ID)

  function clearHistory() {
    clearChatHistory()
    nextId.current = 1
    setMessages([createWelcomeMessage()])
    setMessage('')
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || chat.isPending) return

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: 'user',
      text: trimmed,
    }

    const history = messages
      .filter((m) => m.id !== CHAT_WELCOME_ID)
      .slice(-CHAT_MAX_MESSAGES)
      .map((m) => ({ role: m.role, content: m.text }))

    setMessages((prev) => trimChatMessages([...prev, userMessage]))
    setMessage('')

    try {
      const response = await chat.mutateAsync({ message: trimmed, history })
      setMessages((prev) =>
        trimChatMessages([
          ...prev,
          { id: nextId.current++, role: 'assistant', text: response.reply },
        ])
      )
    } catch {
      // toast handled in useChat
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(message)
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A2E]">Чат-бот</h1>
              <p className="mt-1 text-sm text-gray-500">
                Задайте вопрос по внутренним процессам или адаптации
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearHistory}
            disabled={chat.isPending || !hasConversation}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Очистить историю
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/60 p-6">
        {messages.map((item) => {
          const isAssistant = item.role === 'assistant'
          return (
            <div
              key={item.id}
              className={cn('flex gap-3', isAssistant ? 'justify-start' : 'justify-end')}
            >
              {isAssistant && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-2xl whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6',
                  isAssistant
                    ? 'border border-gray-100 bg-white text-[#1A1A2E]'
                    : 'bg-primary text-white'
                )}
              >
                {item.text}
              </div>
              {!isAssistant && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
          )
        })}
        {chat.isPending && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Чат-бот печатает ответ…
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void sendMessage(question)}
              disabled={chat.isPending}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-primary/40 hover:bg-orange-50 disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Например: как оформить отпуск?"
            maxLength={2000}
            disabled={chat.isPending}
          />
          <Button type="submit" disabled={chat.isPending || !message.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            Отправить
          </Button>
        </form>
      </div>
    </div>
  )
}
