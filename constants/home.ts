export const homeRouteList = [
  {
    routeName: 'mood-curve',
    name: 'Mood Curve',
    path: '#',
  },
  {
    routeName: 'Knowledge',
    name: 'Knowledge',
    path: '#',
  },
  {
    routeName: 'wordcloud',
    name: 'wordcloud',
    path: '/wordcloud',
  },
]

const setOnClick = (routeName: string, callback: () => any) => {
  const findRoute = homeRouteList.find(route => route.routeName === routeName)
  if (findRoute) callback?.()
}

export const useHomeRouteList = (emits: any) => {
  return homeRouteList.map(route => ({
    ...route,
    onClick: () => setOnClick(route.routeName, emits[route.routeName]),
  }))
}
