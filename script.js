let chart;

/* CALCULOS */
function calculateIRPF(income) {
  if (income <= 48048) return 0; 
  if (income <= 68640) return (income - 48048) * 0.10;
  if (income <= 102960) return 2059.20 + (income - 68640) * 0.15; 
  if (income <= 205920) return 2059.20 + 5148.00 + (income - 102960) * 0.24; 
  if (income <= 343200) return 2059.20 + 5148.00 + 24710.40 + (income - 205920) * 0.25; 
  if (income <= 514800) return 2059.20 + 5148.00 + 24710.40 + 34320.00 + (income - 343200) * 0.27; 
  if (income <= 789360) return 2059.20 + 5148.00 + 24710.40 + 34320.00 + 46332.00 + (income - 514800) * 0.31; 
  return 2059.20 + 5148.00 + 24710.40 + 34320.00 + 46332.00 + 85113.60 + (income - 789360) * 0.36; 
}

function calculateFONASA(income, children, spouse) {
if (children && spouse) return income * 0.8;
if (children && !spouse) return income * 0.6;
if (!children && spouse) return income * 0.65;
return income * 0.045 ;
}
function calculateFRL(income) {
return income * 0.0010;
}

function calculateBps(income) {
  return income * 0.15;

}
function aguinaldoBruto(salary, months) {
  return (salary * months) / 12;
}
function aguinaldoNeto(neto, months) {
  return (neto * months) / 12;
}
function calculateVacation(neto, days) {
  return (neto / 30) * days;
}
/* MAIN */
function calculate() {
  const salary = Number(document.getElementById("salary").value);
  const type = document.getElementById("type").value;
  const children = document.getElementById("children").checked;
  const spouse = document.getElementById("spouse").checked;
  const vacation  = document.getElementById("vacation").checked;
  const years = Number(document.getElementById("years").value);
  const months = Number(document.getElementById("months").value);
  const days = Number(document.getElementById("days").value);

  if (!salary || salary <= 0 || salary > 9999999) {
    document.getElementById("result").innerHTML = "Ingresá un sueldo válido";
    document.getElementById("downloadPDF").disabled = true; 
    return;
  }
  if (!months || months <= 0 || months > 12) {
    document.getElementById("result").innerHTML = "Ingresá meses válidos (1 - 12)";
    document.getElementById("downloadPDF").disabled = true;
    return;
  }
  if (vacation){
if (!days || days < 1 || days > 30) {
    document.getElementById("result").innerHTML = "Ingresá días válidos (1 - 30)";
    document.getElementById("downloadPDF").disabled = true;
    return;
  }
  }
  
  let irpf = calculateIRPF(salary);
  const fonasa = calculateFONASA(salary, children, spouse);
  if (children) irpf *= 0.9;
  const frl = calculateFRL(salary);
  let extra = 0;
  let extraLabel = "";
  let bps = calculateBps(salary);

  if (type === "resignation") {
    extra = salary * 0.2;
    extraLabel = "Compensación por renuncia";
  }

  if (type === "dismissal") {
    if (!years || years < 0 || years > 60) {
      document.getElementById("result").innerHTML = "Ingresá años trabajados (0 - 60)";
      return;
    }
    const cappedYears = Math.min(years, 6);
    extra = salary * cappedYears;
    extraLabel = "Indemnización por despido";
  }

  const neto = salary - irpf - fonasa - bps - frl + extra;
  const netoWithoutExtra = salary - irpf - fonasa - bps - frl;

  document.getElementById("result").innerHTML = `
    💰 Bruto: $${salary}<br>
    📊 IRPF: $${irpf.toFixed(2)}<br>
    🏥 FONASA: $${fonasa.toFixed(2)}<br>
    📆 Meses: ${months}<br>
    📉 BPS: $${bps.toFixed(2)}<br>
    🕒 FRL: $${frl.toFixed(2)}<br>
    ${document.getElementById("vacation").checked ? `📅 Días: ${days}<br>` : ""}
    ${type === "dismissal" ? `📅 Años: ${years}<br>` : ""}
    ${type === "vacation" ? `📅 Días de licencia: ${days}<br>` : ""}
    ${extra > 0 ? `➕ ${extraLabel}: $${extra.toFixed(2)}<br>` : ""}
    <hr>
    🧾 Neto: $${neto.toFixed(2)}<br>
    💵 Aguinaldo Bruto: $${aguinaldoBruto(salary, months).toFixed(2)} <br>
    💲 Aguinaldo Neto: $${aguinaldoNeto(netoWithoutExtra, months).toFixed(2)} <br>
   ${document.getElementById("vacation").checked ? `🏖️ Salario vacacional: $${calculateVacation(netoWithoutExtra, days).toFixed(2)}` : ""}
  `;
    document.getElementById("downloadPDF").disabled = false; 
  drawChart(irpf, fonasa, extra, neto, bps, frl, extraLabel);
}


/* GRAFICO */
function drawChart(irpf, fonasa, extra, neto, bps, frl, extraLabel) {
  const ctx = document.getElementById("chart");
  if (chart) chart.destroy();

  const labels = ["IRPF", "FONASA", "BPS", "FRL"];
  const data = [irpf, fonasa, bps, frl];
  const colors = ["#ff5c5c", "#3b82f6", "#f59e0b", "#8b5cf6"];

  if (extra > 0) {
    labels.push(extraLabel || "Extra");
    data.push(extra);
    colors.push("#10b981");
  }

  labels.push("Neto");
  data.push(neto);
  colors.push("#1e293b");

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors
      }]
    },
    options: {
      plugins: {
        legend: { display: true }
      }
    }
  });
}


/* PDF */
function downloadPDF() {
  const salary = Number(document.getElementById("salary").value);
  const type = document.getElementById("type").value;
  const children = document.getElementById("children").checked;
  const spouse = document.getElementById("spouse").checked;
  const years = Number(document.getElementById("years").value);
  const months = Number(document.getElementById("months").value);
  const days = Number(document.getElementById("days").value);

  let irpf = calculateIRPF(salary);
  const fonasa = calculateFONASA(salary, children, spouse);
  const frl = calculateFRL(salary);
  if (children) irpf *= 0.9;
  let bps = calculateBps(salary);
  let extra = 0;

  let extraLabel = "";

  if (type === "resignation") {
    extra = salary * 0.2;
    extraLabel = "Compensación por renuncia";
  }

  if (type === "dismissal") {
    const cappedYears = Math.min(years || 0, 6);
    extra = salary * cappedYears;
    extraLabel = "Indemnización por despido";
  }

  const neto = salary - irpf - fonasa - bps - frl + extra;
  const netoWithoutExtra = salary - irpf - fonasa - bps - frl;


  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("UY Calc Pro", 20, 20);
  pdf.setFontSize(12);
  pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
  pdf.text(`Tipo: ${type === "salary" ? "Sueldo normal" : type === "resignation" ? "Renuncia" : "Despido"}`, 20, 40);
  pdf.text(`Bruto: $${salary}`, 20, 55);
  pdf.text(`Meses trabajados: ${months}`, 20, 45);
  if (document.getElementById("vacation").checked) {
  pdf.text(`Días de licencia: ${days}`, 20, 50);
  }
  pdf.text(`IRPF: $${irpf.toFixed(2)}`, 20, 65);
  pdf.text(`FONASA: $${fonasa.toFixed(2)}`, 20, 75);
  pdf.text(`BPS: $${bps.toFixed(2)}`, 20, 85);
  pdf.text(`FRL: $${frl.toFixed(2)}`, 20, 95);
  if (extra > 0) {
    pdf.text(`${extraLabel}: $${extra.toFixed(2)}`, 20, 105);
  }
  pdf.line(20, 115, 190, 115);
  pdf.setFontSize(16);
  pdf.text(`NETO: $${neto.toFixed(2)}`, 20, 120);
  pdf.text(`Aguinaldo Bruto: $${aguinaldoBruto(salary, months).toFixed(2)}`, 20, 130);
  pdf.text(`Aguinaldo Neto: $${aguinaldoNeto(netoWithoutExtra, months).toFixed(2)}`, 20, 140);
  if (document.getElementById("vacation").checked) {
    pdf.text(`Salario vacacional: $${calculateVacation(netoWithoutExtra, days).toFixed(2)}`, 20, 150);
  }
  pdf.save("liquidacion_(" + new Date().toLocaleDateString() + "_" + new Date().toLocaleTimeString() +").pdf");
}
/* MOSTRAR ANTIGÜEDAD */
const typeSelect = document.getElementById("type");
const yearsInput = document.getElementById("years");

typeSelect.addEventListener("change", function () {
  if (this.value === "dismissal") {
    yearsInput.style.display = "block";
  } else {
    yearsInput.style.display = "none";
  }
});
  /* MOSTRAR LICENCIA */
const vacationCheckbox = document.getElementById("vacation");
const daysInput = document.getElementById("days");

vacationCheckbox.addEventListener("change", function () {
    if (this.checked) { 
        daysInput.style.display = "block";
    } else {
        daysInput.style.display = "none";
    }
});

