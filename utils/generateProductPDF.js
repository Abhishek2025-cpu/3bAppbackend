const PDFDocument = require('pdfkit');

const generateProductPDFBuffer = (product) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.fontSize(20).text(`Product Details`, { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${product.name}`);
    doc.text(`Product ID: ${product.productId}`);
    doc.text(`Category: ${product.categoryId}`);
    doc.text(`Price: ${product.price.join(', ')}`);
    doc.text(`Discount: ${product.discount}%`);
    doc.text(`Discounted Price: ${product.discountedPrice.join(', ')}`);
    doc.text(`Colors: ${product.colors?.join(', ')}`);
    doc.text(`Dimensions: ${product.dimensions?.join(', ')}`);
    doc.text(`Available: ${product.available}`);
    doc.text(`Quantity: ${product.quantity}`);
    doc.text(`Position: ${product.position}`);
    doc.text(`Description: ${product.description || 'N/A'}`);

    doc.end();
  });
};

module.exports = generateProductPDFBuffer;
