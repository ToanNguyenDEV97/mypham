const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const oldCss = `@media print {
  body * {
    visibility: hidden;
  }
  .print-waybill-container, .print-waybill-container * {
    visibility: visible;
  }
  .print-waybill-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    background: white;
  }
}`;

const newCss = `@media print {
  @page {
    margin: 0.5cm;
    size: auto;
  }
  body * {
    visibility: hidden;
  }
  .print-waybill-container, .print-waybill-container * {
    visibility: visible;
  }
  .print-waybill-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}`;

code = code.replace(oldCss, newCss);
fs.writeFileSync('src/index.css', code);
