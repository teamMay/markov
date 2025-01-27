import { TextProcessor } from "./textProcessor";
import { MarkovChain } from "./markovChain";
import { BEGIN } from "./constant";

const DEFAULT_MAX_OVERLAP_RATIO = 0.6;
const DEFAULT_MAX_OVERLAP_TOTAL = 500;
const DEFAULT_TRIES = 20;

type MarkovTextOptions = {
  stateSize?: number;
  text?: string;
  corpus?: string[];
  BEGIN?: string;
  DEFAULT_MAX_OVERLAP_RATIO?: number;
  DEFAULT_MAX_OVERLAP_TOTAL?: number;
  DEFAULT_TRIES?: number;
  END?: string;
};

type PredictOptions = {
  initState?: string[] | null;
  maxChars?: number;
  numberOfSentences?: number;
  popularFirstWord?: boolean;
  testOutput?: boolean;
};

type PredictOptionsWithInit = {
  initState?: string | null;
  maxChars?: number;
  numberOfSentences?: number;
  popularFirstWord?: boolean;
  testOutput?: boolean;
};

export class MarkovText {
  private stateSize: number;
  private text: string;
  private corpus: string[];
  private rejoinedText: string;
  private BEGIN: string;
  private DEFAULT_MAX_OVERLAP_RATIO: number;
  private DEFAULT_MAX_OVERLAP_TOTAL: number;
  private DEFAULT_TRIES: number;
  private thisMarkovChain: MarkovChain;

  constructor(options: MarkovTextOptions = {}) {
    this.stateSize = options.stateSize ?? 3;
    this.text = options.text ? TextProcessor.clean(options.text) : "";
    this.corpus = options.corpus ?? this.buildCorpus(this.text);
    this.rejoinedText = TextProcessor.clean(this.text);
    this.BEGIN = options.BEGIN ?? BEGIN;
    this.DEFAULT_MAX_OVERLAP_RATIO =
      options.DEFAULT_MAX_OVERLAP_RATIO ?? DEFAULT_MAX_OVERLAP_RATIO;
    this.DEFAULT_MAX_OVERLAP_TOTAL =
      options.DEFAULT_MAX_OVERLAP_TOTAL ?? DEFAULT_MAX_OVERLAP_TOTAL;
    this.DEFAULT_TRIES = options.DEFAULT_TRIES ?? DEFAULT_TRIES;

    const corpusMap = this.corpus.map((sentence) => sentence.split(" "));
    this.thisMarkovChain = new MarkovChain({
      corpus: corpusMap,
      stateSize: this.stateSize,
    });
  }

  private buildCorpus(text: string): string[] {
    return typeof text === "string" ? TextProcessor.getSentences(text) : [];
  }

  predict(options: PredictOptionsWithInit = {}): string[] {
    const _options = {
      ...options,
      initState: options.initState
        ? options.initState.split(" ").slice(-this.stateSize)
        : null,
      maxChars: options.maxChars ?? -1,
      numberOfSentences: options.numberOfSentences ?? 2,
    };

    return this.getPredictiveText(_options);
  }

  private getPredictiveText(options: PredictOptions): string[] {
    const tries = this.DEFAULT_TRIES;
    const allSentences: string[] = [];

    for (
      let sentenceCount = 0;
      sentenceCount < options.numberOfSentences!;
      sentenceCount++
    ) {
      for (let i = 0; i < tries; i++) {
        const sentence = this.makeSentence(options);
        if (sentence) {
          allSentences.push(sentence);
          break;
        }
      }
    }

    return allSentences;
  }

  private makeSentence(options: PredictOptions): string | null {
    const tries = this.DEFAULT_TRIES;
    const mor = this.DEFAULT_MAX_OVERLAP_RATIO;
    const mot = this.DEFAULT_MAX_OVERLAP_TOTAL;
    const testOutput = options.testOutput ?? true;

    for (let i = 0; i < tries; i++) {
      let prefix: string[] = [];
      let shouldReturnSentence = true;

      if (options.initState) {
        prefix =
          options.initState[0] === this.BEGIN
            ? options.initState.slice(1)
            : options.initState;
      } else if (options.popularFirstWord) {
        prefix = this.getPopularFirstWordPrefix();
        options.initState = prefix;
      }

      const words = prefix.concat(this.thisMarkovChain.walk(options.initState));

      if (
        options.maxChars !== undefined &&
        options.maxChars > -1 &&
        words.join(" ").length > options.maxChars
      ) {
        shouldReturnSentence = false;
      }

      if (testOutput && !this.testSentence(words, mor, mot)) {
        shouldReturnSentence = false;
      }

      if (shouldReturnSentence) {
        return words.join(" ");
      }
    }

    return null;
  }

  private getPopularFirstWordPrefix(): string[] {
    const beginState = Array(this.stateSize).fill(this.BEGIN).join("");
    const beginStateArr = Array(this.stateSize).fill(this.BEGIN);
    const thisMarkovModel = this.thisMarkovChain.getMarkovianModel(beginState);

    let count = 0;
    let beginWord = "";

    for (const [key, value] of Object.entries(thisMarkovModel)) {
      if (value > count) {
        count = value;
        beginWord = key;
      }
    }

    beginStateArr[beginStateArr.length - 1] = beginWord;
    return beginStateArr;
  }

  private testSentence(
    words: string[],
    maxOverlapRatio: number,
    maxOverlapTotal: number
  ): boolean {
    if (words.length === 0) {
      return true; // No words to test, consider valid
    }

    const trimmedWords = words.slice(0, -1);
    const overlap_ratio = Math.ceil(maxOverlapRatio * trimmedWords.length);
    const overlap_max = Math.min(maxOverlapTotal, overlap_ratio);
    const overlap_over = overlap_max + 1;
    const gram_count = Math.max(trimmedWords.length - overlap_max, 1);

    for (let i = 0; i < gram_count; i++) {
      const gram = trimmedWords.slice(i, i + overlap_over).join(" ");
      if (this.rejoinedText.includes(gram)) {
        return false; // Overlap detected, reject the sentence
      }
    }

    return true;
  }
}
