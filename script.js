const API_URL = "https://api.jsonbin.io/v3/b/67a9a0a1e41b4d34e487fdd1"; // جایگزین کنید
const API_KEY = "$2a$10$K0GxG/YDDvwcCOicoQSc3OIPqPpUflP5JvKxVStM6sdQYjq4LdXKi"; // کلید API را اینجا بگذارید

async function fetchProjects() {
    try {
        const response = await fetch(API_URL, { headers: { "X-Master-Key": API_KEY } });
        const data = await response.json();
        return data.record.projects || [];
    } catch (error) {
        console.error("خطا در دریافت پروژه‌ها:", error);
        return [];
    }
}

async function saveProjects(projects) {
    try {
        await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ projects })
        });
    } catch (error) {
        console.error("خطا در ذخیره پروژه‌ها:", error);
    }
}

async function addProject() {
    const name = document.getElementById("projectName").value.trim();
    const address = document.getElementById("projectAddress").value.trim();
    const date = new Date().toLocaleDateString("fa-IR");

    if (!name) {
        alert("نام پروژه را وارد کنید!");
        return;
    }

    let projects = await fetchProjects();
    projects.push({ name, address, date, reports: [], completed: false });
    await saveProjects(projects);
    displayProjects();
}

async function deleteProject(index) {
    if (confirm("آیا مطمئن هستید که می‌خواهید این پروژه را حذف کنید؟")) {
        let projects = await fetchProjects();
        projects.splice(index, 1);
        await saveProjects(projects);
        displayProjects();
    }
}

async function addReport(index) {
    document.getElementById(`reportForm-${index}`).style.display = "block";
    document.getElementById(`reportText-${index}`).focus();
}

async function editReport(projectIndex, reportIndex) {
    const reportText = document.querySelector(`#project-${projectIndex} .report-text-${reportIndex}`).innerText;
    const reportDate = document.querySelector(`#project-${projectIndex} .report-date-${reportIndex}`).innerText;
    document.getElementById(`reportForm-${projectIndex}`).style.display = "block";
    document.getElementById(`reportText-${projectIndex}`).value = reportText;
    document.getElementById(`reportDate-${projectIndex}`).value = reportDate;
    document.getElementById(`saveReportBtn-${projectIndex}`).setAttribute("data-action", "edit");
    document.getElementById(`saveReportBtn-${projectIndex}`).setAttribute("data-report-index", reportIndex);
}

async function saveReport(projectIndex, action, reportIndex = null) {
    const reportText = document.getElementById(`reportText-${projectIndex}`).value.trim();
    const reportDate = document.getElementById(`reportDate-${projectIndex}`).value.trim();

    if (!reportText) {
        alert("لطفا متن گزارش را وارد کنید.");
        return;
    }

    let projects = await fetchProjects();

    if (action === 'add') {
        projects[projectIndex].reports.push({ date: reportDate, text: reportText });
    } else if (action === 'edit') {
        projects[projectIndex].reports[reportIndex] = { date: reportDate, text: reportText };
    }

    await saveProjects(projects);
    displayProjects();
    closeReportForm(projectIndex);
}

function closeReportForm(projectIndex) {
    document.getElementById(`reportForm-${projectIndex}`).style.display = "none";
}

async function displayProjects() {
    let projects = await fetchProjects();
    let container = document.getElementById("projectsList");
    container.innerHTML = "";

    projects.forEach((p, index) => {
        let projectItem = document.createElement("div");
        projectItem.className = "project-card";
        projectItem.id = `project-${index}`; // اضافه کردن آیدی برای شناسایی پروژه
        if (p.completed) {
            projectItem.style.backgroundColor = "#28a745"; // رنگ سبز برای پروژه‌های پایان‌یافته
        }

        let reportsList = p.reports.map((r, reportIndex) => {
            return `
                <div>
                    <span class="report-date-${reportIndex}">${r.date}: ${r.text}</span>
                    <button onclick="editReport(${index}, ${reportIndex})">ویرایش</button>
                    <button onclick="deleteReport(${index}, ${reportIndex})">حذف</button>
                </div>
            `;
        }).join("");

        projectItem.innerHTML = `
            <h5>پروژه ${index + 1}: ${p.name}</h5>
            <p>${p.address ? p.address : "آدرس ثبت نشده"} | تاریخ شروع: ${p.date}</p>
            <button class="btn btn-danger btn-sm" onclick="deleteProject(${index})">❌ حذف</button>
            <button class="btn btn-primary btn-sm" onclick="addReport(${index})">➕ افزودن گزارش</button>
            <button class="btn btn-success btn-sm" onclick="finishProject(${index})">${p.completed ? 'لغو پایان کار' : 'پایان کار'}</button>
            <button class="btn btn-warning btn-sm" onclick="editProject(${index})">ویرایش مشخصات پروژه</button>
            <div class="reports">${reportsList}</div>
            
            <!-- فرم افزودن یا ویرایش گزارش -->
            <div id="reportForm-${index}" class="report-form" style="display: none;">
                <textarea id="reportText-${index}" placeholder="متن گزارش را وارد کنید..."></textarea><br>
                <input type="text" id="reportDate-${index}" value="${new Date().toLocaleDateString("fa-IR")}" /><br>
                <button id="saveReportBtn-${index}" onclick="saveReport(${index}, 'add')">ثبت گزارش</button>
                <button onclick="closeReportForm(${index})">بستن</button>
            </div>
        `;
        container.appendChild(projectItem);
    });
}

async function finishProject(index) {
    let projects = await fetchProjects();
    projects[index].completed = !projects[index].completed; // تغییر وضعیت پایان کار
    await saveProjects(projects);
    displayProjects();
}

async function deleteReport(projectIndex, reportIndex) {
    if (confirm("آیا مطمئن هستید که می‌خواهید این گزارش را حذف کنید؟")) {
        let projects = await fetchProjects();
        projects[projectIndex].reports.splice(reportIndex, 1);
        await saveProjects(projects);
        displayProjects();
    }
}

async function editProject(index) {
    const projects = await fetchProjects();
    const project = projects[index];
    const newName = prompt("ویرایش نام پروژه:", project.name);
    const newAddress = prompt("ویرایش آدرس پروژه:", project.address);

    if (newName !== null && newAddress !== null) {
        project.name = newName;
        project.address = newAddress;
        await saveProjects(projects);
        displayProjects();
    }
}

document.addEventListener("DOMContentLoaded", displayProjects);