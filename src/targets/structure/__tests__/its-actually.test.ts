import { describe, expect, test } from "vitest"

import its_actually from "../its-actually"

describe('its_actually', () => {
    test.each(its_actually.examples)(`"%s"`, (sentence) => {
        const regex = new RegExp(its_actually.regex)
        const result = regex.test(sentence)
        expect(result).toBe(true)
    })
})
