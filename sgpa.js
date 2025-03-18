document.addEventListener('DOMContentLoaded', () => {
    const numSubjectsInput = document.getElementById('num-subjects');
    const generateFieldsBtn = document.getElementById('generate-fields');
    const subjectFieldsContainer = document.getElementById('subject-fields');
    const calculateSgpaBtn = document.getElementById('calculate-sgpa');
    const resultDisplay = document.querySelector('.result-display');
    
    // Generate subject input fields
    generateFieldsBtn.addEventListener('click', () => {
        const numSubjects = parseInt(numSubjectsInput.value);
        
        if (numSubjects < 1 || numSubjects > 10) {
            alert('Please enter a number between 1 and 10');
            return;
        }
        
        subjectFieldsContainer.innerHTML = '';
        
        for (let i = 0; i < numSubjects; i++) {
            const subjectField = document.createElement('div');
            subjectField.className = 'subject-field';
            
            const subjectNameInput = document.createElement('input');
            subjectNameInput.type = 'text';
            subjectNameInput.placeholder = `Subject ${i + 1} Name`;
            subjectNameInput.className = 'subject-name';
            
            const creditInput = document.createElement('input');
            creditInput.type = 'number';
            creditInput.min = '1';
            creditInput.max = '5';
            creditInput.value = '3';
            creditInput.placeholder = 'Credits';
            creditInput.className = 'subject-credit';
            
            const gradeSelect = document.createElement('select');
            gradeSelect.className = 'subject-grade';
            
            const grades = [
                { value: '10', text: 'O (Outstanding)' },
                { value: '9', text: 'A+ (Excellent)' },
                { value: '8', text: 'A (Very Good)' },
                { value: '7', text: 'B+ (Good)' },
                { value: '6', text: 'B (Above Average)' },
                { value: '5', text: 'C (Average)' },
                { value: '4', text: 'P (Pass)' },
                { value: '0', text: 'F (Fail)' }
            ];
            
            grades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade.value;
                option.textContent = grade.text;
                gradeSelect.appendChild(option);
            });
            
            subjectField.appendChild(subjectNameInput);
            subjectField.appendChild(creditInput);
            subjectField.appendChild(gradeSelect);
            
            subjectFieldsContainer.appendChild(subjectField);
        }
        
        // Show the calculate button
        calculateSgpaBtn.style.display = 'block';
        
        // Animate the new fields
        const fields = document.querySelectorAll('.subject-field');
        fields.forEach((field, index) => {
            field.style.opacity = '0';
            field.style.transform = 'translateY(20px)';
            field.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                field.style.opacity = '1';
                field.style.transform = 'translateY(0)';
            }, index * 100);
        });
    });
    
    // Calculate SGPA
    calculateSgpaBtn.addEventListener('click', () => {
        const subjectFields = document.querySelectorAll('.subject-field');
        
        if (subjectFields.length === 0) {
            alert('Please generate subject fields first');
            return;
        }
        
        let totalCredits = 0;
        let totalGradePoints = 0;
        
        subjectFields.forEach(field => {
            const creditValue = parseInt(field.querySelector('.subject-credit').value);
            const gradeValue = parseInt(field.querySelector('.subject-grade').value);
            
            totalCredits += creditValue;
            totalGradePoints += (creditValue * gradeValue);
        });
        
        if (totalCredits === 0) {
            alert('Total credits cannot be zero');
            return;
        }
        
        const sgpa = (totalGradePoints / totalCredits).toFixed(2);
        
        // Display result with animation
        resultDisplay.textContent = '0.00';
        let currentValue = 0;
        const targetValue = parseFloat(sgpa);
        const duration = 1000; // 1 second
        const increment = targetValue / (duration / 20); // Update every 20ms
        
        const animation = setInterval(() => {
            currentValue += increment;
            
            if (currentValue >= targetValue) {
                clearInterval(animation);
                currentValue = targetValue;
            }
            
            resultDisplay.textContent = currentValue.toFixed(2);
        }, 20);
        
        // Scroll to result
        document.getElementById('sgpa-result').scrollIntoView({ behavior: 'smooth' });
    });
});