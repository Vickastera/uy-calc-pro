let chart;

/* ===== CALCULOS ===== */

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

/* ===== MAIN ===== */

function calculate() {
  const salary = Number(document.getElementById("salary").value);
  const type = document.getElementById("type").value;

  if (!salary) {
    document.getElementById("result").innerHTML = "Ingresá un sueldo válido";
    return;
  }

  const irpf = calculateIRPF(salary);
  const fonasa = calculateFONASA(salary);

  let extra = 0;

  if (type === "resignation") extra = salary * 0.2;
  if (type === "dismissal") extra = salary * 0.4;

  const neto = salary - irpf - fonasa + extra;

  /* ===== RESULTADO ===== */

  document.getElementById("result").innerHTML = `
    💰 Bruto: $${salary}<br>
    📊 IRPF: $${irpf.toFixed(2)}<br>
    🏥 FONASA: $${fonasa.toFixed(2)}<br>
    ➕ Extra: $${extra.toFixed(2)}<br>
    <hr>
    🧾 Neto: $${neto.toFixed(2)}
  `;

  /* ===== PREVIEW ===== */

  const preview = document.getElementById("preview");

  if (preview) {
    preview.innerHTML = `
      <strong>Resumen</strong><br><br>
      Bruto: $${salary}<br>
      IRPF: $${irpf.toFixed(2)}<br>
      FONASA: $${fonasa.toFixed(2)}<br>
      Neto: $${neto.toFixed(2)}
    `;
  }

  /* ===== GRAFICO ===== */

  drawChart(irpf, fonasa, extra, neto);
}

/* ===== CHART ===== */

function drawChart(irpf, fonasa, extra, neto) {
  const ctx = document.getElementById("chart");

  if (!ctx) return;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["IRPF", "FONASA", "Extra", "Neto"],
      datasets: [{
        data: [irpf, fonasa, extra, neto],

        /* 🔥 COLORES */
        backgroundColor: [
          "#ff5c5c",   // rojo IRPF
          "#3b82f6",   // azul FONASA
          "#10b981",   // verde extra
          "#1e293b"    // oscuro neto
        ],

        borderWidth: 2,
        borderColor: "#0f0f14"
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "white"
          }
        }
      }
    }
  });
}