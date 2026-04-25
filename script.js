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

/* MAIN */
function calculate() {
  const salary = Number(document.getElementById("salary").value);
  const type = document.getElementById("type").value;
  const children = document.getElementById("children").checked;
  const years = Number(document.getElementById("years").value);

  if (!salary) {
    document.getElementById("result").innerHTML = "Ingresá un sueldo válido";
    return;
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
    if (!years) {
      document.getElementById("result").innerHTML = "Ingresá años trabajados";
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
    ${type === "dismissal" ? `📅 Años: ${years}<br>` : ""}
    ${extra > 0 ? `➕ ${extraLabel}: $${extra.toFixed(2)}<br>` : ""}
    <hr>
    🧾 Neto: $${neto.toFixed(2)}
  `;

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
  pdf.text(`IRPF: $${irpf.toFixed(2)}`, 20, 65);
  pdf.text(`FONASA: $${fonasa.toFixed(2)}`, 20, 75);
  if (extra > 0) {
    pdf.text(`${extraLabel}: $${extra.toFixed(2)}`, 20, 85);
  }
  pdf.line(20, 95, 190, 95);
  pdf.setFontSize(16);
  pdf.text(`NETO: $${neto.toFixed(2)}`, 20, 110);

  pdf.save("liquidacion.pdf");
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
