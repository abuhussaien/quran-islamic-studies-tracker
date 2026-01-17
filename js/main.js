document.addEventListener('DOMContentLoaded', function() {
    let students1 = JSON.parse(localStorage.getItem('students1')) || [];
    let students2 = JSON.parse(localStorage.getItem('students2')) || [];
    let currentForm = 1;

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const batchModal = document.getElementById('batchModal');
    const alertModal = document.getElementById('alertModal');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });

    document.getElementById('addStudent1').addEventListener('click', () => addStudent(1));
    document.getElementById('addStudent2').addEventListener('click', () => addStudent(2));
    
    document.getElementById('studentName1').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addStudent(1);
    });
    document.getElementById('studentName2').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addStudent(2);
    });

    document.getElementById('addBatch1').addEventListener('click', () => openBatchModal(1));
    document.getElementById('addBatch2').addEventListener('click', () => openBatchModal(2));

    document.getElementById('csvUpload1').addEventListener('change', (e) => handleCSVUpload(e, 1));
    document.getElementById('csvUpload2').addEventListener('change', (e) => handleCSVUpload(e, 2));

    document.getElementById('exportCSV1').addEventListener('click', () => exportToCSV(1));
    document.getElementById('exportCSV2').addEventListener('click', () => exportToCSV(2));

    document.getElementById('exportPDF1').addEventListener('click', () => exportToPDF(1));
    document.getElementById('exportPDF2').addEventListener('click', () => exportToPDF(2));

    document.getElementById('publishBtn1').addEventListener('click', () => publishResults(1));
    document.getElementById('publishBtn2').addEventListener('click', () => publishResults(2));

    document.getElementById('clearAll1').addEventListener('click', () => clearAllData(1));
    document.getElementById('clearAll2').addEventListener('click', () => clearAllData(2));

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    document.querySelector('.close-alert').addEventListener('click', closeModals);

    document.getElementById('confirmBatch').addEventListener('click', confirmBatchAdd);

    window.addEventListener('click', (e) => {
        if (e.target === batchModal || e.target === alertModal) {
            closeModals();
        }
    });

    function addStudent(formNum) {
        const input = document.getElementById(`studentName${formNum}`);
        const name = input.value.trim();
        
        if (!name) return;
        
        const student = createStudentObject(name, formNum);
        
        if (formNum === 1) {
            students1.push(student);
            saveData(1);
            renderTable(1);
        } else {
            students2.push(student);
            saveData(2);
            renderTable(2);
        }
        
        input.value = '';
        input.focus();
    }

    function createStudentObject(name, formNum) {
        if (formNum === 2) {
            return {
                id: Date.now() + Math.random(),
                name: name,
                tasksScore: 0,
                assessmentsScore: 0
            };
        }
        return {
            id: Date.now() + Math.random(),
            name: name,
            recitation: 0,
            tajweed: 0,
            memorization: 0,
            homework: 0,
            performance: 0,
            participation: 0,
            exam1: 0,
            exam2: 0
        };
    }

    function renderTable(formNum) {
        const tbody = document.getElementById(`tableBody${formNum}`);
        const students = formNum === 1 ? students1 : students2;
        
        tbody.innerHTML = '';
        
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            
            if (formNum === 1) {
                row.innerHTML = createForm1Row(student, index);
            } else {
                row.innerHTML = createForm2Row(student, index);
            }
            
            tbody.appendChild(row);
        });
        
        attachInputListeners(formNum);
    }

    function createForm1Row(student, index) {
        const examAvg = ((student.exam1 + student.exam2) / 2);
        const total = Math.min(
            student.recitation + student.tajweed + student.memorization +
            student.homework + student.performance + student.participation + examAvg,
            100
        );
        
        return `
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td><input type="number" min="0" max="8" value="${student.recitation}" data-field="recitation" data-index="${index}"></td>
            <td><input type="number" min="0" max="5" value="${student.tajweed}" data-field="tajweed" data-index="${index}"></td>
            <td><input type="number" min="0" max="7" value="${student.memorization}" data-field="memorization" data-index="${index}"></td>
            <td><input type="number" min="0" max="15" value="${student.homework}" data-field="homework" data-index="${index}"></td>
            <td><input type="number" min="0" max="10" value="${student.performance}" data-field="performance" data-index="${index}"></td>
            <td><input type="number" min="0" max="15" value="${student.participation}" data-field="participation" data-index="${index}"></td>
            <td><input type="number" min="0" max="40" value="${student.exam1}" data-field="exam1" data-index="${index}"></td>
            <td><input type="number" min="0" max="40" value="${student.exam2}" data-field="exam2" data-index="${index}"></td>
            <td class="calculated-cell">${examAvg.toFixed(1)}</td>
            <td class="total-cell">${total.toFixed(1)}</td>
            <td><button class="delete-btn" data-index="${index}">حذف</button></td>
        `;
    }

    function createForm2Row(student, index) {
        const total = Math.min(student.tasksScore + student.assessmentsScore, 100);
        
        return `
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td><input type="number" min="0" max="40" value="${student.tasksScore}" data-field="tasksScore" data-index="${index}"></td>
            <td><input type="number" min="0" max="60" value="${student.assessmentsScore}" data-field="assessmentsScore" data-index="${index}"></td>
            <td class="total-cell">${total}</td>
            <td><button class="delete-btn" data-index="${index}">حذف</button></td>
        `;
    }

    function attachInputListeners(formNum) {
        const tbody = document.getElementById(`tableBody${formNum}`);
        const students = formNum === 1 ? students1 : students2;
        
        tbody.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', function() {
                const index = parseInt(this.dataset.index);
                const field = this.dataset.field;
                let value = parseInt(this.value) || 0;
                
                const max = parseInt(this.max);
                const min = parseInt(this.min);
                
                if (value > max) value = max;
                if (value < min) value = min;
                
                this.value = value;
                students[index][field] = value;
                
                saveData(formNum);
                updateRowCalculations(this.closest('tr'), students[index], formNum);
            });
        });
        
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
                    students.splice(index, 1);
                    saveData(formNum);
                    renderTable(formNum);
                }
            });
        });
    }

    function updateRowCalculations(row, student, formNum) {
        const cells = row.querySelectorAll('td');
        
        if (formNum === 1) {
            const examAvg = ((student.exam1 + student.exam2) / 2);
            const total = Math.min(
                student.recitation + student.tajweed + student.memorization +
                student.homework + student.performance + student.participation + examAvg,
                100
            );
            cells[10].textContent = examAvg.toFixed(1);
            cells[11].textContent = total.toFixed(1);
        } else {
            const total = Math.min(student.tasksScore + student.assessmentsScore, 100);
            cells[4].textContent = total;
        }
    }

    function openBatchModal(formNum) {
        currentForm = formNum;
        document.getElementById('batchNames').value = '';
        batchModal.classList.add('show');
    }

    function confirmBatchAdd() {
        const names = document.getElementById('batchNames').value
            .split('\n')
            .map(n => n.trim())
            .filter(n => n.length > 0);
        
        if (names.length === 0) return;
        
        const students = currentForm === 1 ? students1 : students2;
        
        names.forEach(name => {
            students.push(createStudentObject(name, currentForm));
        });
        
        saveData(currentForm);
        renderTable(currentForm);
        closeModals();
    }

    function handleCSVUpload(event, formNum) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                
                const students = formNum === 1 ? students1 : students2;
                
                data.forEach((row, index) => {
                    if (index === 0) return;
                    
                    if (row[0] || row[1]) {
                        const student = createStudentObject(row[1] || row[0] || `طالب ${index}`, formNum);
                        
                        if (formNum === 1) {
                            if (row[2] !== undefined) student.recitation = Math.min(Math.max(parseInt(row[2]) || 0, 0), 8);
                            if (row[3] !== undefined) student.tajweed = Math.min(Math.max(parseInt(row[3]) || 0, 0), 5);
                            if (row[4] !== undefined) student.memorization = Math.min(Math.max(parseInt(row[4]) || 0, 0), 7);
                            if (row[5] !== undefined) student.homework = Math.min(Math.max(parseInt(row[5]) || 0, 0), 15);
                            if (row[6] !== undefined) student.performance = Math.min(Math.max(parseInt(row[6]) || 0, 0), 10);
                            if (row[7] !== undefined) student.participation = Math.min(Math.max(parseInt(row[7]) || 0, 0), 15);
                            if (row[8] !== undefined) student.exam1 = Math.min(Math.max(parseInt(row[8]) || 0, 0), 40);
                            if (row[9] !== undefined) student.exam2 = Math.min(Math.max(parseInt(row[9]) || 0, 0), 40);
                        } else {
                            if (row[2] !== undefined) student.tasksScore = Math.min(Math.max(parseInt(row[2]) || 0, 0), 40);
                            if (row[3] !== undefined) student.assessmentsScore = Math.min(Math.max(parseInt(row[3]) || 0, 0), 60);
                        }
                        
                        students.push(student);
                    }
                });
                
                saveData(formNum);
                renderTable(formNum);
                showAlert('تم رفع البيانات بنجاح');
            } catch (error) {
                alert('حدث خطأ في قراءة الملف. تأكد من صحة تنسيق الملف.');
                console.error(error);
            }
        };
        reader.readAsBinaryString(file);
        event.target.value = '';
    }

    function exportToCSV(formNum) {
        const students = formNum === 1 ? students1 : students2;
        
        if (students.length === 0) {
            alert('لا توجد بيانات للتصدير');
            return;
        }
        
        let data;
        
        if (formNum === 1) {
            data = [
                ['التسلسل', 'اسم الطالب', 'صحة التلاوة', 'تطبيقات التجويد', 'جودة الحفظ', 
                 'واجبات', 'مهام أدائية', 'المشاركة والتفاعل', 'الاختبار الأول', 
                 'الاختبار الثاني', 'متوسط الاختبارين', 'المجموع الكلي']
            ];
            
            students.forEach((s, i) => {
                const examAvg = (s.exam1 + s.exam2) / 2;
                const total = Math.min(
                    s.recitation + s.tajweed + s.memorization +
                    s.homework + s.performance + s.participation + examAvg,
                    100
                );
                data.push([
                    i + 1, s.name, s.recitation, s.tajweed, s.memorization,
                    s.homework, s.performance, s.participation, s.exam1,
                    s.exam2, examAvg.toFixed(1), total.toFixed(1)
                ]);
            });
        } else {
            data = [
                ['رقم الطالب', 'اسم الطالب', 'المهام الأدائية والمشاركة والتفاعل', 'تقويمات شفهية وتحريرية', 'المجموع']
            ];
            
            students.forEach((s, i) => {
                const total = Math.min(s.tasksScore + s.assessmentsScore, 100);
                data.push([
                    i + 1, s.name, s.tasksScore, s.assessmentsScore, total
                ]);
            });
        }
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'الدرجات');
        
        const fileName = formNum === 1 ? 'متابعة_أعمال_الطلاب.xlsx' : 'كشف_درجات_الطلاب.xlsx';
        XLSX.writeFile(wb, fileName);
    }

    function exportToPDF(formNum) {
        const students = formNum === 1 ? students1 : students2;
        
        if (students.length === 0) {
            alert('لا توجد بيانات للتصدير');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');
        
        doc.addFont('https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-W1ToLQ-HmkA.ttf', 'Cairo', 'normal');
        
        const academicYear = document.getElementById(`academicYear${formNum}`).value;
        const period = document.getElementById(`period${formNum}`).value;
        const classNumber = document.getElementById(`classNumber${formNum}`).value;
        
        doc.setFontSize(18);
        doc.setTextColor(59, 140, 190);
        const title = formNum === 1 ? 'متابعة أعمال الطلاب التفصيلي' : 'كشف درجات الطلاب النهائي';
        doc.text(title, doc.internal.pageSize.width / 2, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const headerInfo = `السنة: ${academicYear} | الفترة: ${period} | الفصل: ${classNumber} | الصف: السادس الابتدائي`;
        doc.text(headerInfo, doc.internal.pageSize.width / 2, 25, { align: 'center' });
        
        let headers, body;
        
        if (formNum === 1) {
            headers = [['التسلسل', 'اسم الطالب', 'صحة التلاوة', 'تطبيقات التجويد', 'جودة الحفظ', 
                       'واجبات', 'مهام أدائية', 'المشاركة والتفاعل', 'الاختبار الأول', 
                       'الاختبار الثاني', 'متوسط الاختبارين', 'المجموع الكلي']];
            body = students.map((s, i) => {
                const examAvg = (s.exam1 + s.exam2) / 2;
                const total = Math.min(
                    s.recitation + s.tajweed + s.memorization +
                    s.homework + s.performance + s.participation + examAvg,
                    100
                );
                return [i + 1, s.name, s.recitation, s.tajweed, s.memorization,
                        s.homework, s.performance, s.participation, s.exam1,
                        s.exam2, examAvg.toFixed(1), total.toFixed(1)];
            });
        } else {
            headers = [['رقم الطالب', 'اسم الطالب', 'المهام الأدائية والمشاركة والتفاعل', 'تقويمات شفهية وتحريرية', 'المجموع']];
            body = students.map((s, i) => {
                const total = Math.min(s.tasksScore + s.assessmentsScore, 100);
                return [i + 1, s.name, s.tasksScore, s.assessmentsScore, total];
            });
        }
        
        doc.autoTable({
            head: headers,
            body: body,
            startY: 35,
            styles: {
                fontSize: 10,
                halign: 'center',
                valign: 'middle',
                cellPadding: 3
            },
            headStyles: {
                fillColor: [59, 140, 190],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            margin: { top: 35 }
        });
        
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(128);
            doc.text(
                'مدرسة معن بن عدي الابتدائية - إدارة تعليم جدة',
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }
        
        const fileName = formNum === 1 ? 'متابعة_أعمال_الطلاب.pdf' : 'كشف_درجات_الطلاب.pdf';
        doc.save(fileName);
    }

    function publishResults(formNum) {
        showAlert('تم إرسال النتائج إلى أولياء الأمور والإدارة');
    }

    function showAlert(message) {
        document.getElementById('alertMessage').textContent = message;
        alertModal.classList.add('show');
    }

    function clearAllData(formNum) {
        if (!confirm('هل أنت متأكد من مسح جميع البيانات؟')) return;
        
        if (formNum === 1) {
            students1 = [];
        } else {
            students2 = [];
        }
        
        saveData(formNum);
        renderTable(formNum);
    }

    function closeModals() {
        batchModal.classList.remove('show');
        alertModal.classList.remove('show');
    }

    function saveData(formNum) {
        if (formNum === 1) {
            localStorage.setItem('students1', JSON.stringify(students1));
        } else {
            localStorage.setItem('students2', JSON.stringify(students2));
        }
    }

    renderTable(1);
    renderTable(2);
});
