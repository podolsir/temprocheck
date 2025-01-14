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
    const arr = Array.from(answers.entries());
    const notices = [];
    for (const [k, v] of arr) {
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

const maybeRelatives = (answers: Map<string, Answer>) =>
    runEvaluation(answers, 1) == Result.YES ? "_COMPLETE" : "stage2-relatives";

function getIndex(questionId: string, answer: Answer) {
    const questionIndex = questions.findIndex((q) => q.id == questionId);
    return {
        qi: questionIndex,
        ai: questions[questionIndex].answers.findIndex((a) => a.code == answer.code), 
    }
}

export function encodeAnswers(answers: Map<string, Answer>) : string {
    const arr = Array.from(answers.entries());
    const result = [];
    for (const [k, v] of arr) {
        const {qi, ai} = getIndex(k, v);
        result.push(qi << 3 + ai);
    }
    return alphabet.encode(result);
}

export function decodeAnswers(encoded: string) : Map<string, Answer> {
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

const questions: QuestionData[] = [
    {
        id: "stage1-location",
        heading: "Местонахождение на 24.02.2022",
        question: "Где вы находились 24 февраля 2022 года?",
        answers: [
            {
                code: "LOCATION_UA",
                long: "В Украине (включая любые оккупированные территории)",
                short: "Украина",
                outcome: {
                    result: Result.YES,
                    notices: [
                        "Миграционная служба может потребовать документальные доказательства вашего пребывания в Украине по состоянию на 24.02.2022.",
                    ],
                },
                nextQuestion: () => "stage1-citizenship",
            },
            {
                code: "LOCATION_DE",
                long: "В Германии",
                short: "Германия",
                nextQuestion: () => "stage1-germanPermit",
            },
            {
                code: "LOCATION_OTHER",
                long: "В другой стране",
                short: "Другая страна",
                nextQuestion: () => "stage1-otherCountryTerm",
            },
        ],
    },
    {
        id: "stage1-germanPermit",
        heading: "ВНЖ в Германии",
        question:
            "Есть ли у вас Aufenthaltstitel, выданный до 24.02.2022, и можете ли вы его продлить?",
        answers: [
            {
                code: "GERMAN_PERMIT_NO",
                long: "Нет",
                short: "Нет",
                nextQuestion: () => "stage1-citizenship",
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Германия дает временную защиту только тем, кто на 24.02.2022 проживал на территории Германии " +
                            "по действительному немецкому разрешению на пребывание (Aufenthaltstitel).",
                    ],
                },
            },
            {
                code: "GERMAN_PERMIT_YES_IMPOSSIBLE",
                long: "Есть, не могу продлить",
                short: "Да, продление невозможно",
                nextQuestion: () => "stage1-citizenship",
                outcome: {
                    result: Result.MAYBE,
                    notices: [
                        "Европейское законодательство не обязывает Германию предоставлять временную защиту тем, кто находился 24.02.2022 а Германии. " +
                            "В начале вторжения федеральное министерство внутренних дел добровольно объявило о том, " +
                            "что будет давать право на временную защиту в таких случаях. " +
                            "На практике исход такого дела предсказать невозможно, так как таких случаев очень мало " +
                            "и в Германии есть тенденция постепенно отменять все причины для выдачи временной защиты, выходящие за рамки европейского законодательства.",
                    ],
                },
            },
            {
                code: "GERMAN_PERMIT_YES_POSSIBLE",
                long: "Есть, могу продлить",
                short: "Да, продление возможно",
                nextQuestion: maybeRelatives,
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Германия дает временную защиту только тем, кто на 24.02.2022 проживал на территории Германии " +
                            "по действительному немецкому разрешению на пребывание (Aufenthaltstitel), которое обладатель не может продлить. ",
                    ],
                },
            },
        ],
    },
    {
        id: "stage1-otherCountryTerm",
        heading: "Время выезда из Украины",
        question: "Когда вы последний раз выехали из Украины до начала вторжения?",
        answers: [
            {
                code: "TERM_LESS_90",
                long: "Между 22.11.2021 и 24.02.2022",
                short: "После 22.11.2021",
                nextQuestion: () => "stage1-otherCountryReason",
            },
            {
                code: "TERM_MORE_90",
                long: "До 22.11.2021",
                short: "До 22.11.2021",
                nextQuestion: () => "stage1-citizenship",
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Выезд больше чем за 90 дней считается выездом на постоянной основе, что противоречит требованию о постоянном проживании в Украине на 24.02.2022.",
                    ],
                },
            },
        ],
    },
    {
        id: "stage1-otherCountryReason",
        heading: "Основания для выезда",
        question: "По каким документам вы выехали в другую страну до 24.02.2022?",
        answers: [
            {
                code: "REASON_TOURISM",
                long: "Туристическая или другая краткосрочная виза",
                short: "Турвиза",
                nextQuestion: () => "stage1-citizenship",
                outcome: {
                    result: Result.YES,
                    notices: [
                        "Миграционная служба может не признать определенные виды виз и ВНЖ в других странах как краткосрочные и отказать во временной защите. " +
                            "Отказы можно опротестовывать, аргументируя конкретными обстоятельствами в каждом отдельном случае.",
                    ],
                },
            },
            {
                code: "REASON_WORK",
                long: "Рабочая виза или ВНЖ",
                short: "Рабочая виза",
                nextQuestion: () => "stage1-citizenship",
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Выезд по рабочей визе считается выездом на постоянной основе, что противоречит требованию о постоянном проживании в Украине на 24.02.2022.",
                    ],
                },
            },
            {
                code: "REASON_STUDY",
                long: "Студенческая или другая учебная виза",
                short: "Учебная виза",
                nextQuestion: () => "stage1-citizenship",
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Выезд по студенческой визе считается выездом на постоянной основе, что противоречит требованию к постоянному проживанию в Украине на 24.02.2022.",
                    ],
                },
            },
            {
                code: "REASON_OTHER",
                long: "Другие документы",
                short: "Другое",
                nextQuestion: () => "stage1-citizenship",
                outcome: {
                    result: Result.MAYBE,
                    notices: [
                        "Миграционная служба будет требовать документальные доказательства, что вы выехали из Украины временно, и что ваш выезд не противоречит требованию о постоянном проживании в Украине.",
                    ],
                },
            },
        ],
    },
    {
        id: "stage1-citizenship",
        heading: "Гражданство",
        question: "Какое у вас гражданство?",
        answers: [
            {
                code: "CITIZENSHIP_UA",
                long: "Только Украины",
                short: "Украина",
                nextQuestion: () => "stage1-secondLocation",
                outcome: {
                    result: Result.YES,
                    notices: [],
                },
            },
            {
                code: "CITIZENSHIP_DUAL",
                long: "Украины и другой страны",
                short: "Двойное",
                nextQuestion: () => "stage1-dualCitizenship",
            },
            {
                code: "CITIZENSHIP_OTHER",
                long: "Только других стран",
                short: "Другое",
                nextQuestion: () => "stage1-otherCitizenship",
            },
        ],
    },
    {
        id: "stage1-dualCitizenship",
        heading: "Второе гражданство",
        question: "Какое у вас гражданство, кроме гражданства Украины?",
        answers: [
            {
                code: "CITIZENSHIP_UA_DUAL_EU",
                long: "Страна ЕС",
                short: "Страна ЕС",
                nextQuestion: () => "_COMPLETE",
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Граждане ЕС не имеют права на временную защиту, так как у граждан ЕС есть бессрочное право пребывания в Германии.",
                    ],
                },
            },
            {
                code: "CITIZENSHIP_UA_DUAL_3С",
                long: "Страна вне ЕС",
                short: "Страна вне ЕС",
                nextQuestion: () => "stage1-secondLocation",
                outcome: {
                    result: Result.MAYBE,
                    notices: [
                        "Ситуация по выдаче временной защиты обладателям гражданства Украины и третьих стран непредсказуема, так как недостаточно проверенной информации или официальных источников. " +
                            "Вы должны быть готовы к отказу на основании того, что у вас есть гражданство третьей страны в дополнение к украинскому. " +
                            "Исключением является гражданство РФ, полученное жителями временно оккупированных территорий. Такое гражданство в Германии не считается действительным.",
                    ],
                },
            },
        ],
    },
    {
        id: "stage1-otherCitizenship",
        heading: "Страна гражданства",
        question: "К какой категории относится страна вашего гражданства?",
        answers: [
            {
                code: "CITIZENSHIP_EU",
                long: "Страна ЕС",
                short: "Страна ЕС",
                nextQuestion: () => "_COMPLETE",
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Граждане ЕС не имеют права на временную защиту, так как у граждан ЕС есть бессрочное право пребывания в Германии.",
                    ],
                },
            },
            {
                code: "CITIZENSHIP_3С",
                long: "Страна вне ЕС",
                short: "Страна вне ЕС",
                nextQuestion: () => "stage1-ukrainePermit",
            },
        ],
    },
    {
        id: "stage1-ukrainePermit",
        heading: "ВНЖ Украины",
        question: "На основании каких документов вы жили в Украине?",
        answers: [
            {
                code: "UKRAINEPERMIT_TEMP",
                long: "Временный ВНЖ в Украине",
                short: "Временный ВНЖ в Украине",
                nextQuestion: () => "stage1-secondLocation",
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Самое позднее с середины 2024 года в Германии не предоставляют временную защиту гражданам третьих стран, не имеющим ПМЖ в Украине.",
                    ],
                },
            },
            {
                code: "UKRAINEPERMIT_PERM",
                long: "Постоянный ВНЖ (ПМЖ) в Украине",
                short: "ПМЖ в Украине",
                nextQuestion: () => "stage1-permanentValid2402022",
            },
            {
                code: "UKRAINEPERMIT_NONE",
                long: "У меня нету таких документов",
                short: "Нет",
                nextQuestion: maybeRelatives,
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Гражданам третьих стран ВНЖ предоставляется только в том случае, если у них есть бессрочное разрешение на пребывание в Украине (ПМЖ).",
                    ],
                },
            },
        ],
    },
    {
        id: "stage1-permanentValid2402022",
        heading: "ПМЖ действителен на 24.02.2022",
        question:
            "Было ли ваше свидетельство на проживание в Украине действительно по состоянию на 24.02.2022?",
        answers: [
            {
                code: "UKRAINEPERMIT_PERM_VALID",
                long: "Да",
                short: "Да",
                nextQuestion: () => "stage1-secondLocation",
                outcome: {
                    result: Result.YES,
                    notices: [
                        "Ваше бессрочное разрешение на пребывание (ПМЖ) в Украине должно было быть действительно на 24.02.2022.",
                    ],
                },
            },
            {
                code: "UKRAINEPERMIT_PERM_NOTVALID",
                long: "Нет",
                short: "Нет",
                nextQuestion: maybeRelatives,
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Гражданам третьих стран ВНЖ предоставляется только в том случае, если у них есть бессрочное разрешение на пребывание в Украине (ПМЖ), которое было действительно на 24.02.2022.",
                    ],
                },
            },
        ],
    },
    {
        id: "stage1-secondLocation",
        heading: "Страны вне ЕС",
        question: "Проживали ли вы после 24 февраля 2022 в любых странах кроме Украины и ЕС?",
        answers: [
            {
                code: "LOCATION2_EU_UA",
                short: "Нет",
                long: "Нет, только в Украине и странах ЕС",
                nextQuestion: maybeRelatives,
                outcome: {
                    result: Result.YES,
                    notices: [],
                },
            },
            {
                code: "LOCATION2_3С",
                short: "Да",
                long: "Да, проживал в стране вне ЕС",
                nextQuestion: maybeRelatives,
                outcome: {
                    result: Result.NO,
                    notices: [
                        "Министерство внутренних дел Германии считает, что те, кто после 24.02.2022 проживал длительное время в странах вне ЕС, не входят в круг лиц, на которых распространяется временная защита. " +
                            "Указания федерального министерства формально необязательны к исполнению, но большинство миграционных служб им следуют и отказывают в таких случаях в выдаче ВНЖ. " +
                            "Оспорить такое решение можно только путем долгосрочных и дорогостоящих судебных процессов в нескольких инстанциях.",
                    ],
                },
            },
        ],
    },
    {
        id: "stage2-relatives",
        heading: "Семья",
        question:
            "У вас есть супруг, супруга или дети младше 18 лет, которые имеют право на временную защиту в Германии?",
        answers: [
            {
                code: "RELATIVES_YES",
                long: "Да, члены семьи с правом на временную защиту есть",
                short: "Да",
                nextQuestion: () => "stage2-relativesLocation",
                outcome: {
                    result: Result.YES,
                    notices: [
                        "Обратите внимание, что брак или родство с детьми должны быть документально подтверждены, например свидетельством о браке или свидетельством о рождении.",
                    ],
                },
            },
            {
                code: "RELATIVES_NO",
                long: "Нет",
                short: "Нет",
                nextQuestion: () => "_COMPLETE",
                outcome: {
                    result: Result.NO,
                    notices: [
                        "У вас нет членов семьи, имеющих собственное право на временную защиту.",
                    ],
                },
            },
        ],
    },
    {
        id: "stage2-relativesLocation",
        heading: "Совместное проживание с семьей",
        question: "По состоянию на 24.02.2022 вы жили с указанными членами вашей семьи вместе?",
        answers: [
            {
                code: "RELATIVES_TOGETHER",
                long: "Жили вместе",
                short: "Да",
                nextQuestion: () => "_COMPLETE",
                outcome: {
                    result: Result.YES,
                    notices: [
                        "Ваше право на временную защиту основано на том, что у вас есть родственники с собственным правом на временную защиту.",
                    ],
                },
            },
            {
                code: "RELATIVES_NO",
                long: "Жили раздельно",
                short: "Нет",
                nextQuestion: () => "_COMPLETE",
                outcome: {
                    result: Result.MAYBE,
                    notices: [
                        "Если у вас есть родственники с правом на временную защиту, но в момент начала вторжения вы не жили совместно с ними, " +
                            "все зависит от конкретных обстоятельств вашего дела и взглядов конкретной миграционной службы, которая будет обрабатывать ваше заявление." +
                            "Вы должны быть готовы к отказу, который вы должны будете опротестовать, сначала в вышестоящей инстанции, потом в суде.",
                    ],
                },
            },
        ],
    },
];

export const questionIndex = Object.fromEntries(questions.map((q) => [q.id, q]));
