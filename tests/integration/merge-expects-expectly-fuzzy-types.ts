import { expectlyFuzzy } from "@cerios/playwright-expectly-fuzzy";
import { expect as baseExpect, mergeExpects } from "@playwright/test";

const expect = mergeExpects(baseExpect, expectlyFuzzy);

expect([1, 2, 3]).toHaveLength(3);
expect("Hello Wrold").toMatchFuzzy("Hello World");

export {};
