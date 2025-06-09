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
const banner = document.getElementById('banner');
let resultsChart = null;

yearsValue.textContent = yearsInput.value;
interestRateValue.textContent = `${interestRateInput.value}%`;

yearsInput.addEventListener('input', () => {
    yearsValue.textContent = yearsInput.value;
    yearsInput.setAttribute('aria-valuenow', yearsInput.value);
});

interestRateInput.addEventListener('input', () => {
    interestRateValue.textContent = `${interestRateInput.value}%`;
    interestRateInput.setAttribute('aria-valuenow', interestRateInput.value);
});

function calculateCompoundInterest(init_amount, monthly_contribution, number_of_years, interest_rate) {
    let total = parseFloat(init_amount);
    const annual_contribution = monthly_contribution * 12;
    const monthly_rate = interest_rate / 100 / 12;
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
        yearlyData: yearlyData
    };
}

function formatCurrency(value) {
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(2) + 'M';
    }
    if (value >= 1000) {
        return '$' + (value / 1000).toFixed(2) + 'K';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
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
    
    if (resultsChart) resultsChart.destroy();
    
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    const primaryDarkColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-dark');
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');
    const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, primaryDarkColor);
    
    resultsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Investment Growth',
                data: values,
                borderColor: gradient,
                backgroundColor: 'rgba(45,140,255,0.10)',
                borderWidth: 4,
                pointBackgroundColor: primaryColor,
                pointRadius: 6,
                pointHoverRadius: 8,
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
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#fff',
                    titleColor: primaryDarkColor,
                    bodyColor: textColor,
                    borderColor: primaryColor,
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
                    grid: { color: 'rgba(45,140,255,0.07)' },
                    ticks: {
                        color: mutedColor,
                        callback: function(value) { return formatCurrency(value); }
                    }
                },
                x: {
                    grid: { color: 'rgba(45,140,255,0.07)' },
                    ticks: { color: mutedColor }
                }
            }
        }
    });
}

function showBanner(type, message) {
    banner.className = 'banner ' + type;
    banner.querySelector('i').className = type === 'success' ? 
        'fa-solid fa-check-circle' : 'fa-solid fa-exclamation-circle';
    banner.querySelector('span').textContent = message;
    banner.style.display = 'flex';
    
    setTimeout(() => { 
        banner.style.display = 'none'; 
    }, 2500);
}

function calculateAndDisplay() {
    const init_amount = parseFloat(initialAmountInput.value) || 0;
    const monthly_contribution = parseFloat(monthlyContributionInput.value) || 0;
    const number_of_years = parseInt(yearsInput.value) || 1;
    const interest_rate = parseFloat(interestRateInput.value) || 1;
    
    if (init_amount < 0 || monthly_contribution < 0 || number_of_years < 1 || interest_rate < 1) {
        showBanner('error', 'Please enter valid positive values.');
        return;
    }
    
    const compoundResult = calculateCompoundInterest(init_amount, monthly_contribution, number_of_years, interest_rate);
    const total_contributions = monthly_contribution * 12 * number_of_years + init_amount;
    const interest = compoundResult.finalValue - total_contributions;
    
    let annualGrowthPct = '0.00';
    if (number_of_years > 0 && init_amount > 0) {
        annualGrowthPct = ((Math.pow(compoundResult.finalValue / init_amount, 1 / number_of_years) - 1) * 100).toFixed(2);
    }
    
    compoundedValue.textContent = formatCurrency(compoundResult.finalValue);
    totalContributions.textContent = formatCurrency(total_contributions);
    interestEarned.textContent = formatCurrency(interest);
    annualGrowth.textContent = `${annualGrowthPct}%`;
    
    updateBreakdownTable(compoundResult.yearlyData);
    updateChart(compoundResult.yearlyData);
    
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    calculateBtn.disabled = true;
    
    setTimeout(() => {
        calculateBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
        calculateBtn.style.background = 'var(--success)';
        
        setTimeout(() => {
            calculateBtn.innerHTML = '<i class="fas fa-play"></i> Calculate';
            calculateBtn.style.background = '';
            calculateBtn.disabled = false;
        }, 1200);
    }, 900);
    
    showBanner('success', 'Calculation complete!');
}

calculateBtn.addEventListener('click', calculateAndDisplay);

window.addEventListener('load', calculateAndDisplay);