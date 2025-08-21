import { describe, expect, test } from "vitest"

import on_the_one_hand from "../on_the_one_hand"

describe('on_the_one_hand', () => {
    test.each(on_the_one_hand.examples)(`"%s"`, (sentence) => {
        const regex = new RegExp(on_the_one_hand.regex)
        const result = regex.test(sentence)
        expect(result).toBe(true)
    })
})
