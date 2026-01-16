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
