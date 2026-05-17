import { ChevronDown, ChevronRight, Building2, Users } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { DepartmentTreeNode } from '@/types/department'

interface DepartmentTreeSidebarProps {
  tree: DepartmentTreeNode[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  isLoading?: boolean
}

function TreeNode({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: DepartmentTreeNode
  depth: number
  selectedId: number | null
  onSelect: (id: number | null) => void
}) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = node.children.length > 0
  const isSelected = selectedId === node.id

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={() => {
          if (hasChildren) {
            setExpanded((v) => !v)
          }
          onSelect(node.id)
        }}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors',
          isSelected ? 'bg-orange-50 font-medium text-primary' : 'text-gray-700 hover:bg-gray-50'
        )}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
          )
        ) : (
          <span className="inline-block h-4 w-4 shrink-0" />
        )}
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        <span className="shrink-0 text-xs text-gray-400">{node.employeeCount}</span>
      </button>
      {hasChildren && expanded && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function DepartmentTreeSidebar({
  tree,
  selectedId,
  onSelect,
  isLoading,
}: DepartmentTreeSidebarProps) {
  return (
    <aside className="flex min-h-[320px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm lg:min-h-0">
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
          <Building2 className="h-4 w-4 text-primary" />
          Структура компании
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <p className="px-3 py-4 text-center text-sm text-gray-500">Загрузка…</p>
        )}
        {!isLoading && (
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => onSelect(null)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  selectedId === null
                    ? 'bg-orange-50 font-medium text-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Users className="h-4 w-4 shrink-0" />
                Все сотрудники
              </button>
            </li>
            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}


