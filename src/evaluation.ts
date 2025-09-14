import { Answer, QuestionData, Result } from "./types";
import basex from "base-x";
const alphabet = basex("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");

export function runEvaluation(answers: Map<String, Answer>, stage: 1 | 2): Result {
    const arr = Array.from(answers.entries());
    const filterForResult = (stage: string, target: Result) =>
        arr.filter(([k, v]) => k.startsWith(stage) && v.outcome?.result == target);
    const s = `stage${stage}-`;
    const no = filterForResult(s, Result.NO);
    const maybe = filterForResult(s, Result.MAYBE);
    const yes = filterForResult(s, Result.YES);
    if (no.length > 0) {
        return Result.NO;
    }

    if (maybe.length > 0) {
        return Result.MAYBE;
    }

    if (yes.length > 0) {
        return Result.YES;
    }

    return Result.MAYBE;
}

export function countAnswers(answers: Map<string, Answer>, stage: 1 | 2) {
    return Array.from(answers.keys()).filter((k) => k.startsWith(`stage${stage}-`)).length;
}

export function getNotices(answers: Map<string, Answer>, stage: 1 | 2, results: Result[]) {
    const notices = [];
    for (const [k, v] of answers) {
        if (!k.startsWith(`stage${stage}-`)) {
            continue;
        }

        if (!v.outcome || results.indexOf(v.outcome.result) < 0) {
            continue;
        }

        notices.push(...v.outcome.notices);
    }
    return notices;
}

export const maybeRelatives = (answers: Map<string, Answer>) =>
    runEvaluation(answers, 1) == Result.YES ? "_COMPLETE" : "stage2-relatives";

function getIndex(questions: QuestionData[], questionId: string, answer: Answer) {
    const questionIndex = questions.findIndex((q) => q.id == questionId);
    return {
        qi: questionIndex,
        ai: questions[questionIndex].answers.findIndex((a) => a.code == answer.code),
    };
}

export function encodeAnswers(questions: QuestionData[], answers: Map<string, Answer>): string {
    const result = [];
    for (const [k, v] of answers) {
        const { qi, ai } = getIndex(questions, k, v);
        result.push((qi << 3) + ai);
    }
    return alphabet.encode(result);
}

export function decodeAnswers(questions: QuestionData[], encoded: string): Map<string, Answer> {
    const result = new Map<string, Answer>();
    const indices = alphabet.decode(encoded);
    for (const code of indices) {
        const qi = code >> 3;
        const ai = code - (qi << 3);
        const q = questions[qi];
        result.set(q.id, q.answers[ai]);
    }
    return result;
}
