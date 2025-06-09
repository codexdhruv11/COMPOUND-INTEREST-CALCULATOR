// DOM Elements
const initialAmountInput = document.getElementById('initial-amount');
const monthlyContributionInput = document.getElementById('monthly-contribution');
const yearsInput = document.getElementById('years');
const yearsValue = document.getElementById('years-value');
const interestRateInput = document.getElementById('interest-rate');
const interestRateValue = document.getElementById('interest-rate-value');
const calculateBtn = document.getElementById('calculate-btn');
const compoundedValue = document.getElementById('compounded-value');
const totalContributions = document.getElementById('total-contributions');
const interestEarned = document.getElementById('interest-earned');
const annualGrowth = document.getElementById('annual-growth');
const breakdownBody = document.getElementById('breakdown-body');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
let resultsChart = null;

yearsValue.textContent = yearsInput.value;
interestRateValue.textContent = `${interestRateInput.value}%`;

yearsInput.addEventListener('input', () => {
    yearsValue.textContent = yearsInput.value;
});

interestRateInput.addEventListener('input', () => {
    interestRateValue.textContent = `${interestRateInput.value}%`;
});

function calculateCompoundInterest(init_amount, monthly_contribution, number_of_years, interest_rate) {
    let total = parseFloat(init_amount);
    const annual_contribution = monthly_contribution * 12;
    const monthly_rate = interest_rate / 100 / 12;
    const total_months = number_of_years * 12;
    const yearlyData = [];
    
    for (let year = 1; year <= number_of_years; year++) {
        let yearStart = total;
        let yearInterest = 0;
        
        for (let month = 1; month <= 12; month++) {
            total += monthly_contribution;
            const monthly_interest = total * monthly_rate;
            total += monthly_interest;
            yearInterest += monthly_interest;
        }
        
        yearlyData.push({
            year: year,
            startBalance: yearStart,
            contributions: annual_contribution,
            interest: yearInterest,
            endBalance: total
        });
    }
    
    return {
        finalValue: total,
        totalContributions: init_amount + (monthly_contribution * total_months),
        interestEarned: total - (init_amount + (monthly_contribution * total_months)),
        yearlyData: yearlyData
    };
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatPercentage(value) {
    return value.toFixed(2) + '%';
}

function updateBreakdownTable(yearlyData) {
    breakdownBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatCurrency(data.startBalance)}</td>
            <td>${formatCurrency(data.contributions)}</td>
            <td>${formatCurrency(data.interest)}</td>
            <td>${formatCurrency(data.endBalance)}</td>
        `;
        breakdownBody.appendChild(row);
    });
}

function updateChart(yearlyData) {
    const ctx = document.getElementById('results-chart').getContext('2d');
    const years = yearlyData.map(data => `Year ${data.year}`);
    const values = yearlyData.map(data => data.endBalance);
    
    if (resultsChart) {
        resultsChart.destroy();
    }
    
    resultsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Investment Growth',
                data: values,
                borderColor: '#2d8cff',
                backgroundColor: 'rgba(45, 140, 255, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#2d8cff',
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#e0e0e0',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Balance: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            }
        }
    });
}

function calculateAndDisplay() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    const init_amount = parseFloat(initialAmountInput.value) || 0;
    const monthly_contribution = parseFloat(monthlyContributionInput.value) || 0;
    const number_of_years = parseInt(yearsInput.value) || 1;
    const interest_rate = parseFloat(interestRateInput.value) || 1;
    
    if (init_amount < 0 || monthly_contribution < 0 || number_of_years < 1 || interest_rate <= 0) {
        errorMessage.style.display = 'block';
        return;
    }
    
    const result = calculateCompoundInterest(init_amount, monthly_contribution, number_of_years, interest_rate);
    const annualGrowthRate = (Math.pow(result.finalValue / init_amount, 1/number_of_years) - 1) * 100;
    
    compoundedValue.textContent = formatCurrency(result.finalValue);
    totalContributions.textContent = formatCurrency(result.totalContributions);
    interestEarned.textContent = formatCurrency(result.interestEarned);
    annualGrowth.textContent = formatPercentage(annualGrowthRate);
    
    updateBreakdownTable(result.yearlyData);
    updateChart(result.yearlyData);
    
    successMessage.style.display = 'block';
    
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    calculateBtn.disabled = true;
    
    setTimeout(() => {
        calculateBtn.innerHTML = '<i class="fas fa-check"></i> Calculation Complete';
        calculateBtn.style.background = 'var(--success)';
        
        setTimeout(() => {
            calculateBtn.innerHTML = '<i class="fas fa-rocket"></i> Calculate Projection';
            calculateBtn.style.background = 'var(--primary)';
            calculateBtn.disabled = false;
        }, 2000);
    }, 800);
}

calculateBtn.addEventListener('click', calculateAndDisplay);

window.addEventListener('load', calculateAndDisplay);