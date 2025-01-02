import { QuestionData } from "./types";

const questions: QuestionData[] = [
    {
        id: "location",
        heading: "Место проживания",
        question: "Где вы постоянно проживали 24 февраля 2022 года?",
        answers: [
            {
                code: "LOCATION_UA",
                long: "В Украине (включая любые оккупированные территории)",
                short: "Украина",
                nextQuestion: "citizenship",
                weight: { YES: 100, NO: 0, MAYBE: 0 },
            },
            {
                code: "LOCATION_DE",
                long: "В Германии",
                short: "Германия",
                nextQuestion: "germanPermit",
                weight: { YES: 100, NO: 0, MAYBE: 0 },
            },
            {
                code: "LOCATION_OTHER",
                long: "В другой стране",
                short: "Другая страна",
                nextQuestion: "citizenship",
                weight: { YES: 0, NO: 1000, MAYBE: 0 },
            },
        ],
    },
    {
        id: "citizenship",
        heading: "Гражданство",
        question: "Укажите свое гражданство или право пребывания в Украине",
        answers: [
            {
                code: "CITIZENSHIP_UA",
                long: "Только Украина",
                short: "Украина",
                nextQuestion: "secondLocation",
                weight: { YES: 100, NO: 0, MAYBE: 0 },
            },
            {
                code: "CITIZENSHIP_UA_DUAL_EU",
                long: "Украина + страна ЕС",
                short: "Украина + страна ЕС",
                nextQuestion: "secondLocation",
                weight: { YES: 0, NO: 2000, MAYBE: 0 },
            },
            {
                code: "CITIZENSHIP_UA_DUAL_3C",
                long: "Украина + страна вне ЕС",
                short: "Украина + страна вне ЕС",
                nextQuestion: "secondLocation",
                weight: { YES: 0, NO: 0, MAYBE: 1000 },
            },
            {
                code: "CITIZENSHIP_EU",
                long: "Страна ЕС",
                short: "Страна ЕС",
                nextQuestion: "secondLocation",
                weight: { YES: 0, NO: 2000, MAYBE: 0 },
            },
            {
                code: "CITIZENSHIP_3C_TEMP",
                long: "Страна вне ЕС и ВНЖ Украины",
                short: "Страна вне ЕС и ВНЖ Украины",
                nextQuestion: "secondLocation",
                weight: { YES: 0, NO: 100, MAYBE: 0 },
            },
            {
                code: "CITIZENSHIP_3C_PERM",
                long: "Страна вне ЕС и ПМЖ Украины",
                short: "Страна вне ЕС и ПМЖ Украины",
                nextQuestion: "secondLocation",
                weight: { YES: 100, NO: 0, MAYBE: 0 },
            },
            {
                code: "CITIZENSHIP_3C",
                long: "Страна вне ЕС (нет ПМЖ или ВНЖ Украины)",
                short: "Страна вне ЕС",
                weight: { YES: 0, NO: 100, MAYBE: 0 },
                nextQuestion: "secondLocation",
            },
        ],
    },
    {
        id: "germanPermit",
        heading: "ВНЖ в Германии",
        question:
            "Есть ли у вас Aufenthaltstitel, выданный до 24.02.2022, и можете ли вы его продлить?",
        answers: [
            {
                code: "GERMAN_PERMIT_NO",
                long: "Нет",
                short: "Нет",
                nextQuestion: "citizenship",
                weight: { YES: 0, NO: 2000, MAYBE: 0 },
            },
            {
                code: "GERMAN_PERMIT_YES_IMPOSSIBLE",
                long: "Есть, не могу продлить",
                short: "Да, продление невозможно",
                nextQuestion: "citizenship",
                weight: { YES: 100, NO: 0, MAYBE: 0 },
            },
            {
                code: "GERMAN_PERMIT_YES_POSSIBLE",
                long: "Есть, могу продлить",
                short: "Да, продление возможно",
                nextQuestion: "citizenship",
                weight: { YES: 0, NO: 2000, MAYBE: 0 },
            },
        ],
    },
    {
        id: "secondLocation",
        heading: "Страны вне ЕС",
        question: "Проживали ли вы после 24 февраля 2022 в любых странах кроме Украины и ЕС?",
        answers: [
            {
                code: "LOCATION2_EU_UA",
                short: "Нет",
                long: "Нет, только в Украине и странах ЕС",
                nextQuestion: "_COMPLETE",
                weight: { YES: 100, NO: 0, MAYBE: 0 },
            },
            {
                code: "LOCATION2_3С",
                short: "Да",
                long: "Да, проживал в стране вне ЕС",
                nextQuestion: "_COMPLETE",
                weight: { YES: 0, NO: 2000, MAYBE: 0 },
            },
        ],
    },
];

export const questionIndex = Object.fromEntries(questions.map((q) => [q.id, q]));
