function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-500",
    secondary:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    ghost:
      "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;