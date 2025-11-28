import { useState, useEffect } from 'react'

/**
 * 防抖Hook
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 防抖回调Hook
 * @param callback 回调函数
 * @param delay 延迟时间（毫秒）
 * @param deps 依赖数组
 * @returns 防抖后的回调函数
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(callback)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [callback, delay, ...deps])

  return debouncedCallback
}

/**
 * 防抖异步Hook
 * @param asyncCallback 异步回调函数
 * @param delay 延迟时间（毫秒）
 * @returns 包含执行函数、加载状态和错误的对象
 */
export function useDebouncedAsync<T extends (...args: any[]) => Promise<any>>(
  asyncCallback: T,
  delay: number
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const debouncedExecute = useDebouncedCallback(
    async (...args: Parameters<T>) => {
      try {
        setLoading(true)
        setError(null)
        await asyncCallback(...args)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    delay,
    [asyncCallback]
  ) as T

  return {
    execute: debouncedExecute,
    loading,
    error,
    clearError: () => setError(null)
  }
}