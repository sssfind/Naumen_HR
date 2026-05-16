import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type {
  ApplyPlanTemplateRequest,
  ApplyPlanTemplateResponse,
  PlanTemplateDetail,
  PlanTemplateRequest,
  PlanTemplateSummary,
  PlanTemplateTask,
  PlanTemplateTaskRequest,
} from '@/types/template'

export function usePlanTemplates() {
  return useQuery({
    queryKey: ['hr', 'plan-templates'],
    queryFn: async () => {
      const { data } = await api.get<PlanTemplateSummary[]>('/hr/plan-templates')
      return data
    },
  })
}

export function usePlanTemplate(templateId?: number) {
  return useQuery({
    queryKey: ['hr', 'plan-templates', templateId],
    enabled: Boolean(templateId),
    queryFn: async () => {
      const { data } = await api.get<PlanTemplateDetail>(`/hr/plan-templates/${templateId}`)
      return data
    },
  })
}

export function useCreatePlanTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: PlanTemplateRequest) => {
      const { data } = await api.post<PlanTemplateDetail>('/hr/plan-templates', request)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'plan-templates'] })
      toast.success('Шаблон создан')
    },
    onError: () => toast.error('Не удалось создать шаблон'),
  })
}

export function useDeletePlanTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (templateId: number) => {
      await api.delete(`/hr/plan-templates/${templateId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'plan-templates'] })
      toast.success('Шаблон удалён')
    },
    onError: () => toast.error('Не удалось удалить шаблон'),
  })
}

export function useCreatePlanTemplateTask(templateId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: PlanTemplateTaskRequest) => {
      const { data } = await api.post<PlanTemplateTask>(
        `/hr/plan-templates/${templateId}/tasks`,
        request
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'plan-templates', templateId] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'plan-templates'] })
      toast.success('Задача добавлена в шаблон')
    },
    onError: () => toast.error('Не удалось добавить задачу'),
  })
}

export function useDeletePlanTemplateTask(templateId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`/hr/plan-templates/${templateId}/tasks/${taskId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'plan-templates', templateId] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'plan-templates'] })
      toast.success('Задача удалена из шаблона')
    },
    onError: () => toast.error('Не удалось удалить задачу'),
  })
}

export function useApplyPlanTemplate(traineeId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      templateId,
      request,
    }: {
      templateId: number
      request?: ApplyPlanTemplateRequest
    }) => {
      const { data } = await api.post<ApplyPlanTemplateResponse>(
        `/hr/trainees/${traineeId}/plan/apply-template/${templateId}`,
        request ?? {}
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees', traineeId, 'plan'] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'trainees', traineeId, 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['hr', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['trainee', 'dashboard'] })
      toast.success(`Шаблон «${data.templateName}»: добавлено ${data.tasksCreated} задач`)
    },
    onError: () => toast.error('Не удалось применить шаблон'),
  })
}
