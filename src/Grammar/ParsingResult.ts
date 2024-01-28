import { Sentence } from "./Sentence";

export interface ParsingResult {
    sentence: Sentence;
    history: string[];
}