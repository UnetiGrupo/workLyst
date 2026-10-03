export interface GroupItem {
  id: string
  name: string
  membersCount: number
  description: string
  isMember?: boolean
}

export const GROUPS_MOCK: GroupItem[] = [
  {
    id: '1',
    name: 'Worklyst Mobile',
    membersCount: 4,
    description: 'Grupo específico para planificar y desarrollar el proyecto de Worklyst Mobile. Desde la arquitectura hasta el testing.',
    isMember: true,
  },
  {
    id: '2',
    name: 'UNETI Desarrollo',
    membersCount: 86,
    description: 'Grupo de desarrollo de la Universidad Nacional Experimental de las Telecomunicaciones e Informática. Con el fin de hacer actividades y promover el desarrollo en la universidad.',
    isMember: true,
  },
]