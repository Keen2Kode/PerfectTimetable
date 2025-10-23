import { useEffect, useRef } from 'react'
import Rellax from 'rellax'
import './BackgroundTexture.css'

const PARALLAX_SPEED = 3

export function BackgroundTexture() {
  const layerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = layerRef.current
    if (!element) {
      return
    }

    const instance = new Rellax(element, {
      speed: PARALLAX_SPEED,
      center: false,
      round: true,
      vertical: true,
      horizontal: false,
    })

    return () => {
      instance.destroy()
    }
  }, [])

  return <div ref={layerRef} className="background-texture" aria-hidden="true" />
}

export default BackgroundTexture
