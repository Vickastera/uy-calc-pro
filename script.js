let lastResult = null;

function calculateIRPF(income) {
  let tax = 0;

  if (income <= 40750) {
    tax = 0;
  } else if (income <= 58250) {
    tax = (income - 40750) * 0.10;
  } else if (income <= 87500) {
    tax = 17500 * 0.10 + (income - 58250) * 0.15;
  } else if (income <= 175000) {
    tax = 17500 * 0.10 + 29250 * 0.15 + (income - 87500) * 0.24;
  } else {
    tax =
      17500 * 0.10 +
      29250 * 0.15 +
      87500 * 0.24 +
      (income - 175000) * 0.25;
  }

  return tax;
}

function calculateFONASA(income) {
  return income * 0.06;
}

function aguinaldo(income) {
  return income / 12;
}

function renuncia(income, years = 2) {
  return income * years * 0.1;
}

function calculateNet(income, children) {
  let irpf = calculateIRPF(income);
  const fonasa = calculateFONASA(income);

  if (children) irpf *= 0.9;

  const descuentos = irpf + fonasa;

  return {
    bruto: income,
    irpf,
    fonasa,
    neto: income - descuentos,
    aguinaldo: aguinaldo(income),
    renuncia: renuncia(income)
  };
}

function calculate() {
  const salary = Number(document.getElementById("salary").value);
  const children = document.getElementById("children").checked;

  if (!salary) return;

  const r = calculateNet(salary, children);
  lastResult = r;

  document.getElementById("result").innerHTML = `
    <p>💰 Bruto: $${r.bruto}</p>
    <p>🏥 FONASA: $${r.fonasa.toFixed(2)}</p>
    <p>📊 IRPF: $${r.irpf.toFixed(2)}</p>
    <p>🎁 Aguinaldo: $${r.aguinaldo.toFixed(2)}</p>
    <p>🚪 Renuncia estimada: $${r.renuncia.toFixed(2)}</p>
    <hr>
    <h2>🧾 Neto: $${r.neto.toFixed(2)}</h2>
  `;

  drawChart(r);
}

function drawChart(r) {
  new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels: ["Bruto", "IRPF", "FONASA", "Neto"],
      datasets: [{
        data: [r.bruto, r.irpf, r.fonasa, r.neto]
      }]
    }
  });
}

function downloadPDF() {
  if (!lastResult) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Resumen Sueldo Uruguay", 10, 10);
  doc.text(`Bruto: ${lastResult.bruto}`, 10, 20);
  doc.text(`IRPF: ${lastResult.irpf.toFixed(2)}`, 10, 30);
  doc.text(`FONASA: ${lastResult.fonasa.toFixed(2)}`, 10, 40);
  doc.text(`Neto: ${lastResult.neto.toFixed(2)}`, 10, 50);

  doc.save("sueldo.pdf");
}
