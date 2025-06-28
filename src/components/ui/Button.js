"use client"

const buttonVariants = {
  default: "glass-button",
  ghost: "glass-button-ghost",
  outline: "border border-white/30 bg-white/10 hover:bg-white/20 text-white",
}

const buttonSizes = {
  default: "h-12 px-6 py-3 text-sm",
  sm: "h-10 px-4 py-2 text-sm",
  lg: "h-14 px-8 py-4 text-base",
}

export function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
  const variantClasses = buttonVariants[variant] || buttonVariants.default
  const sizeClasses = buttonSizes[size] || buttonSizes.default

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
