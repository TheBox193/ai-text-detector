// test file
import { describe, expect, test } from "vitest"
import * as patterns from "../index"

Object.values(patterns).forEach((pattern) => {
  describe(pattern.name, () => {
    test.each(pattern.examples)(`"%s"`, (sentence) => {
      const regex = new RegExp(pattern.regex)
      const result = regex.test(sentence)
      expect(result).toBe(true)
    })
  })
})