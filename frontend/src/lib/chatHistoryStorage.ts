export const CHAT_WELCOME_ID = 0
export const CHAT_MAX_MESSAGES = 10
const STORAGE_PREFIX = 'nau-start-chat-history'

export type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  text: string
}

export function createWelcomeMessage(): ChatMessage {
  return {
    id: CHAT_WELCOME_ID,
    role: 'assistant',
    text: 'Здравствуйте! Я помогу с простыми HR-вопросами: отпуск, регламенты, пропуск, план стажировки и задачи.',
  }
}

function getStorageKey(): string {
  const raw = localStorage.getItem('user')
  if (!raw) return STORAGE_PREFIX
  try {
    const user = JSON.parse(raw) as { id?: number; email?: string }
    const suffix = user.id ?? user.email ?? 'default'
    return `${STORAGE_PREFIX}-${suffix}`
  } catch {
    return STORAGE_PREFIX
  }
}

export function trimChatMessages(messages: ChatMessage[]): ChatMessage[] {
  const welcome = messages.find((m) => m.id === CHAT_WELCOME_ID) ?? createWelcomeMessage()
  const conversation = messages.filter((m) => m.id !== CHAT_WELCOME_ID)
  return [welcome, ...conversation.slice(-CHAT_MAX_MESSAGES)]
}

export function loadChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (!raw) return [createWelcomeMessage()]
    const parsed = JSON.parse(raw) as ChatMessage[]
    if (!Array.isArray(parsed) || parsed.length === 0) return [createWelcomeMessage()]
    return trimChatMessages(parsed)
  } catch {
    return [createWelcomeMessage()]
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(trimChatMessages(messages)))
  } catch {
    // ignore quota / private mode
  }
}

export function clearChatHistory(): void {
  localStorage.removeItem(getStorageKey())
}

export function nextMessageId(messages: ChatMessage[]): number {
  const maxId = messages.reduce((max, m) => Math.max(max, m.id), CHAT_WELCOME_ID)
  return maxId + 1
}
