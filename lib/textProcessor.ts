export class TextProcessor {
  /** The regex matches sequences of characters ending with punctuation (. ? !),
   * followed by whitespace that is not immediately followed by a lowercase letter or a hyphen/dash.
  It is used to identify sentence boundaries while avoiding false positives for abbreviations, ellipses, or constructs like "e.g."
  */
  private static punctuationRegex =
    /([\w\.'"’&\]\)]+[\.\?!])(\s+(?![a-z\-–—])|$)/g;

  /**
   * Extract sentences from the input text based on punctuation and spacing rules.
   * @param text The input text to be processed.
   * @returns An array of sentences.
   */
  public static getSentences(text: string): string[] {
    let currIndex = 0;
    const allSentences: string[] = [];

    let result: RegExpExecArray | null;
    while ((result = this.punctuationRegex.exec(text)) !== null) {
      const endIndex = result.index + result[0].length;
      const subString = text.substring(currIndex, endIndex);
      currIndex = endIndex;
      allSentences.push(subString.trim());
    }

    // Add any remaining text as the last sentence
    if (currIndex < text.length) {
      allSentences.push(text.substring(currIndex).trim());
    }

    return allSentences;
  }

  /**
   * Cleans the input text by replacing line breaks with spaces.
   * @param text The input text to be cleaned.
   * @returns The cleaned text.
   */
  public static clean(text: string): string {
    return text.replace(/\n/g, " ");
  }
}
