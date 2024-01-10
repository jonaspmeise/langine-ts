import { Logger } from "./Logger";
import chalk from "chalk";

export class DefaultLogger implements Logger {
    public error = (message: string): void => {
        console.log(`${chalk.red('[ERROR]')} ${message}`);
    };
    
    public warn = (message: string): void => {
        console.log(`${chalk.yellow('[WARNING]')} ${message}`);
    };
    
    public info = (message: string): void => {
        console.log(`${chalk.blue('[INFO]')} ${message}`);
    };
    
    public debug = (message: string): void => {
        console.log(`${chalk.gray('[DEBUG]')} ${message}`);
    };
}