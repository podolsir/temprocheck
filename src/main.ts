import bootstrap from "bootstrap";
import { QuestionData, Result, Answer } from "./types";
import { countAnswers, getNotices, questionIndex, runEvaluation } from "./questions";

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
const answers: Map<string, Answer> = new Map<string, Answer>();

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

type ResultDisplay = {
    text: string;
    alertClass: string;
};

const COMBINED_RESULTS: { [key: string]: ResultDisplay } = {
    YES_undefined: {
        text: "У вас скорее всего есть собственное право на временную защиту в Германии.",
        alertClass: "alert-success",
    },
    NO_undefined: {
        text: "У вас скорее всего нет права на временную защиту в Германии.",
        alertClass: "alert-danger",
    },
    MAYBE_YES: {
        text: "Невозможно предсказать, есть ли у вас собственнное право на временную защиту в Германии, но вы скорее всего сможете получить временную защиту как член семьи обладателей такого права.",
        alertClass: "alert-success",
    },
    MAYBE_MAYBE: {
        text: "Невозможно предсказать, есть ли у вас право на временную защиту в Германии.",
        alertClass: "alert-warning",
    },
    MAYBE_NO: {
        text: "Невозможно предсказать, есть ли у вас собственное право на временную защиту в Германии. Также вы не можете получить временную защиту как член семьи обладателей такого права.",
        alertClass: "alert-warning",
    },
    NO_YES: {
        text: "У вас скорее всего нет собственного права на временную защиту в Германии, но вы скорее всего сможете получить временную защиту как член семьи обладателей такого права.",
        alertClass: "alert-success",
    },
    NO_MAYBE: {
        text: "У вас скорее всего нет собственного права на временную защиту в Германии. Ваши шансы получить временную защиту как член семьи обладателей такого права невозможно предсказать.",
        alertClass: "alert-warning",
    },
    NO_NO: {
        text: "У вас скорее всего нет права на временную защиту в Германии.",
        alertClass: "alert-danger",
    },
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

    const next = selectedAnswer.nextQuestion(answers);
    if (next != "_COMPLETE") {
        const nq = createQuestion(questionIndex[next]);
        stack.push(nq);
        document.getElementById("questionsContainer")!.appendChild(nq);
        nq.addEventListener("change", handleAnswer);
    } else {
        const stage1result = runEvaluation(answers, 1);

        let stage2result = undefined;
        if (stage1result != Result.YES && countAnswers(answers, 2)) {
            stage2result = runEvaluation(answers, 2);
        }

        const key = `${stage1result}_${stage2result}`;

        const rc = document.getElementById("resultContainer")!;

        rc.appendChild(createResult(COMBINED_RESULTS[key]));
    }
};

function createResult(rd: ResultDisplay) {
    const tree = (
        document.getElementById("resultTemplate") as HTMLTemplateElement
    ).content.cloneNode(true) as HTMLElement;

    tree.querySelectorAll(".tpc-result-short").forEach((elem) => {
        elem.innerHTML = rd.text;
        elem.classList.add(rd.alertClass);
    });

    const denials = getNotices(answers, 1, [Result.NO, Result.MAYBE]).concat(
        getNotices(answers, 2, [Result.NO, Result.MAYBE]),
    );
    const notices = getNotices(answers, 1, [Result.YES]).concat(
        getNotices(answers, 2, [Result.YES]),
    );

    if (denials.length > 0) {
        tree.querySelectorAll(".tpc-denial-reasons ul").forEach((elem) => {
            for (const n of denials) {
                elem.innerHTML += `<li>${n}</li>`;
            }
        });
    } else {
        tree.querySelector(".tpc-denial-reasons")!.classList.add("d-none");
    }

    if (notices.length > 0) {
        tree.querySelectorAll(".tpc-notices ul").forEach((elem) => {
            for (const n of notices) {
                elem.innerHTML += `<li>${n}</li>`;
            }
        });
    } else {
        tree.querySelector(".tpc-notices")!.classList.add("d-none");
    }

    return tree;
}

function clearEvaluation() {
    document.getElementById("resultContainer")!.innerHTML = "";
}

document.addEventListener("DOMContentLoaded", (e) => {
    const initialQuestion = createQuestion(questionIndex["stage1-location"]);
    stack.push(initialQuestion);
    document.getElementById("questionsContainer")!.appendChild(initialQuestion);
    initialQuestion.addEventListener("change", handleAnswer);
});
