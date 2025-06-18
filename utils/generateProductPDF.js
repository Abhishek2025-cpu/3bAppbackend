const PDFDocument = require('pdfkit');

const generateProductPDFBuffer = (product) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    // Title
    doc.fontSize(20).text(`🛍 Product Details`, { underline: true });
    doc.moveDown(1.5);

    // Product Fields
    doc.fontSize(14).text(`🔹 Name: ${product.name}`);
    doc.text(`🔹 Product ID: ${product.productId}`);
    doc.text(`🔹 Category ID: ${product.categoryId}`);
    doc.text(`🔹 Price: ${product.price.join(', ')}`);
    doc.text(`🔹 Discount: ${product.discount}%`);
    doc.text(`🔹 Discounted Price: ${product.discountedPrice.join(', ')}`);
    doc.text(`🔹 Colors: ${product.colors?.join(', ') || 'N/A'}`);
    doc.text(`🔹 Dimensions: ${product.dimensions?.join(', ') || 'N/A'}`);
    doc.text(`🔹 Available: ${product.available ? 'Yes' : 'No'}`);
    doc.text(`🔹 Quantity: ${product.quantity}`);
    doc.text(`🔹 Position: ${product.position}`);
    
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Description:', { underline: true });
    doc.font('Helvetica').fontSize(12).text(product.description || 'N/A', {
      align: 'justify'
    });

    doc.end();
  });
};

module.exports = generateProductPDFBuffer;
