import { isAxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  history?: HistoryMessage[]
}

interface ChatResponse {
  reply: string
}

interface ApiErrorResponse {
  message?: string
}

export function useChat() {
  return useMutation({
    mutationFn: async (body: ChatRequest) => {
      const { data } = await api.post<ChatResponse>('/chat', body)
      return data
    },
    onError: (error) => {
      const message =
        isAxiosError<ApiErrorResponse>(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Не удалось получить ответ чат-бота'

      toast.error(message)
    },
  })
}
