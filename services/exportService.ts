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

export const downloadCanvasAsImage = async (elementId: string, filename: string) => {
    const container = document.querySelector(elementId);
    const svgElement = container?.querySelector('svg');
    
    if (!svgElement) {
        alert("未找到图纸元素");
        return;
    }
    
    try {
        const pngUrl = await svgToPng(svgElement as SVGSVGElement, 1200, 1200);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch(e) {
        console.error("Export failed", e);
        alert("导出图片失败");
    }
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
        'dark_grey': '外金属灰/内金属灰',
        'white': '白色喷涂',
        'champagne': '香槟金',
        'black': '哑光黑',
        'wood': '金丝楠木纹',
        'single': '5mm 钢化',
        'double': '5+20A+5 双层中空',
        'triple': '5+12A+5+12A+5 三玻',
        'laminated': '5+1.14PVB+5 夹胶',
        'aluminum': '普铝',
        'broken_bridge': '断桥铝合金',
        'upvc': '海螺塑钢',
        'wood_clad': '铝包木',
        'casement': '平开',
        'sliding': '推拉',
        'fixed': '固定',
        'folding': '折叠',
        'awning': '上悬',
        'tilt_turn': '内开内倒'
    };
    return map[key] || key;
};

// --- Shared Styles for Printing ---
const PRINT_STYLES = `
    body { font-family: "SimSun", "Songti SC", serif; font-size: 12px; margin: 0; padding: 20px; color: #000; }
    .container { width: 100%; max-width: 1100px; margin: 0 auto; }
    h1 { text-align: center; font-size: 24px; font-weight: 900; margin-bottom: 5px; letter-spacing: 2px; }
    .sub-header { text-align: center; font-size: 14px; margin-bottom: 20px; font-weight: bold; }
    .info-bar { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 20px; }
    th, td { border: 1px solid #000; padding: 6px 4px; }
    th { background: #eee; font-weight: 900; text-align: center; white-space: nowrap; font-size: 13px; }
    .center { text-align: center; }
    .right { text-align: right; font-family: "Arial", sans-serif; }
    .font-bold { font-weight: bold; }
    .font-sm { font-size: 11px; }
    .text-gray { color: #888; }
    .total-row td { border-top: 2px solid #000; font-weight: bold; font-size: 14px; padding: 10px; }
    .total-label { text-align: center; font-family: "SimHei", sans-serif; }
    .total-chinese { font-family: "SimKai", "KaiTi", serif; font-size: 16px; letter-spacing: 1px; }
    .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border: 1px solid #000; text-align: center; margin-bottom: 40px; }
    .footer-cell { padding: 10px; border-right: 1px solid #000; font-weight: bold; }
    .footer-cell:last-child { border-right: none; }
    
    /* Layout for Dual Images */
    .appendix-list { display: flex; flex-direction: column; gap: 40px; }
    .cad-item { border: 1px solid #000; page-break-inside: avoid; }
    .cad-header { background: #000; color: #fff; padding: 5px; font-weight: bold; text-align: center; }
    
    .cad-body { display: flex; gap: 10px; padding: 10px; }
    .cad-img-container { flex: 1; display: flex; flex-direction: column; align-items: center; }
    .cad-img-box { height: 280px; width: 100%; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #eee; }
    .cad-img-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .cad-label { margin-top: 5px; font-weight: bold; color: #666; font-size: 11px; }
    
    .cad-info { border-top: 1px solid #ccc; padding: 8px; text-align: center; background: #f9f9f9; }
    
    @media print {
        @page { size: landscape; margin: 10mm; }
        body { -webkit-print-color-adjust: exact; }
    }
`;

/**
 * 1. Contract Only (Table + Signatures)
 */
export const printOrderContract = (order: Order, user: UserProfile) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert("请允许弹出窗口以打印报价单"); return; }
    
    const today = new Date().toISOString().slice(0, 10);
    const chineseTotal = digitUppercase(order.totalAmount);

    const itemsHtml = order.items.map((item, index) => {
        return `
        <tr class="item-row">
            <td class="center font-bold">C${index + 1}</td>
            <td class="center">${item.templateName}</td>
            <td class="center">${item.model.width}</td>
            <td class="center">${item.model.height}</td>
            <td class="center font-sm">${mapToChinese(item.model.profileColor, 'color')}</td>
            <td class="center font-sm">${mapToChinese(item.model.glassType, 'glass')}</td>
            <td class="center text-gray">卧室/阳台</td>
            <td class="center">整窗/门</td>
            <td class="center">${item.area.toFixed(2)}</td>
            <td class="center">m²</td>
            <td class="center">${(item.unitPrice / item.area).toFixed(0)}</td>
            <td class="right">${item.unitPrice.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
            <td class="center">100%</td>
            <td class="right">${item.unitPrice.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
            <td class="right">${item.unitPrice.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
            <td class="center">${item.quantity}</td>
            <td class="right font-bold">${item.totalPrice.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
        </tr>
        <tr class="remark-row">
           <td colspan="17" style="text-align: left; padding: 2px 8px; color: #666; font-size: 11px;">
              备注：工厂做玻璃，标配五金，含安装。 ${item.model.enableMullions ? '含中挺。' : ''} ${item.model.transomHeight > 0 ? `含上亮 ${item.model.transomHeight}mm。` : ''}
           </td>
        </tr>
    `}).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>销售合同 - ${order.id}</title>
            <style>${PRINT_STYLES}</style>
        </head>
        <body>
            <div class="container">
                <h1>${user.company} 订购合同</h1>
                <div class="sub-header">高端定制 · 匠心制造 · 销售合同</div>
                <div class="info-bar">
                    <span>订单编号：${order.id}</span>
                    <span>客户名称：${order.customerName || '________________'}</span>
                    <span>联系方式：________________</span>
                    <span>打印日期：${today}</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th rowspan="2">门窗<br>编号</th>
                            <th rowspan="2">系列名称</th>
                            <th colspan="2">规格(mm)</th>
                            <th rowspan="2">颜色(内/外)</th>
                            <th rowspan="2">玻璃配置</th>
                            <th rowspan="2">安装<br>位置</th>
                            <th rowspan="2">计价<br>项目</th>
                            <th rowspan="2">数量</th>
                            <th rowspan="2">单位</th>
                            <th rowspan="2">单价<br>(元)</th>
                            <th rowspan="2">金额<br>(元)</th>
                            <th rowspan="2">折扣<br>(%)</th>
                            <th rowspan="2">折后金额</th>
                            <th rowspan="2">单套价格</th>
                            <th rowspan="2">套数</th>
                            <th rowspan="2">总金额<br>(元)</th>
                        </tr>
                        <tr>
                            <th>宽</th>
                            <th>高</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                        <tr class="total-row">
                            <td colspan="2" class="total-label">大写合计</td>
                            <td colspan="9" class="total-chinese">${chineseTotal}</td>
                            <td colspan="2" class="total-label">小写合计</td>
                            <td colspan="2" class="right font-bold">${order.items.length} 套</td>
                            <td colspan="2" class="right font-bold" style="font-size: 18px;">¥ ${order.totalAmount.toLocaleString('zh-CN', {minimumFractionDigits: 0})}</td>
                        </tr>
                        <tr>
                            <td colspan="17" style="padding: 10px; font-size: 12px; line-height: 1.5;">
                                <strong>整单备注：</strong><br>
                                1. 本订单为定制产品，签字确认后即安排生产，无法更改尺寸及配置。<br>
                                2. 生产周期：常规色15-20天，特殊色25-30天。<br>
                                3. 玻璃均为钢化安全玻璃，符合国家标准。<br>
                                4. 结算方式：下单付 80% 订金，安装前付清尾款。
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="footer-grid">
                    <div class="footer-cell">制单人：${user.name}</div>
                    <div class="footer-cell">审核：________________</div>
                    <div class="footer-cell">客户确认：________________</div>
                    <div class="footer-cell">日期：________________</div>
                </div>
            </div>
            <script>window.onload = function() { setTimeout(function(){ window.print(); }, 500); }</script>
        </body>
        </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

/**
 * 2. Drawings Only (Appendix)
 * Updated to show dual images (Effect + Wireframe)
 */
export const printOrderDrawings = (order: Order, user: UserProfile) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert("请允许弹出窗口以打印图纸"); return; }
    
    const today = new Date().toISOString().slice(0, 10);

    const appendixHtml = order.items.map((item, index) => `
        <div class="cad-item">
            <div class="cad-header">C${index + 1} - ${item.templateName}</div>
            
            <div class="cad-body">
                <!-- Image 1: Realistic -->
                <div class="cad-img-container">
                    <div class="cad-img-box">
                         ${item.thumbnailDataUrl ? `<img src="${item.thumbnailDataUrl}" />` : '<span style="color:#ccc;">无效果图</span>'}
                    </div>
                    <div class="cad-label">效果预览 (Effect View)</div>
                </div>

                <!-- Image 2: Wireframe -->
                <div class="cad-img-container">
                    <div class="cad-img-box">
                        ${item.wireframeDataUrl ? `<img src="${item.wireframeDataUrl}" />` : '<span style="color:#ccc;">无线稿图 (No Wireframe)</span>'}
                    </div>
                    <div class="cad-label">结构线稿 (Wireframe)</div>
                </div>
            </div>

            <div class="cad-info">
                <strong>规格：${item.model.width}mm x ${item.model.height}mm</strong> | 
                颜色：${mapToChinese(item.model.profileColor, 'color')} |
                玻璃：${mapToChinese(item.model.glassType, 'glass')}
            </div>
        </div>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>图纸附录 - ${order.id}</title>
            <style>${PRINT_STYLES}</style>
        </head>
        <body>
            <div class="container">
                <h1>${user.company} 生产确认图纸</h1>
                <div class="sub-header">图纸附录 · 生产依据</div>
                <div class="info-bar">
                    <span>订单编号：${order.id}</span>
                    <span>客户名称：${order.customerName || '________________'}</span>
                    <span>打印日期：${today}</span>
                </div>
                
                <div class="appendix-list">
                    ${appendixHtml}
                </div>
                
                <div style="margin-top: 40px; text-align: center; font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 10px;">
                    客户签字确认图纸无误：__________________________
                </div>
            </div>
            <script>window.onload = function() { setTimeout(function(){ window.print(); }, 500); }</script>
        </body>
        </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};