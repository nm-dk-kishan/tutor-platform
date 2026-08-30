function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}) {
  const alignment =
    align === "left"
      ? "items-start text-left"
      : "items-center text-center";

  return (
    <div className={`mx-auto flex max-w-3xl flex-col ${alignment}`}>
      {eyebrow && (
        <span className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          {eyebrow}
        </span>
      )}

      <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;