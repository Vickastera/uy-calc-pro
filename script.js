let type = "salary";

function setType(t) {
  type = t;

  document.querySelectorAll(".segmented button").forEach(b => b.classList.remove("active"));
  document.getElementById("t-" + t).classList.add("active");
}

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

function calculate() {
  const salary = Number(document.getElementById("salary").value);
  const children = document.getElementById("children").checked;

  if (!salary) return;

  const irpf = calculateIRPF(salary);
  const fonasa = calculateFONASA(salary);

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

  document.getElementById("p-bruto").innerText = salary;
  document.getElementById("p-irpf").innerText = irpf.toFixed(2);
  document.getElementById("p-fonasa").innerText = fonasa.toFixed(2);
  document.getElementById("p-extra").innerText = extra.toFixed(2);
  document.getElementById("p-neto").innerText = neto.toFixed(2);
}

async function downloadPDF() {
  const element = document.getElementById("pdf");

  const canvas = await html2canvas(element, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.addImage(img, "PNG", 10, 10, 190, 0);
  pdf.save("liquidacion.pdf");
}
