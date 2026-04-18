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

  if (type === "resignation") {
    extra = salary * 0.2;
  }

  if (type === "dismissal") {
    if (!years) {
      document.getElementById("result").innerHTML = "Ingresá años trabajados";
      return;
    }

    const cappedYears = Math.min(years, 6);
    extra = salary * cappedYears;
  }

  const neto = salary - irpf - fonasa + extra;

  document.getElementById("result").innerHTML = `
    💰 Bruto: $${salary}<br>
    📊 IRPF: $${irpf.toFixed(2)}<br>
    🏥 FONASA: $${fonasa.toFixed(2)}<br>
    ${type === "dismissal" ? `📅 Años: ${years}<br>` : ""}
    ➕ Extra: $${extra.toFixed(2)}<br>
    <hr>
    🧾 Neto: $${neto.toFixed(2)}
  `;

  drawChart(irpf, fonasa, extra, neto);
}

/* GRAFICO */

function drawChart(irpf, fonasa, extra, neto) {
  const ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["IRPF", "FONASA", "Extra", "Neto"],
      datasets: [{
        data: [irpf, fonasa, extra, neto],
        backgroundColor: [
          "#ff5c5c",
          "#3b82f6",
          "#10b981",
          "#1e293b"
        ]
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/* PDF PRO */

function downloadPDF() {
  const salary = Number(document.getElementById("salary").value);
  const type = document.getElementById("type").value;
  const years = Number(document.getElementById("years").value);

  let irpf = calculateIRPF(salary);
  const fonasa = calculateFONASA(salary);

  let extra = 0;

  if (type === "dismissal") {
    const cappedYears = Math.min(years || 0, 6);
    extra = salary * cappedYears;
  }

  const neto = salary - irpf - fonasa + extra;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("UY Calc Pro", 20, 20);

  pdf.setFontSize(12);
  pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);

  pdf.text(`Bruto: $${salary}`, 20, 50);
  pdf.text(`IRPF: $${irpf.toFixed(2)}`, 20, 60);
  pdf.text(`FONASA: $${fonasa.toFixed(2)}`, 20, 70);
  pdf.text(`Extra: $${extra.toFixed(2)}`, 20, 80);

  pdf.line(20, 90, 190, 90);

  pdf.setFontSize(16);
  pdf.text(`NETO: $${neto.toFixed(2)}`, 20, 105);

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