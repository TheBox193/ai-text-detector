function expandPunctuationVariants(terms: string[]): string[] {
  return Array.from(
    new Set(
      terms.flatMap((t) => [
        t,
        t.replace(/’/g, "'"),
        t.replace(/'/g, "’"),
        t.replace(/…/g, "..."),
        t.replace(/\.{3}/g, "…")
      ])
    )
  )
}

export default expandPunctuationVariants
