'use client'
import { useEffect } from 'react'

export function RevealAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).animate(
              [
                { opacity: '0', transform: 'translateY(40px)' },
                { opacity: '1', transform: 'translateY(0)' },
              ],
              { duration: 700, easing: 'ease-out', fill: 'forwards' }
            )
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}
