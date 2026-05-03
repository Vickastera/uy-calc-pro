let chart;

/* CALCULOS */
function calculateIRPF(income) {
  if (income <= 40750) return 0;
  if (income <= 58250) return (income - 40750) * 0.10;
  if (income <= 87500)
    return 17500 * 0.10 + (income - 58250) * 0.15;
  return 17500 * 0.10 + 29250 * 0.15 + (income - 87500) * 0.24;
}

function calculateFONASA(income) {
  return income * 0.06;
}
function aguinaldo(salary, months) {
  return (salary * months) / 12;
}
function calculateVacation(neto, days) {
  return (neto / 30) * days;
}
/* MAIN */
function calculate() {
  const salary = Number(document.getElementById("salary").value);
  const type = document.getElementById("type").value;
  const children = document.getElementById("children").checked;
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
  const fonasa = calculateFONASA(salary);
  if (children) irpf *= 0.9;

  let extra = 0;
  let extraLabel = "";

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

  const neto = salary - irpf - fonasa + extra;

  document.getElementById("result").innerHTML = `
    💰 Bruto: $${salary}<br>
    📊 IRPF: $${irpf.toFixed(2)}<br>
    🏥 FONASA: $${fonasa.toFixed(2)}<br>
    📆 Meses: ${months}<br>
    ${document.getElementById("vacation").checked ? `📅 Días: ${days}<br>` : ""}
    ${type === "dismissal" ? `📅 Años: ${years}<br>` : ""}
    ${type === "vacation" ? `📅 Días de licencia: ${days}<br>` : ""}
    ${extra > 0 ? `➕ ${extraLabel}: $${extra.toFixed(2)}<br>` : ""}
    <hr>
    🧾 Neto: $${neto.toFixed(2)}<br>
    💵 Aguinaldo: $${aguinaldo(salary, months).toFixed(2)} <br>
   ${document.getElementById("vacation").checked ? `🏖️ Salario vacacional: $${calculateVacation(neto, days).toFixed(2)}` : ""}
  `;
  document.getElementById("downloadPDF").disabled = false; 
  drawChart(irpf, fonasa, extra, neto, extraLabel);
}


/* GRAFICO */
function drawChart(irpf, fonasa, extra, neto, extraLabel) {
  const ctx = document.getElementById("chart");
  if (chart) chart.destroy();

  const labels = ["IRPF", "FONASA"];
  const data = [irpf, fonasa];
  const colors = ["#ff5c5c", "#3b82f6"];

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
  const years = Number(document.getElementById("years").value);
  const months = Number(document.getElementById("months").value);
  const days = Number(document.getElementById("days").value);

  let irpf = calculateIRPF(salary);
  const fonasa = calculateFONASA(salary);
  if (children) irpf *= 0.9;

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

  const neto = salary - irpf - fonasa + extra;

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
  if (extra > 0) {
    pdf.text(`${extraLabel}: $${extra.toFixed(2)}`, 20, 85);
  }
  pdf.line(20, 95, 190, 95);
  pdf.setFontSize(16);
  pdf.text(`NETO: $${neto.toFixed(2)}`, 20, 110);
  pdf.text(`Aguinaldo: $${aguinaldo(salary, months).toFixed(2)}`, 20, 120);
  if (document.getElementById("vacation").checked) {
    pdf.text(`Salario vacacional: $${calculateVacation(neto, days).toFixed(2)}`, 20, 130);
  }
  pdf.save("liquidacion_(" + new Date().toLocaleDateString() + "_" + new Date().toLocaleTimeString() + ").pdf");
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

