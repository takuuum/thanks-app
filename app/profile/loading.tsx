import { User } from 'lucide-react'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <User className="h-16 w-16 text-primary/20" />
          </div>
          <User className="h-16 w-16 text-primary animate-pulse" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">読み込み中</h2>
          <p className="text-sm text-muted-foreground">プロフィールを取得しています...</p>
        </div>

        <div className="flex gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  )
}
