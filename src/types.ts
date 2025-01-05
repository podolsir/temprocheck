export enum Result {
    YES = "YES",
    NO = "NO",
    MAYBE = "MAYBE",
}

export interface Outcome {
    result: Result;
    notices: string[];
}

export interface Answer {
    readonly code: string;
    readonly long: string;
    readonly short: string;
    readonly nextQuestion: (answers: Map<string, Answer>) => string;
    readonly weight: Weight;
    readonly outcome?: Outcome;
}

export interface Weight {
    YES: number;
    NO: number;
    MAYBE: number;
}

export interface QuestionData {
    readonly id: string;
    readonly heading: string;
    readonly question: string;
    readonly answers: Answer[];
}
