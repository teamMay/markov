import { MarkovText } from "../lib/markovText";
import * as fs from "fs";
import path from "path";

const stateSize = 2;
const initState = "Bonjour je suis";

fs.readFile(path.join(__dirname, "data/answers.txt"), (err, text) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const thisMarkovText = new MarkovText({
    corpus: text.toString().split("\n"),
    stateSize,
  });

  const predictions = thisMarkovText.predict({
    initState,
    maxChars: 700,
    numberOfSentences: 3,
    popularFirstWord: false,
  });

  const initList = initState.split(" ");
  const stem = initList.slice(0, initList.length - stateSize).join(" ");

  console.log(predictions.map((p) => `${stem} ${p}`));
});
