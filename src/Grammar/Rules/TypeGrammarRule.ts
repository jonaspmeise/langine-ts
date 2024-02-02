import { Sentence } from "../../Sentence/Sentence";
import { TypeSentence } from "../../Sentence/TypeSentence";
import { GrammarRule } from "./GrammarRule";

export class TypeGrammarRule<S extends Sentence> extends GrammarRule<S, TypeSentence> {

}