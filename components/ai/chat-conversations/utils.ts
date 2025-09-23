interface Item {
  createTime: number // 时间戳
  [key: string]: any // 允许其他任意属性
}

interface GroupedResult {
  title: string
  list: Item[]
}

export function groupByCreateTime(items: Item[]): GroupedResult[] {
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000

  // 初始化分组
  const groups: Record<string, Item[]> = {
    '今天': [],
    '7天内': [],
    '30天内': [],
  }

  // 用于存储超过30天的按年月分组
  const olderGroups: Record<string, Item[]> = {}

  items.forEach((item) => {
    const diff = now - item.createTime

    if (diff < oneDayMs) {
      groups['今天'].push(item)
    }
    else if (diff < 7 * oneDayMs) {
      groups['7天内'].push(item)
    }
    else if (diff < 30 * oneDayMs) {
      groups['30天内'].push(item)
    }
    else {
      // 超过30天，按年月分组
      const date = new Date(item.createTime)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const groupKey = `${year}年${month}月`

      if (!olderGroups[groupKey]) {
        olderGroups[groupKey] = []
      }
      olderGroups[groupKey].push(item)
    }
  })

  // 转换结果
  const result: GroupedResult[] = [];

  // 添加固定分组
  (['今天', '7天内', '30天内'] as const).forEach((key) => {
    if (groups[key].length > 0) {
      result.push({ title: key, list: groups[key] })
    }
  })

  // 添加超过30天的分组，按时间倒序排列
  Object.keys(olderGroups)
    .sort((a, b) => {
      // 提取年月进行比较
      const [aYear, aMonth] = a.split('年')
      const [bYear, bMonth] = b.split('年')
      const aMonthNum = Number.parseInt(aMonth)
      const bMonthNum = Number.parseInt(bMonth)

      if (aYear !== bYear) {
        return Number.parseInt(bYear) - Number.parseInt(aYear)
      }
      return bMonthNum - aMonthNum
    })
    .forEach((key) => {
      result.push({ title: key, list: olderGroups[key] })
    })

  return result
}
