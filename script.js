let chart;

function calculateIRPF(income) {
  if (income <= 40750) return 0;

  if (income <= 58250) {
    return (income - 40750) * 0.10;
  }

  if (income <= 87500) {
    return 17500 * 0.10 + (income - 58250) * 0.15;
  }

  return (
    17500 * 0.10 +
    29250 * 0.15 +
    (income - 87500) * 0.24
  );
}

function calculateFONASA(income) {
  return income * 0.06;
}

function calculate() {
  const salary = Number(document.getElementById("salary").value);
  const type = document.getElementById("type").value;
  const children = document.getElementById("children").checked;

  if (!salary) {
    document.getElementById("result").innerHTML = "Ingresá un sueldo válido";
    return;
  }

  let irpf = calculateIRPF(salary);
  const fonasa = calculateFONASA(salary);

  if (children) {
    irpf *= 0.9;
  }

  let extra = 0;

  if (type === "resignation") extra = salary * 0.2;
  if (type === "dismissal") extra = salary * 0.4;

  const neto = salary - irpf - fonasa + extra;

  document.getElementById("result").innerHTML = `
    💰 Bruto: $${salary}<br>
    📊 IRPF: $${irpf.toFixed(2)}<br>
    🏥 FONASA: $${fonasa.toFixed(2)}<br>
    ➕ Extra: $${extra.toFixed(2)}<br>
    <hr>
    🧾 Neto: $${neto.toFixed(2)}
  `;

  drawChart(irpf, fonasa, extra, neto);
}

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
        ],
        borderWidth: 2,
        borderColor: "#0f0f14"
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

/* PDF */
async function downloadPDF() {
  const element = document.querySelector(".app");

  const canvas = await html2canvas(element, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.addImage(img, "PNG", 10, 10, 190, 0);
  pdf.save("uy-calc-pro.pdf");
}