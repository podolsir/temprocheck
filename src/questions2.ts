import { maybeRelatives } from "./evaluation";
import { QuestionData, Result } from "./types";

export const questions: QuestionData[] = [
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
                nextQuestion: () => "stage1-permanentResidence",
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
        id: "stage1-permanentResidence",
        heading: "Пребывание за границей до 24.02.2022",
        question: "В последние несколько месяцев перед 24.02.2022 вы жили длительное время (несколько месяцев) за пределами Украины?",
        answers: [
            {
                code: "UA_PERM_RESIDENCE_NO",
                long: "Да",
                short: "Да",
                nextQuestion: () => "stage1-citizenship",
                outcome: {
                    result: Result.MAYBE,
                    notices: [
                        "Поскольку вы незадолго до начала вторжения длительное время жили за пределами Украины, миграционная служба может усомниться в том, что по состоянию на 24.02.2022 вы постоянном проживали в Украине.",
                    ],
                },
            },
            {
                code: "UA_PERM_RESIDENCE_YES",
                long: "Нет",
                short: "Нет",
                nextQuestion: () => "stage1-citizenship",
            },
        ],
    },
    {
        id: "stage1-permanentResidence",
        heading: "Пребывание за пределами Украины",
        question: "В последние несколько месяцев перед 24.02.2022 вы жили длительное время (несколько месяцев) за пределами Украины?",
        answers: [
            {
                code: "UA_PERM_RESIDENCE_NO",
                long: "Да",
                short: "Да",
                nextQuestion: () => "stage1-citizenship",
                outcome: {
                    result: Result.MAYBE,
                    notices: [
                        "Поскольку вы незадолго до начала вторжения длительное время жили за пределами Украины, миграционная служба может усомниться в том, что по состоянию на 24.02.2022 вы постоянном проживали в Украине.",
                    ],
                },
            },
            {
                code: "UA_PERM_RESIDENCE_YES",
                long: "Нет",
                short: "Нет",
                nextQuestion: () => "stage1-citizenship",
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
            {
                code: "CITIZENSHIP_NONE",
                long: "У меня нет гражданства",
                short: "Лицо без гражданства",
                nextQuestion: () => "stage1-ukrainePermit",
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
                        "Гражданам третьих стран и лицам без гражданства временная защита предоставляется только в том случае, если у них есть бессрочное разрешение на пребывание в Украине (ПМЖ).",
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
                        "Гражданам третьих стран и лицам без гражданства временная защита предоставляется только в том случае, если у них есть бессрочное разрешение на пребывание в Украине (ПМЖ), которое было действительно на 24.02.2022.",
                    ],
                },
            },
        ],
    },
    {
        id: "stage1-secondLocation",
        heading: "Место проживания после 24.02.2022",
        question: "В каких странах вы проживали после 24.02.2022?",
        answers: [
            {
                code: "LOCATION2_UA",
                short: "Украина",
                long: "Только в Украине",
                nextQuestion: maybeRelatives,
                outcome: {
                    result: Result.YES,
                    notices: [],
                },
            },
            {
                code: "LOCATION2_3С_NON_EU",
                short: "Страны вне ЕС",
                long: "В стране вне ЕС",
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
            {
                code: "LOCATION2_DE",
                short: "Германия",
                long: "В Германии (приезжаю повторно)",
                nextQuestion: maybeRelatives,
                outcome: {
                    result: Result.YES,
                    notices: [
                        "Повторный приезд в Германию сильно ограничивает ваши варианты прибытия - например, у вас сохраняется привязка к той федеральной земле, где вы были прописаны. " +
                            '<a href="https://uahelp.wiki/stuttgart/again">Информация о повторном въезде на сайте <span style="white-space: preserve nowrap;"><img src="uahelp-logo-small.svg" style="height: 2ex;" /> UAhelp.Wiki<span></a>',
                    ],
                },
            },
            {
                code: "LOCATION2_EU",
                short: "Другие страны ЕС",
                long: "В других странах ЕС",
                nextQuestion: maybeRelatives,
                outcome: {
                    result: Result.YES,
                    notices: [
                        "Проживание в других странах ЕС после 24.02.2022 не является препятствием для получения защиты в Германии. Тем не менее, некоторые миграционные службы отказывают в выдаче ВНЖ, а некоторые социальные службы в оформлении социальной помощи. " +
                            "Несмотря на то, что такие решения можно опротестовать, в таком случае вы окажетесь в очень затруднительной ситуации. Будьте готовы к такому развитию событий.",
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
