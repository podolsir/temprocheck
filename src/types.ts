export enum Result {
    YES   = "YES",
    NO    = "NO",
    MAYBE = "MAYBE",
}

export interface Answer {
    readonly code: string;
    readonly long: string;
    readonly short: string;
    readonly nextQuestion: string;
    readonly weight: Weight;
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