import * as XLSX from 'xlsx';

/**
 * Servicio para exportar datos a Excel con formato y colores
 */

interface CellStyle {
  bgColor?: string; // Color de fondo (formato hex sin #)
  fontColor?: string; // Color de texto (formato hex sin #)
  bold?: boolean;
  fontSize?: number;
}

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  style?: CellStyle;
  cellStyle?: (value: any, row: any) => CellStyle;
}

export const excelService = {
  /**
   * Exportar datos a Excel con estilos y colores
   */
  exportToExcel(
    data: any[],
    columns: ExcelColumn[],
    options: {
      fileName: string;
      sheetName?: string;
      includeFilters?: boolean;
    }
  ) {
    if (!data || data.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    const { fileName, sheetName = 'Datos', includeFilters = true } = options;

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();

    // Preparar datos con headers
    const headers = columns.map(col => col.header);
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key];
        return value ?? '';
      })
    );

    // Crear hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Aplicar estilos a los headers
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Aplicar anchos de columna
    const colWidths = columns.map(col => ({
      wch: col.width || 15,
    }));
    worksheet['!cols'] = colWidths;

    // Aplicar estilos a las celdas de datos
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: R };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        
        if (!worksheet[cellRef]) continue;

        const cell = worksheet[cellRef];
        
        // Estilo para headers (fila 0)
        if (R === 0) {
          cell.s = headerStyle;
        } 
        // Estilos para celdas de datos
        else {
          const column = columns[C];
          const rowData = data[R - 1];
          const cellValue = cell.v;

          let style: any = {
            alignment: { vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: 'CCCCCC' } },
              bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
              left: { style: 'thin', color: { rgb: 'CCCCCC' } },
              right: { style: 'thin', color: { rgb: 'CCCCCC' } },
            },
          };

          // Aplicar estilo condicional según el valor
          if (column && column.cellStyle) {
            const customStyle = column.cellStyle(cellValue, rowData);
            
            if (customStyle.bgColor) {
              style.fill = { fgColor: { rgb: customStyle.bgColor } };
            }
            if (customStyle.fontColor) {
              style.font = { ...style.font, color: { rgb: customStyle.fontColor } };
            }
            if (customStyle.bold) {
              style.font = { ...style.font, bold: true };
            }
            if (customStyle.fontSize) {
              style.font = { ...style.font, sz: customStyle.fontSize };
            }
          }

          cell.s = style;
        }
      }
    }

    // Agregar filtros automáticos
    if (includeFilters) {
      worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
    }

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Descargar archivo
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  },

  /**
   * Exportar reporte de ventas con colores
   */
  exportSalesReport(salesData: any[], dateRange: { startDate: string; endDate: string }) {
    // Preparar datos con una fila por cada producto vendido
    const rows: any[] = [];
    
    salesData.forEach(sale => {
      if (sale.sale_items && sale.sale_items.length > 0) {
        sale.sale_items.forEach((item: any) => {
          const itemDiscount = item.item_discount || 0;
          const finalPrice = item.subtotal - itemDiscount;
          
          rows.push({
            saleId: sale.id.substring(0, 8),
            date: new Date(sale.sale_date).toLocaleString('es-BO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            product: item.product_variant?.product?.name || 'N/A',
            size: item.product_variant?.size || 'N/A',
            quantity: item.quantity,
            unitPrice: item.unit_price,
            subtotal: item.subtotal,
            itemDiscount: itemDiscount,
            finalPrice: finalPrice,
            total: sale.total,
            discount: sale.discount_amount || 0,
            paymentType: sale.payment_type,
            customerPhone: sale.customer_phone || 'N/A',
            seller: sale.user?.name || 'N/A'
          });
        });
      }
    });

    // Definir columnas con estilos
    const columns: ExcelColumn[] = [
      { 
        header: 'Nro. Venta', 
        key: 'saleId', 
        width: 12,
        cellStyle: () => ({ bgColor: 'F3F4F6' })
      },
      { 
        header: 'Fecha', 
        key: 'date', 
        width: 18 
      },
      { 
        header: 'Producto', 
        key: 'product', 
        width: 25,
        cellStyle: () => ({ bold: true })
      },
      { 
        header: 'Talla', 
        key: 'size', 
        width: 10,
        cellStyle: () => ({ bgColor: 'EEF2FF' })
      },
      { 
        header: 'Cantidad', 
        key: 'quantity', 
        width: 10,
        cellStyle: (value) => ({
          bgColor: value > 1 ? 'FEF3C7' : 'FFFFFF'
        })
      },
      { 
        header: 'Precio Unit.', 
        key: 'unitPrice', 
        width: 12 
      },
      { 
        header: 'Subtotal', 
        key: 'subtotal', 
        width: 12 
      },
      { 
        header: 'Desc. Item', 
        key: 'itemDiscount', 
        width: 12,
        cellStyle: (value) => ({
          bgColor: value > 0 ? 'FEE2E2' : 'FFFFFF',
          fontColor: value > 0 ? 'DC2626' : '000000'
        })
      },
      { 
        header: 'Total Item', 
        key: 'finalPrice', 
        width: 12,
        cellStyle: () => ({ bgColor: 'DBEAFE', bold: true })
      },
      { 
        header: 'Total Venta', 
        key: 'total', 
        width: 12,
        cellStyle: () => ({ bgColor: 'D1FAE5', bold: true, fontColor: '065F46' })
      },
      { 
        header: 'Desc. Adicional', 
        key: 'discount', 
        width: 14,
        cellStyle: (value) => ({
          bgColor: value > 0 ? 'FEE2E2' : 'FFFFFF',
          fontColor: value > 0 ? 'DC2626' : '000000'
        })
      },
      { 
        header: 'Tipo Pago', 
        key: 'paymentType', 
        width: 12,
        cellStyle: (value) => {
          const colors: any = {
            'EFECTIVO': { bgColor: 'D1FAE5', fontColor: '065F46' },
            'QR': { bgColor: 'DBEAFE', fontColor: '1E40AF' },
            'TARJETA': { bgColor: 'FED7AA', fontColor: '9A3412' },
            'MIXTO': { bgColor: 'DDD6FE', fontColor: '5B21B6' }
          };
          return colors[value] || {};
        }
      },
      { 
        header: 'Celular Cliente', 
        key: 'customerPhone', 
        width: 15 
      },
      { 
        header: 'Vendedor', 
        key: 'seller', 
        width: 20,
        cellStyle: () => ({ bgColor: 'FEF3C7' })
      }
    ];

    // Exportar
    this.exportToExcel(rows, columns, {
      fileName: `reporte_ventas_${dateRange.startDate}_${dateRange.endDate}`,
      sheetName: 'Ventas',
      includeFilters: true
    });
  },

  /**
   * Exportar movimientos de caja con colores
   */
  exportCashMovements(movements: any[], fileName: string) {
    const columns: ExcelColumn[] = [
      { header: 'Fecha', key: 'created_at', width: 18 },
      { 
        header: 'Tipo', 
        key: 'movement_type', 
        width: 12,
        cellStyle: (value) => ({
          bgColor: value === 'INGRESO' ? 'D1FAE5' : 'FEE2E2',
          fontColor: value === 'INGRESO' ? '065F46' : 'DC2626',
          bold: true
        })
      },
      { 
        header: 'Método', 
        key: 'payment_type', 
        width: 12,
        cellStyle: (value) => {
          const colors: any = {
            'EFECTIVO': { bgColor: 'D1FAE5' },
            'QR': { bgColor: 'DBEAFE' },
            'TARJETA': { bgColor: 'FED7AA' }
          };
          return colors[value] || {};
        }
      },
      { 
        header: 'Monto', 
        key: 'amount', 
        width: 12,
        cellStyle: () => ({ bold: true })
      },
      { header: 'Descripción', key: 'description', width: 35 },
      { header: 'Usuario', key: 'user_name', width: 20 }
    ];

    this.exportToExcel(movements, columns, {
      fileName,
      sheetName: 'Movimientos',
      includeFilters: true
    });
  },

  /**
   * Exportar stock con alertas de colores
   */
  exportStock(stockData: any[], fileName: string) {
    const columns: ExcelColumn[] = [
      { header: 'Producto', key: 'product_name', width: 30, cellStyle: () => ({ bold: true }) },
      { header: 'Talla', key: 'size', width: 10 },
      { header: 'Sucursal', key: 'branch_name', width: 20 },
      { 
        header: 'Stock', 
        key: 'quantity', 
        width: 10,
        cellStyle: (value) => {
          if (value === 0) {
            return { bgColor: 'FEE2E2', fontColor: 'DC2626', bold: true };
          } else if (value < 5) {
            return { bgColor: 'FEF3C7', fontColor: 'D97706', bold: true };
          } else if (value < 10) {
            return { bgColor: 'DBEAFE', fontColor: '1E40AF' };
          } else {
            return { bgColor: 'D1FAE5', fontColor: '065F46', bold: true };
          }
        }
      },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Categoría', key: 'category', width: 15 }
    ];

    this.exportToExcel(stockData, columns, {
      fileName,
      sheetName: 'Inventario',
      includeFilters: true
    });
  }
};
