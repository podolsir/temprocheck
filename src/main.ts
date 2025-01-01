import bootstrap from 'bootstrap';

interface Answer {
    readonly code: string;
    readonly long: string;
    readonly short: string;
    readonly nextQuestion: string;
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
            },
            { 
                code: "LOCATION_DE", 
                long: "В Германии", 
                short: "Германия", 
                nextQuestion: "germanPermit",
            },
            { 
                code: "LOCATION_OTHER",
                long: "В другой стране", 
                short: "Другая страна",
                nextQuestion: "citizenship",
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
                long: "Только Украина", short: "Украина",
                nextQuestion: "_COMPLETE",
            },
            {
                code: "CITIZENSHIP_UA_DUAL_EU",
                long: "Украина + страна ЕС",
                short: "Украина + страна ЕС",
                nextQuestion: "_COMPLETE",
            },
            { 
                code: "CITIZENSHIP_UA_DUAL_3C",
                long: "Украина + страна вне ЕС",
                short: "Украина + страна вне ЕС",
                nextQuestion: "_COMPLETE",
            },
            { 
                code: "CITIZENSHIP_EU",
                long: "Страна ЕС",
                short: "Страна ЕС",
                nextQuestion: "_COMPLETE",
            },
            { 
                code: "CITIZENSHIP_3C_PERM",
                long: "Страна вне ЕС и ВНЖ Украины",
                short: "Страна вне ЕС и ВНЖ Украины",
                nextQuestion: "_COMPLETE",
            },
            {
                code: "CITIZENSHIP_3C_TEMP", 
                long: "Страна вне ЕС и ПМЖ Украины",
                short: "Страна вне ЕС и ПМЖ Украины",
                nextQuestion: "_COMPLETE",
            },
            {
                code: "CITIZENSHIP_3C",
                long: "Страна вне ЕС (нет ПМЖ и ВНЖ Украины)",
                short: "Страна вне ЕС",
                nextQuestion: "_COMPLETE",
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
const answers: {[k: string]: string} = {};

const handleEdit = (event: Event) => {
    const mainElement = (event.target as HTMLElement).closest(".tpc-question")!;
    const question = questionIndex[mainElement.id];

    let index = stack.length - 1;
    while (index > 0 && stack[index].id != mainElement.id) {
        const removed = stack.pop()!;
        answers[removed.id] = "";
        document.getElementById('questionsContainer')!.removeChild(removed);
        index--;
    }

    const target = stack[stack.length - 1];

    setIcon(target, "question-circle-fill");
    new bootstrap.Collapse(target.querySelector(".collapse"), {toggle: false}).show();
    target.addEventListener("change", handleAnswer);
    const header = target.querySelector(".tpc-q-header")!;

    header.classList.remove("btn", "btn-secondary")
    header.removeEventListener("click", handleEdit)
    header.querySelector(".tpc-q-heading")!.innerHTML = `${question.heading}`;
}

const handleAnswer = (event: Event) => {
    const target = event.target as HTMLDivElement;
    answers[target.id] = target.dataset.tpcSelectedAnswerCode as string;
    const question = questionIndex[target.id];
    const selectedAnswer = question.answers.find((x) => x.code == answers[target.id])!;

    setIcon(target, "pencil-fill");
    new bootstrap.Collapse(target.querySelector(".collapse"), {toggle: false}).hide();
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
    }
}

document.addEventListener("DOMContentLoaded", (e) => {
    const initialQuestion = createQuestion(questionIndex["location"])
    stack.push(initialQuestion);
    document.getElementById('questionsContainer')!.appendChild(initialQuestion);
    initialQuestion.addEventListener("change", handleAnswer);
});
