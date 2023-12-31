import { RulebookLoader } from "./RulebookLoader";
import * as fs from 'fs';

export class RulebookLoaderFactory {
    public static ofFile = (filepath: string): RulebookLoader => {
        return new RulebookLoader(fs.readFileSync(filepath, 'utf8'));
    };

    public static ofText = (text: string): RulebookLoader => {
        return new RulebookLoader(text);
    };
}