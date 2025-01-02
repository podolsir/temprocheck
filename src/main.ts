import bootstrap from "bootstrap";
import { QuestionData, Result, Answer } from "./types";
import { questionIndex } from "./questions";

export function createQuestion(q: QuestionData) {
    const mainElement = document.createElement("div");
    mainElement.setAttribute("id", q.id);
    mainElement.classList.add("tpc-question", "border", "border-dark-subtle", "rounded-2");
    mainElement.dataset.tpcSelectedAnswerCode = "";

    mainElement.innerHTML = `<div class="bg-dark-subtle d-flex flex-row p-1 tpc-q-header">
            <span class="tpc-q-heading">${q.heading}</span>
            <span class="ms-auto tpc-q-icon"></span>
         </div>

        <div class="collapse show">
            <div class="p-1 tpc-q-question">${q.question}</div>
            <div class="tpc-q-answerlist d-flex flex-column gap-1 p-1"></div>
        </div>
    `;

    const buttonHandler: EventListener = (event) => {
        const value = (event.target as HTMLButtonElement).dataset.tpcAnswerCode;
        mainElement.dataset.tpcSelectedAnswerCode = value;
        event.stopPropagation();
        mainElement.dispatchEvent(new Event("change"));
    };

    const answerList = mainElement.querySelector(".tpc-q-answerlist");
    for (const a of q.answers) {
        const b = document.createElement("button");
        b.classList.add("btn", "btn-primary");
        b.dataset.tpcAnswerCode = a.code;
        b.innerText = a.long;
        b.addEventListener("click", buttonHandler);
        answerList!.appendChild(b);
    }

    return mainElement;
}

function setIcon(tpcQuestionElement: HTMLElement, iconName: string) {
    const icon = tpcQuestionElement.querySelector(".tpc-q-icon")!;
    if (iconName != "") {
        icon.innerHTML = `<i class="bi bi-${iconName}"></i>`;
    } else {
        icon.innerHTML = "";
    }
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
        document.getElementById("questionsContainer")!.removeChild(removed);
        index--;
    }

    const target = stack[stack.length - 1];

    setIcon(target, "");
    new bootstrap.Collapse(target.querySelector(".collapse")!, {
        toggle: false,
    }).show();
    target.addEventListener("change", handleAnswer);
    const header = target.querySelector(".tpc-q-header")!;

    header.classList.remove("btn", "btn-secondary");
    header.classList.add("bg-dark-subtle");
    target.classList.add("border");
    header.removeEventListener("click", handleEdit);
    header.querySelector(".tpc-q-heading")!.innerHTML = `${question.heading}`;
};

const handleAnswer = (event: Event) => {
    const target = event.target as HTMLDivElement;
    const answerCode = target.dataset.tpcSelectedAnswerCode as string;
    const question = questionIndex[target.id];
    const selectedAnswer = question.answers.find((x) => x.code == answerCode)!;
    answers.set(target.id, selectedAnswer);

    setIcon(target, "pencil-fill");
    new bootstrap.Collapse(target.querySelector(".collapse")!, {
        toggle: false,
    }).hide();
    target.removeEventListener("change", handleAnswer);
    const header = target.querySelector(".tpc-q-header")!;
    header.classList.add("btn", "btn-secondary");
    header.classList.remove("bg-dark-subtle");
    target.classList.remove("border");
    header.addEventListener("click", handleEdit);
    header.querySelector(".tpc-q-heading")!.innerHTML =
        `<small>${question.heading}:</small> ${selectedAnswer.short}`;

    const next = selectedAnswer.nextQuestion;
    if (next != "_COMPLETE") {
        const nq = createQuestion(questionIndex[next]);
        stack.push(nq);
        document.getElementById("questionsContainer")!.appendChild(nq);
        nq.addEventListener("change", handleAnswer);
    } else {
        const result = runEvaluation();
        displayEvaluation(result);
    }
};

function runEvaluation() {
    const arr = Array.from(answers.values());
    const score = {
        YES: arr.map((x) => x.weight.YES).reduce((sum, val) => sum + val, 0),
        NO: arr.map((x) => x.weight.NO).reduce((sum, val) => sum + val, 0),
        MAYBE: arr.map((x) => x.weight.MAYBE).reduce((sum, val) => sum + val, 0),
    };
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
    const initialQuestion = createQuestion(questionIndex["location"]);
    stack.push(initialQuestion);
    document.getElementById("questionsContainer")!.appendChild(initialQuestion);
    initialQuestion.addEventListener("change", handleAnswer);
});
