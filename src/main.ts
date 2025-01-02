import bootstrap from 'bootstrap';

enum Result {
    YES   = "YES",
    NO    = "NO",
    MAYBE = "MAYBE",
}

interface Answer {
    readonly code: string;
    readonly long: string;
    readonly short: string;
    readonly nextQuestion: string;
    readonly weight: Weight;
}

interface Weight {
    YES: number;
    NO: number;
    MAYBE: number;
}

interface QuestionData {
    readonly id: string;
    readonly heading: string;
    readonly question: string;
    readonly answers: Answer[];
}

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
                weight: {YES: 100, NO: 0, MAYBE: 0},
            },
            { 
                code: "LOCATION_DE", 
                long: "В Германии", 
                short: "Германия", 
                nextQuestion: "germanPermit",
                weight: {YES: 100, NO: 0, MAYBE: 0},
            },
            { 
                code: "LOCATION_OTHER",
                long: "В другой стране", 
                short: "Другая страна",
                nextQuestion: "citizenship",
                weight: {YES: 0, NO: 1000, MAYBE: 0},
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
                weight: {YES: 100, NO: 0, MAYBE: 0},
            },
            {
                code: "CITIZENSHIP_UA_DUAL_EU",
                long: "Украина + страна ЕС",
                short: "Украина + страна ЕС",
                nextQuestion: "secondLocation",
                weight: {YES: 0, NO: 2000, MAYBE: 0},
            },
            { 
                code: "CITIZENSHIP_UA_DUAL_3C",
                long: "Украина + страна вне ЕС",
                short: "Украина + страна вне ЕС",
                nextQuestion: "secondLocation",
                weight: {YES: 0, NO: 0, MAYBE: 1000},
            },
            { 
                code: "CITIZENSHIP_EU",
                long: "Страна ЕС",
                short: "Страна ЕС",
                nextQuestion: "secondLocation",
                weight: {YES: 0, NO: 2000, MAYBE: 0},
            },
            { 
                code: "CITIZENSHIP_3C_TEMP",
                long: "Страна вне ЕС и ВНЖ Украины",
                short: "Страна вне ЕС и ВНЖ Украины",
                nextQuestion: "secondLocation",
                weight: {YES: 0, NO: 100, MAYBE: 0},
            },
            {
                code: "CITIZENSHIP_3C_PERM", 
                long: "Страна вне ЕС и ПМЖ Украины",
                short: "Страна вне ЕС и ПМЖ Украины",
                nextQuestion: "secondLocation",
                weight: {YES: 100, NO: 0, MAYBE: 0},
            },
            {
                code: "CITIZENSHIP_3C",
                long: "Страна вне ЕС (нет ПМЖ или ВНЖ Украины)",
                short: "Страна вне ЕС",
                weight: {YES: 0, NO: 100, MAYBE: 0},
                nextQuestion: "secondLocation",
            },
        ]
    },
    {
        id: "germanPermit",
        heading: "ВНЖ в Германии",
        question: "Есть ли у вас Aufenthaltstitel, выданный до 24.02.2022, и можете ли вы его продлить?",
        answers: [
            {
                code: "GERMAN_PERMIT_NO",
                long: "Нет",
                short: "Нет",
                nextQuestion: "citizenship",
                weight: {YES: 0, NO: 2000, MAYBE: 0},
            },
            {
                code: "GERMAN_PERMIT_YES_IMPOSSIBLE",
                long: "Есть, не могу продлить",
                short: "Да, продление невозможно",
                nextQuestion: "citizenship",
                weight: {YES: 100, NO: 0, MAYBE: 0},
            },
            {
                code: "GERMAN_PERMIT_YES_POSSIBLE",
                long: "Есть, могу продлить",
                short: "Да, продление возможно",
                nextQuestion: "citizenship",
                weight: {YES: 0, NO: 2000, MAYBE: 0},
            },
        ]
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
                weight: {YES: 100, NO: 0, MAYBE: 0},
            },
            {
                code: "LOCATION2_3С",
                short: "Да",
                long: "Да, проживал в стране вне ЕС",
                nextQuestion: "_COMPLETE",
                weight: {YES: 0, NO: 2000, MAYBE: 0},
            },
        ]
    }
];

const questionIndex = Object.fromEntries(questions.map(q => [q.id, q]));

export function createQuestion(q: QuestionData) {
    const mainElement = document.createElement("div");
    mainElement.setAttribute("id", q.id);
    mainElement.classList.add("tpc-question");
    mainElement.dataset.tpcSelectedAnswerCode = "";

    mainElement.innerHTML = 
        `<div class="d-flex flex-row tpc-q-header">
            <span class="tpc-q-heading">${q.heading}</span>
            <span class="ms-auto tpc-q-icon"><i class="bi bi-question-circle-fill"></i></button>
         </div>

        <div class="collapse show">
            <div class="tpc-q-question">${q.question}</div>
            <div class="tpc-q-answerlist d-flex flex-column"></div>
        </div>
    `;

    const buttonHandler: EventListener = (event) => {
        const value = (event.target as HTMLButtonElement).dataset.tpcAnswerCode;
        mainElement.dataset.tpcSelectedAnswerCode = value;
        event.stopPropagation();
        mainElement.dispatchEvent(new Event("change"));
    }

    const answerList = mainElement.querySelector(".tpc-q-answerlist");
    for (const a of q.answers) {
        const b = document.createElement("button")
        b.classList.add("btn", "btn-primary");
        b.dataset.tpcAnswerCode = a.code;
        b.innerText = a.long;
        b.addEventListener("click", buttonHandler);
        answerList!.appendChild(b);
    }

    return mainElement;
}

function setIcon(tpcQuestionElement: HTMLElement, iconName: string) {
    tpcQuestionElement.querySelector(".tpc-q-icon")!.innerHTML = `<i class="bi bi-${iconName}"></i>`
}

const stack: HTMLDivElement[] = [];
const answers: Map<String, Answer> = new Map<string, Answer>();

const handleEdit = (event: Event) => {
    clearEvaluation();

    const mainElement = (event.target as HTMLElement).closest(".tpc-question")!;
    const question = questionIndex[mainElement.id];

    let index = stack.length - 1;
    while (index > 0 && stack[index].id != mainElement.id) {
        const removed = stack.pop()!;
        answers.delete(removed.id);
        document.getElementById('questionsContainer')!.removeChild(removed);
        index--;
    }

    const target = stack[stack.length - 1];

    setIcon(target, "question-circle-fill");
    new bootstrap.Collapse(target.querySelector(".collapse")!, {toggle: false}).show();
    target.addEventListener("change", handleAnswer);
    const header = target.querySelector(".tpc-q-header")!;

    header.classList.remove("btn", "btn-secondary")
    header.removeEventListener("click", handleEdit)
    header.querySelector(".tpc-q-heading")!.innerHTML = `${question.heading}`;
}

const handleAnswer = (event: Event) => {
    const target = event.target as HTMLDivElement;
    const answerCode = target.dataset.tpcSelectedAnswerCode as string;
    const question = questionIndex[target.id];
    const selectedAnswer = question.answers.find((x) => x.code == answerCode)!;
    answers.set(target.id, selectedAnswer);

    setIcon(target, "pencil-fill");
    new bootstrap.Collapse(target.querySelector(".collapse")!, {toggle: false}).hide();
    target.removeEventListener("change", handleAnswer);
    const header = target.querySelector(".tpc-q-header")!;
    header.classList.add("btn", "btn-secondary")
    header.addEventListener("click", handleEdit)
    header.querySelector(".tpc-q-heading")!.innerHTML = `${question.heading}: ${selectedAnswer.short}`; 

    const next = selectedAnswer.nextQuestion;
    if (next != "_COMPLETE") {
        const nq = createQuestion(questionIndex[next]);
        stack.push(nq);
        document.getElementById('questionsContainer')!.appendChild(nq);
        nq.addEventListener("change", handleAnswer);
    } else {
        const result = runEvaluation();
        displayEvaluation(result);
    }
}

function runEvaluation() {
    const arr = Array.from(answers.values());
    const score = {
        YES:    arr.map(x => x.weight.YES  ).reduce((sum, val) => sum + val, 0),
        NO:     arr.map(x => x.weight.NO   ).reduce((sum, val) => sum + val, 0),
        MAYBE:  arr.map(x => x.weight.MAYBE).reduce((sum, val) => sum + val, 0),
    }
    // sort in descending order, pick first item.
    const result = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
    return result as Result;
}

function clearEvaluation() {
    document.getElementById("resultContainer")!.innerHTML = "";
}

function displayEvaluation(result: Result) {
    document.getElementById("resultContainer")!.innerHTML = result;
}

document.addEventListener("DOMContentLoaded", (e) => {
    const initialQuestion = createQuestion(questionIndex["location"])
    stack.push(initialQuestion);
    document.getElementById('questionsContainer')!.appendChild(initialQuestion);
    initialQuestion.addEventListener("change", handleAnswer);
});
