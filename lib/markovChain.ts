import { BEGIN, END } from "./constant";

type MarkovChainOptions = {
  stateSize?: number;
  corpus?: string[][];
};

type MarkovModel = Record<string, Record<string, number>>;

export class MarkovChain {
  private config: { stateSize: number };
  private markovianModel: MarkovModel = {};
  private beginChoices: string[] = [];
  private beginCumdist: number[] = [];

  constructor(options: MarkovChainOptions = {}) {
    this.config = {
      stateSize: options.stateSize ?? 2,
    };
    const corpus = options.corpus ?? [[""]];
    this.markovianModel = this.build(corpus, this.config.stateSize);
    this.calculateBeginStates();
  }

  private build(corpus: string[][], stateSize: number): MarkovModel {
    const model: MarkovModel = {};

    for (const run of corpus) {
      const items = Array(stateSize).fill(BEGIN).concat(run, [END]);

      for (let k = 0; k < run.length; k++) {
        const state = items.slice(k, k + stateSize).join("");
        const follow = items[k + stateSize] ?? END;

        if (!model[state]) model[state] = {};
        if (!model[state][follow]) model[state][follow] = 0;
        model[state][follow]++;
      }
    }

    return model;
  }

  private calculateBeginStates(): void {
    const beginState = Array(this.config.stateSize).fill(BEGIN).join("");
    const beginningChoices = this.markovianModel[beginState] || {};

    this.beginChoices = Object.keys(beginningChoices);
    this.beginCumdist = this.accumulateWeights(Object.values(beginningChoices));
  }

  private accumulateWeights(weights: number[]): number[] {
    const cumulativeWeights: number[] = [];

    for (let i = 0; i < weights.length; i++) {
      cumulativeWeights[i] = (cumulativeWeights[i - 1] || 0) + weights[i];
    }

    return cumulativeWeights;
  }

  private bisect(value: number, array: number[]): number {
    let idx = 0;
    for (; idx < array.length; idx++) {
      if (value < array[idx]) break;
    }
    return idx;
  }

  private move(state: string[]): string {
    const stateKey =
      state.join("") || Array(this.config.stateSize).fill(BEGIN).join("");

    const choices =
      stateKey === BEGIN
        ? this.beginChoices
        : Object.keys(this.markovianModel[stateKey] || {});

    const weights =
      stateKey === BEGIN
        ? this.beginCumdist
        : this.accumulateWeights(
            Object.values(this.markovianModel[stateKey] || {})
          );

    const randomValue = Math.floor(
      Math.random() * (weights[weights.length - 1] + 1)
    );
    const choiceIndex = this.bisect(randomValue, weights);

    return choices[choiceIndex] || END;
  }

  public generate(initState?: string[] | null): string[] {
    let state = initState || Array(this.config.stateSize).fill(BEGIN);
    const output: string[] = [];

    while (true) {
      const nextWord = this.move(state);
      if (nextWord === END || !nextWord) break;

      output.push(nextWord);
      state = state.slice(1).concat(nextWord);
    }

    return output;
  }

  public walk(initState?: string[] | null): string[] {
    return this.generate(initState);
  }

  public getMarkovianModel(beginState: string) {
    return this.markovianModel[beginState];
  }
}
