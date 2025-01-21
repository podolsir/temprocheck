import bootstrap from "bootstrap";
import { QuestionData, Result, Answer } from "./types";
import {
    countAnswers,
    decodeAnswers,
    encodeAnswers,
    getNotices,
    runEvaluation,
} from "./evaluation";
import { questionIndex, questions as defaultQuestions } from "./questions1";

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
    target.addEventListener("change", handleAnswerChange);
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
    icon: string;
};

const COMBINED_RESULTS: { [key: string]: ResultDisplay } = {
    YES_undefined: {
        text: "У вас скорее всего есть собственное право на временную защиту в Германии.",
        alertClass: "alert-success",
        icon: "check-circle-fill",
    },
    NO_undefined: {
        text: "У вас скорее всего нет права на временную защиту в Германии.",
        alertClass: "alert-danger",
        icon: "x-circle-fill",
    },
    MAYBE_YES: {
        text: "Невозможно предсказать, есть ли у вас собственнное право на временную защиту в Германии, но вы скорее всего сможете получить временную защиту как член семьи обладателей такого права.",
        alertClass: "alert-success",
        icon: "check-circle-fill",
    },
    MAYBE_MAYBE: {
        text: "Невозможно предсказать, есть ли у вас право на временную защиту в Германии.",
        alertClass: "alert-warning",
        icon: "exclamation-triangle-fill",
    },
    MAYBE_NO: {
        text: "Невозможно предсказать, есть ли у вас собственное право на временную защиту в Германии. Также вы не можете получить временную защиту как член семьи обладателей такого права.",
        alertClass: "alert-warning",
        icon: "exclamation-triangle-fill",
    },
    NO_YES: {
        text: "У вас скорее всего нет собственного права на временную защиту в Германии, но вы скорее всего сможете получить временную защиту как член семьи обладателей такого права.",
        alertClass: "alert-success",
        icon: "check-circle-fill",
    },
    NO_MAYBE: {
        text: "У вас скорее всего нет собственного права на временную защиту в Германии. Ваши шансы получить временную защиту как член семьи обладателей такого права невозможно предсказать.",
        alertClass: "alert-warning",
        icon: "exclamation-triangle-fill",
    },
    NO_NO: {
        text: "У вас скорее всего нет права на временную защиту в Германии.",
        alertClass: "alert-danger",
        icon: "x-circle-fill",
    },
};

const DEFAULT_NOTICES = [
    "Информация, предоставленная здесь, собрана волонтерами. Несмотря на тщательность ее обработки, авторы не могут дать никаких гарантий ее верности. Пользуйтесь этой информацией на свой страх и риск.",
    '<a href="https://uahelp.wiki/residence-permit/temporary-protection">Информация о временной защите на сайте <span style="white-space: preserve nowrap;"><img src="uahelp-logo-small.svg" style="height: 2ex;" /> UAhelp.Wiki<span></a>',
];

const handleAnswerChange = (event: Event) => {
    handleAnswer(event.target as HTMLDivElement, true);
};

const handleAnswer = (target: HTMLDivElement, processNext: boolean, questionList: QuestionData[] = defaultQuestions) => {
    const answerCode = target.dataset.tpcSelectedAnswerCode as string;
    const question = questionIndex[target.id];
    const selectedAnswer = question.answers.find((x) => x.code == answerCode)!;
    answers.set(target.id, selectedAnswer);

    setIcon(target, "pencil-fill");
    if (processNext) {
        new bootstrap.Collapse(target.querySelector(".collapse")!, {
            toggle: false,
        }).hide();
    } else {
        target.querySelector(".collapse")!.classList.remove("show");
    }
    target.removeEventListener("change", handleAnswerChange);
    const header = target.querySelector(".tpc-q-header")!;
    header.classList.add("btn", "btn-secondary");
    header.classList.remove("bg-dark-subtle");
    target.classList.remove("border");
    header.addEventListener("click", handleEdit);
    header.querySelector(".tpc-q-heading")!.innerHTML =
        `<small>${question.heading}:</small> ${selectedAnswer.short}`;

    if (!processNext) {
        return;
    }

    const next = selectedAnswer.nextQuestion(answers);
    if (next != "_COMPLETE") {
        const nq = createQuestion(questionIndex[next]);
        stack.push(nq);
        document.getElementById("questionsContainer")!.appendChild(nq);
        nq.addEventListener("change", handleAnswerChange);
    } else {
        const stage1result = runEvaluation(answers, 1);

        let stage2result = undefined;
        if (stage1result != Result.YES && countAnswers(answers, 2)) {
            stage2result = runEvaluation(answers, 2);
        }

        const key = `${stage1result}_${stage2result}`;

        const rc = document.getElementById("resultContainer")!;

        rc.appendChild(createResult(COMBINED_RESULTS[key], questionList));
    }
};

function createResult(rd: ResultDisplay, questionList: QuestionData[]) {
    const tree = (
        document.getElementById("resultTemplate") as HTMLTemplateElement
    ).content.cloneNode(true) as HTMLElement;

    tree.querySelectorAll(".tpc-result-short").forEach((elem) => {
        elem.classList.add(rd.alertClass);
        elem.querySelector("i")!.classList.add("bi", `bi-${rd.icon}`);
        elem.querySelector("span")!.innerHTML = rd.text;
    });

    const denials = getNotices(answers, 1, [Result.NO, Result.MAYBE]).concat(
        getNotices(answers, 2, [Result.NO, Result.MAYBE]),
    );
    const notices = getNotices(answers, 1, [Result.YES])
        .concat(getNotices(answers, 2, [Result.YES]))
        .concat(DEFAULT_NOTICES);

    if (denials.length > 0) {
        tree.querySelectorAll(" .tpc-denial-reasons ul").forEach((elem) => {
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

    if (questionList == defaultQuestions) {
        const code = encodeAnswers(questionList, answers);
        const url = new URL(window.location.href);
        url.hash = "r=1-" + code;
        history.replaceState(null, "", url);
        tree.querySelector(".tpc-copy-code")!.addEventListener("click", (evt) => {
            navigator.clipboard.writeText(url.toString());
        });
    }
    tree.querySelector(".tpc-start-over")!.addEventListener("click", startOver);

    return tree;
}

function clearEvaluation() {
    document.getElementById("resultContainer")!.innerHTML = "";
    const url = new URL(window.location.href);
    url.hash = "";
    history.replaceState(null, "", url);
}

function startOver() {
    clearEvaluation();
    stack.splice(0, stack.length);
    document.getElementById("questionsContainer")!.innerHTML = "";
    initialize();
}

function initialize() {
    const initialQuestion = createQuestion(questionIndex["stage1-location"]);
    stack.push(initialQuestion);
    document.getElementById("questionsContainer")!.appendChild(initialQuestion);
    initialQuestion.addEventListener("change", handleAnswerChange);
}

document.addEventListener("DOMContentLoaded", () => {
    const params = Object.fromEntries(
        new URL(window.location.href).hash
            .replace("#", "")
            .split("/")
            .map((x) => x.split("=", 2)),
    );
    const code = params.r as string;
    let decodeSuccess = false;

    if (code && code.startsWith("1-")) {
        try {
            const inputAnswers = decodeAnswers(defaultQuestions, code.slice(2));
            for (const [k, v] of inputAnswers.entries()) {
                const questionElement = createQuestion(questionIndex[k]);
                stack.push(questionElement);
                document.getElementById("questionsContainer")!.appendChild(questionElement);
                questionElement.dataset.tpcSelectedAnswerCode = v.code;
                handleAnswer(questionElement, false, defaultQuestions);
            }
            handleAnswer(stack[stack.length - 1], true, defaultQuestions);
            decodeSuccess = true;
        } catch (error) {
            // Do nothing.
        }
    }
    if (!decodeSuccess) {
        initialize();
    }
});
