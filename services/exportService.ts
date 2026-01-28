import { Order, OrderItem, UserProfile } from '../types';

// Helper to calculate price
export const calculatePrice = (width: number, height: number, basePrice: number, panels: number): { area: number, price: number } => {
  const area = parseFloat(((width * height) / 1000000).toFixed(2)); // mm to m2
  const complexityFactor = 1 + (panels * 0.05); 
  const unitPrice = parseFloat((area * basePrice * complexityFactor).toFixed(2));
  return { area, price: unitPrice };
};

// Improved SVG to PNG Converter
export const svgToPng = (svgElement: SVGSVGElement, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Clone the node to avoid modifying the live DOM
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Explicitly set size attributes to ensure scaling works
      clonedSvg.setAttribute('width', width.toString());
      clonedSvg.setAttribute('height', height.toString());
      
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      
      const svg64 = btoa(unescape(encodeURIComponent(svgString)));
      const b64Start = 'data:image/svg+xml;base64,';
      const image64 = b64Start + svg64;

      const img = new Image();
      img.src = image64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('No canvas context'); return; }
        
        // Fill white background (crucial for PNGs)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (e) => {
          console.error("SVG Load Error", e);
          reject(e);
      };
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Converts a number to traditional Chinese financial characters.
 */
const digitUppercase = (n: number): string => {
    const fraction = ['角', '分'];
    const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const unit = [
        ['元', '万', '亿'],
        ['', '拾', '佰', '仟']
    ];
    const head = n < 0 ? '欠' : '';
    n = Math.abs(n);
    let s = '';
    
    for (let i = 0; i < fraction.length; i++) {
        s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
    }
    s = s || '整';
    n = Math.floor(n);
    
    for (let i = 0; i < unit[0].length && n > 0; i++) {
        let p = '';
        for (let j = 0; j < unit[1].length && n > 0; j++) {
            p = digit[n % 10] + unit[1][j] + p;
            n = Math.floor(n / 10);
        }
        s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
};

const mapToChinese = (key: string, type: 'color' | 'glass' | 'material' | 'type'): string => {
    const map: Record<string, string> = {
        'dark_grey': '深空灰',
        'white': '珍珠白',
        'champagne': '香槟金',
        'black': '哑光黑',
        'wood': '柚木纹',
        'single': '5mm 钢化',
        'double': '5+12A+5 双玻',
        'triple': '三玻两腔',
        'laminated': '夹胶安全玻璃',
        'aluminum': '普铝',
        'broken_bridge': '断桥铝',
        'upvc': '塑钢',
        'wood_clad': '铝包木',
        'casement': '平开窗',
        'sliding': '推拉窗',
        'fixed': '固定窗',
        'folding': '折叠窗',
        'awning': '上悬窗',
        'tilt_turn': '内开内倒'
    };
    return map[key] || key;
};

// --- FORMAL BUSINESS STYLES ---
const PRINT_STYLES = `
    @page { size: A4; margin: 15mm; }
    body { 
        font-family: "SimSun", "Songti SC", serif;
        font-size: 10.5pt;
        color: #000;
        line-height: 1.4;
        background: #fff;
    }
    .container { width: 100%; margin: 0 auto; }
    
    /* Header */
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .company-name { font-size: 18pt; font-weight: bold; margin-bottom: 5px; }
    .doc-title { font-size: 15pt; font-weight: bold; letter-spacing: 5px; margin-top: 10px; }
    
    /* Info Section */
    .info-table { width: 100%; margin-bottom: 15px; }
    .info-table td { padding: 4px 0; }
    .info-label { font-weight: bold; width: 80px; text-align-last: justify; }

    /* Main Table */
    .data-table { 
        width: 100%; 
        border-collapse: collapse; 
        border: 2px solid #000; 
        margin-bottom: 20px; 
        font-size: 10pt;
    }
    .data-table th, .data-table td { 
        border: 1px solid #000; 
        padding: 6px; 
        text-align: center; 
    }
    .data-table th { background-color: #f0f0f0; font-weight: bold; }
    .data-table .left { text-align: left; }
    .data-table .right { text-align: right; }
    
    /* Amount Section */
    .total-section { 
        border: 1px solid #000; 
        padding: 10px; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 30px; 
        font-weight: bold;
    }

    /* Footer / Signatures */
    .footer-table { width: 100%; margin-top: 40px; }
    .footer-table td { width: 33%; vertical-align: top; }
    .sig-line { border-bottom: 1px solid #000; width: 80%; display: inline-block; margin-top: 30px; }
    
    /* CAD Drawings Appendix */
    .drawing-page { page-break-before: always; }
    .drawing-item { 
        border: 1px solid #000; 
        margin-bottom: 20px; 
        page-break-inside: avoid;
    }
    .drawing-header { 
        background: #f0f0f0; 
        border-bottom: 1px solid #000; 
        padding: 5px 10px; 
        font-weight: bold;
        display: flex;
        justify-content: space-between;
    }
    .drawing-content { padding: 10px; text-align: center; }
    .drawing-content img { max-width: 95%; max-height: 250px; object-fit: contain; }
    .drawing-specs { 
        border-top: 1px solid #000; 
        padding: 8px; 
        font-size: 9pt; 
        text-align: left;
    }
`;

/**
 * 1. Contract (Formal Business Version)
 */
export const printOrderContract = (order: Order, user: UserProfile) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert("请允许弹出窗口以打印报价单"); return; }
    
    const today = new Date().toISOString().slice(0, 10);
    const chineseTotal = digitUppercase(order.totalAmount);

    const itemsHtml = order.items.map((item, index) => {
        return `
        <tr>
            <td>${index + 1}</td>
            <td class="left">${item.templateName}</td>
            <td>${item.model.width} × ${item.model.height}</td>
            <td>${mapToChinese(item.model.profileColor, 'color')}</td>
            <td>${mapToChinese(item.model.glassType, 'glass')}</td>
            <td>${item.area.toFixed(2)}</td>
            <td class="right">${item.unitPrice.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
            <td>${item.quantity}</td>
            <td class="right">${item.totalPrice.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
        </tr>
    `}).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>销售确认单 - ${order.id}</title>
            <style>${PRINT_STYLES}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="company-name">${user.company}</div>
                    <div class="doc-title">产品销售确认单</div>
                </div>

                <table class="info-table">
                    <tr>
                        <td width="50%"><span class="info-label">订单编号：</span>${order.id}</td>
                        <td width="50%"><span class="info-label">打印日期：</span>${today}</td>
                    </tr>
                    <tr>
                        <td><span class="info-label">客户名称：</span>${order.customerName || '________________'}</td>
                        <td><span class="info-label">联系电话：</span>________________</td>
                    </tr>
                    <tr>
                        <td><span class="info-label">项目地址：</span>________________________________</td>
                        <td><span class="info-label">销售顾问：</span>${user.name}</td>
                    </tr>
                </table>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th width="40">序</th>
                            <th>产品名称</th>
                            <th width="100">规格 (mm)</th>
                            <th width="80">颜色</th>
                            <th width="100">玻璃</th>
                            <th width="60">面积(m²)</th>
                            <th width="80">单价(元)</th>
                            <th width="50">数量</th>
                            <th width="100">金额(元)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                        <tr>
                            <td colspan="5" class="left" style="padding: 10px;">
                                <strong>备注：</strong><br>
                                1. 本报价含锁具、五金、安装费；<br>
                                2. 定制产品下单后不可更改尺寸，制作周期 15-20 天。
                            </td>
                            <td colspan="4"></td>
                        </tr>
                    </tbody>
                </table>

                <div class="total-section">
                    <div>合计金额（人民币大写）：${chineseTotal}</div>
                    <div>¥ ${order.totalAmount.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</div>
                </div>

                <table class="footer-table">
                    <tr>
                        <td>
                            <strong>制单人：</strong><br>
                            <span class="sig-line"></span>
                        </td>
                        <td>
                            <strong>审核人：</strong><br>
                            <span class="sig-line"></span>
                        </td>
                        <td>
                            <strong>客户确认签署：</strong><br>
                            <span class="sig-line"></span>
                        </td>
                    </tr>
                </table>
            </div>
            <script>window.onload = function() { setTimeout(function(){ window.print(); }, 500); }</script>
        </body>
        </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

/**
 * 2. Drawings Appendix (Formal Style)
 */
export const printOrderDrawings = (order: Order, user: UserProfile) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert("请允许弹出窗口以打印图纸"); return; }
    
    const appendixHtml = order.items.map((item, index) => `
        <div class="drawing-item">
            <div class="drawing-header">
                <span>序号：${index + 1} &nbsp;|&nbsp; ${item.templateName}</span>
                <span>ID: ${item.id.split('-').pop()}</span>
            </div>
            
            <div class="drawing-content">
                ${item.wireframeDataUrl ? `<img src="${item.wireframeDataUrl}" alt="CAD Wireframe" />` : '<div style="padding:50px;">暂无结构图</div>'}
                <div style="font-size: 9pt; margin-top: 5px;">结构示意图 (Structure)</div>
            </div>

            <div class="drawing-specs">
                <strong>技术参数：</strong>
                尺寸: ${item.model.width}W x ${item.model.height}H (mm) &nbsp;|&nbsp; 
                颜色: ${mapToChinese(item.model.profileColor, 'color')} &nbsp;|&nbsp; 
                玻璃: ${mapToChinese(item.model.glassType, 'glass')} &nbsp;|&nbsp;
                开启扇: ${item.model.panels} &nbsp;|&nbsp;
                上亮: ${item.model.transomHeight > 0 ? item.model.transomHeight + 'mm' : '无'} &nbsp;|&nbsp;
                中挺: ${item.model.enableMullions ? '有' : '无'}
            </div>
        </div>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>生产图纸 - ${order.id}</title>
            <style>${PRINT_STYLES}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="company-name">${user.company}</div>
                    <div class="doc-title">生产制作确认图</div>
                </div>
                
                <table class="info-table">
                    <tr>
                        <td><span class="info-label">订单编号：</span>${order.id}</td>
                        <td><span class="info-label">客户：</span>${order.customerName}</td>
                        <td><span class="info-label">总项数：</span>${order.items.length}</td>
                    </tr>
                </table>

                ${appendixHtml}
                
                <table class="footer-table">
                    <tr>
                        <td><strong>测量师：</strong><br><span class="sig-line"></span></td>
                        <td><strong>下单员：</strong><br><span class="sig-line"></span></td>
                        <td><strong>客户确认：</strong><br><span class="sig-line"></span></td>
                    </tr>
                </table>
            </div>
            <script>window.onload = function() { setTimeout(function(){ window.print(); }, 500); }</script>
        </body>
        </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
