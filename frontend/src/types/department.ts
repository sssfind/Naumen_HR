export interface DepartmentTreeNode {
  id: number
  name: string
  description: string | null
  employeeCount: number
  children: DepartmentTreeNode[]
}

export interface Department {
  id: number
  name: string
  parentId: number
  parentName: string
  description: string | null
}
