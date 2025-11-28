import { useState, useEffect, useMemo, useRef } from 'react'

interface VirtualListOptions {
  containerHeight: number
  itemHeight: number
  overscan?: number
  scrollElement?: HTMLElement | Window
}

interface VirtualListResult<T> {
  visibleItems: Array<{
    item: T
    index: number
    style: React.CSSProperties
  }>
  totalHeight: number
  scrollToIndex: (index: number) => void
  containerProps: {
    ref: React.RefObject<HTMLDivElement>
    style: React.CSSProperties
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  }
}

/**
 * 虚拟列表Hook
 * @param items 列表数据
 * @param options 配置选项
 * @returns 虚拟列表相关数据和方法
 */
export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
): VirtualListResult<T> {
  const { containerHeight, itemHeight, overscan = 5 } = options
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算可见区域的项目
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const visibleItems: Array<{
      item: T
      index: number
      style: React.CSSProperties
    }> = []
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          height: itemHeight,
          width: '100%'
        }
      })
    }

    return visibleItems
  }, [items, scrollTop, itemHeight, containerHeight, overscan])

  // 总高度
  const totalHeight = items.length * itemHeight

  // 滚动到指定索引
  const scrollToIndex = (index: number) => {
    if (containerRef.current) {
      const targetScrollTop = index * itemHeight
      containerRef.current.scrollTop = targetScrollTop
      setScrollTop(targetScrollTop)
    }
  }

  // 处理滚动事件
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
  }

  // 容器属性
  const containerProps: {
    ref: React.RefObject<HTMLDivElement>
    style: React.CSSProperties
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  } = {
    ref: containerRef,
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const
    },
    onScroll: handleScroll
  }

  return {
    visibleItems,
    totalHeight,
    scrollToIndex,
    containerProps
  }
}

/**
 * 动态高度虚拟列表Hook
 */
export function useDynamicVirtualList<T>(
  items: T[],
  getItemHeight: (index: number, item: T) => number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [itemHeights, setItemHeights] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算项目高度缓存
  useEffect(() => {
    const heights = items.map((item, index) => 
      itemHeights[index] || getItemHeight(index, item)
    )
    setItemHeights(heights)
  }, [items, getItemHeight])

  // 计算项目位置和总高度
  const { itemPositions, totalHeight } = useMemo(() => {
    const positions: number[] = [0]
    let totalHeight = 0

    for (let i = 0; i < itemHeights.length; i++) {
      totalHeight += itemHeights[i]
      positions.push(totalHeight)
    }

    return {
      itemPositions: positions,
      totalHeight
    }
  }, [itemHeights])

  // 计算可见区域的项目
  const visibleItems = useMemo(() => {
    const startIndex = itemPositions.findIndex(
      (position, index) => 
        position <= scrollTop + containerHeight && 
        (index === itemPositions.length - 1 || itemPositions[index + 1] > scrollTop)
    )

    const actualStartIndex = Math.max(0, startIndex - overscan)
    const endIndex = Math.min(
      items.length - 1,
      startIndex + overscan * 2
    )

    const items_ = []
    for (let i = actualStartIndex; i <= endIndex; i++) {
      items_.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute',
          top: itemPositions[i],
          height: itemHeights[i],
          width: '100%'
        }
      })
    }

    return items_
  }, [items, scrollTop, itemPositions, itemHeights, containerHeight, overscan])

  // 滚动到指定索引
  const scrollToIndex = (index: number) => {
    if (containerRef.current && index >= 0 && index < items.length) {
      const targetScrollTop = itemPositions[index]
      containerRef.current.scrollTop = targetScrollTop
      setScrollTop(targetScrollTop)
    }
  }

  // 处理滚动事件
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  // 容器属性
  const containerProps: {
    ref: React.RefObject<HTMLDivElement>
    style: React.CSSProperties
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  } = {
    ref: containerRef,
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const
    },
    onScroll: handleScroll
  }

  return {
    visibleItems,
    totalHeight,
    scrollToIndex,
    containerProps
  }
}