function calculateIRPF(income) {
  let tax = 0;

  if (income <= 40750) {
    tax = 0;
  } else if (income <= 58250) {
    tax = (income - 40750) * 0.10;
  } else if (income <= 87500) {
    tax =
      17500 * 0.10 +
      (income - 58250) * 0.15;
  } else if (income <= 175000) {
    tax =
      17500 * 0.10 +
      29250 * 0.15 +
      (income - 87500) * 0.24;
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

function calculateNetSalary(income, hasChildren) {
  let irpf = calculateIRPF(income);
  const fonasa = calculateFONASA(income);

  // 🎯 beneficio simple por hijos (simulación realista básica)
  if (hasChildren) {
    irpf = irpf * 0.90; // 10% menos IRPF
  }

  const totalDiscounts = irpf + fonasa;

  return {
    irpf,
    fonasa,
    neto: income - totalDiscounts
  };
}

function calculate() {
  const salary = Number(document.getElementById("salary").value);
  const hasChildren = document.getElementById("children").checked;

  const resultBox = document.getElementById("result");

  if (!salary || salary <= 0) {
    resultBox.innerHTML = "⚠️ Ingresá un salario válido";
    return;
  }

  const result = calculateNetSalary(salary, hasChildren);

  resultBox.innerHTML = `
    <div class="card">
      <p>💰 IRPF: $${result.irpf.toFixed(2)}</p>
      <p>🏥 FONASA: $${result.fonasa.toFixed(2)}</p>
      <hr>
      <h2>🧾 Neto: $${result.neto.toFixed(2)}</h2>
    </div>
  `;
}
