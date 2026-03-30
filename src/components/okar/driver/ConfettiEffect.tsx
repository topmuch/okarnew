/**
 * OKAR - Confetti Effect Component
 * Animation de confettis pour la validation
 */

'use client'

interface ConfettiEffectProps {
  show: boolean
}

export function ConfettiEffect({ show }: ConfettiEffectProps) {
  if (!show) return null

  const confettiColors = ['#f97316', '#ec4899', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6']
  const confettiCount = 60

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(confettiCount)].map((_, i) => {
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)]
        const left = Math.random() * 100
        const delay = Math.random() * 0.5
        const size = Math.random() * 8 + 6
        const isCircle = Math.random() > 0.5
        
        return (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${left}%`,
              top: '-20px',
              width: `${size}px`,
              height: isCircle ? `${size}px` : `${size * 0.6}px`,
              backgroundColor: color,
              borderRadius: isCircle ? '50%' : '2px',
              animationDelay: `${delay}s`,
              animationDuration: `${2 + Math.random() * 1}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        )
      })}
      
      {/* Styles pour l'animation */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
