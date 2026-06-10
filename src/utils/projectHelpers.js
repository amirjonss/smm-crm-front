import { useProjectStore } from '@/stores/project'

export function getProjectName(project) {
  if (!project) return '---'
  if (typeof project === 'object' && project.name) return project.name
  if (typeof project === 'string') {
    const id = project.split('/').pop()
    const projectStore = useProjectStore()
    const found = projectStore.getProjects.find((p) => String(p.id) === String(id))
    return found ? found.name : '---'
  }
  return '---'
}

export function getProjectActive(project) {
  if (!project) return true
  if (typeof project === 'object') {
    if ('isActive' in project) return project.isActive
    const id = project.id
    if (id) {
      const projectStore = useProjectStore()
      const found = projectStore.getProjects.find((p) => String(p.id) === String(id))
      return found ? found.isActive : true
    }
  }
  if (typeof project === 'string') {
    const id = project.split('/').pop()
    const projectStore = useProjectStore()
    const found = projectStore.getProjects.find((p) => String(p.id) === String(id))
    return found ? found.isActive : true
  }
  return true
}
