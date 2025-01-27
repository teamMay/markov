import { TextProcessor } from "../lib/textProcessor";

describe("TextProcessor", () => {
  describe("clean", () => {
    it("should replace newlines with spaces", () => {
      const input = "Hello\nWorld";
      const expectedOutput = "Hello World";
      expect(TextProcessor.clean(input)).toBe(expectedOutput);
    });

    it("should handle text without newlines", () => {
      const input = "Hello World";
      const expectedOutput = "Hello World";
      expect(TextProcessor.clean(input)).toBe(expectedOutput);
    });
  });

  describe("getSentences", () => {
    it("should split text into sentences", () => {
      const input = "Hello! How are you? I'm fine. Let's meet tomorrow.";
      const expectedOutput = [
        "Hello!",
        "How are you?",
        "I'm fine.",
        "Let's meet tomorrow.",
      ];
      expect(TextProcessor.getSentences(input)).toEqual(expectedOutput);
    });

    it("should handle text with abbreviations correctly", () => {
      const input = "Dr Smith is here. Let's meet at 3 p.m. Is that okay?";
      const expectedOutput = [
        "Dr Smith is here.",
        "Let's meet at 3 p.m.",
        "Is that okay?",
      ];
      expect(TextProcessor.getSentences(input)).toEqual(expectedOutput);
    });

    it("should handle text without punctuation", () => {
      const input = "Hello World";
      const expectedOutput = ["Hello World"];
      expect(TextProcessor.getSentences(input)).toEqual(expectedOutput);
    });

    it("should handle empty text", () => {
      const input = "";
      const expectedOutput: string[] = [];
      expect(TextProcessor.getSentences(input)).toEqual(expectedOutput);
    });

    it("should handle complex sentence structures", () => {
      const input = `Hello! This is an example: dr Smith's report said, "It's fine.". What do you think?`;
      const expectedOutput = [
        "Hello!",
        `This is an example: dr Smith's report said, "It's fine.".`,
        "What do you think?",
      ];
      expect(TextProcessor.getSentences(input)).toEqual(expectedOutput);
    });
  });
});
