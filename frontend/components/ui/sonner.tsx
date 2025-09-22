import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      duration={4000}
      gap={12}
      toastOptions={{
        style: {
          padding: '16px',
          fontSize: '14px',
          minHeight: '60px',
          maxWidth: '420px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:mt-1 group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5",
          success: "group-[.toast]:border-green-500/20 group-[.toast]:bg-green-50/80 dark:group-[.toast]:bg-green-950/80",
          error: "group-[.toast]:border-red-500/20 group-[.toast]:bg-red-50/80 dark:group-[.toast]:bg-red-950/80",
          warning: "group-[.toast]:border-yellow-500/20 group-[.toast]:bg-yellow-50/80 dark:group-[.toast]:bg-yellow-950/80",
          info: "group-[.toast]:border-blue-500/20 group-[.toast]:bg-blue-50/80 dark:group-[.toast]:bg-blue-950/80",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }