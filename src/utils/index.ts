import { CadModel, ProductTemplate, CadValidationResult, Order, UserProfile, ProductType, SashType, SashDirection, PanelConfig, ProfileColor } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

// ==========================================
// 0. Model Generation Helper (For Thumbnails)
// ==========================================
export const createDefaultModel = (template: ProductTemplate): CadModel => {
    let defaultType: SashType = 'casement';
    let defaultDir: SashDirection = 'left';

    if (template.id.includes('sliding')) defaultType = 'sliding';
    if (template.id.includes('fixed')) defaultType = 'fixed';
    if (template.id.includes('awning')) { defaultType = 'awning'; defaultDir = 'top'; }
    if (template.id.includes('folding')) defaultType = 'folding';
    if (template.id.includes('entry')) defaultType = 'fixed';

    const initialConfigs: PanelConfig[] = [];
    for (let i = 0; i < template.defaultPanels; i++) {
        initialConfigs.push({
            id: `p-${i}`,
            index: i,
            type: defaultType,
            direction: defaultType === 'casement' ? (i % 2 === 0 ? 'left' : 'right') : defaultDir
        });
    }

    let defaultColor: ProfileColor = 'dark_grey';
    if (template.material === 'upvc') defaultColor = 'white';
    if (template.material === 'wood_clad') defaultColor = 'wood';

    return {
        id: `preview-${template.id}`,
        templateId: template.id,
        width: template.defaultSize.width,
        height: template.defaultSize.height,
        panels: template.defaultPanels,
        panelConfigs: initialConfigs,
        transomHeight: 0,
        hasThreshold: template.type === ProductType.DOOR,
        thresholdHeight: 30,
        showOpeningIndicators: true,
        glassColor: 'blue',
        profileColor: defaultColor,
        glassType: 'double',
        enableMullions: true
    };
};

// ==========================================
// 1. Validation Logic
// ==========================================
export const validateCadModel = (model: CadModel, template: ProductTemplate): CadValidationResult => {
    const errors: Record<string, string> = {};
    const { rules } = template;

    if (model.width < rules.width.min) errors.width = `最小宽度限制: ${rules.width.min}mm`;
    else if (model.width > rules.width.max) errors.width = `最大宽度限制: ${rules.width.max}mm`;

    if (model.height < rules.height.min) errors.height = `最小高度限制: ${rules.height.min}mm`;
    else if (model.height > rules.height.max) errors.height = `最大高度限制: ${rules.height.max}mm`;

    if (model.panels < rules.panels.min) errors.panels = `最少分扇数: ${rules.panels.min}`;
    else if (model.panels > rules.panels.max) errors.panels = `最大分扇数: ${rules.panels.max}`;

    if (model.transomHeight > 0 && !rules.allowTransom) errors.transomHeight = "该产品系列不允许设置上亮/横挺";
    if (model.transomHeight > 0 && model.transomHeight < 300) errors.transomHeight = "上亮高度过小 (至少 300mm)";
    if (model.transomHeight >= model.height - 300) errors.transomHeight = "上亮高度必须小于总高度";

    return { isValid: Object.keys(errors).length === 0, errors };
};

// ==========================================
// 2. Pricing & Export Logic
// ==========================================
export const calculatePrice = (width: number, height: number, basePrice: number, panels: number): { area: number, price: number } => {
    const area = parseFloat(((width * height) / 1000000).toFixed(2));
    const complexityFactor = 1 + (panels * 0.05);
    const unitPrice = parseFloat((area * basePrice * complexityFactor).toFixed(2));
    return { area, price: unitPrice };
};

export const svgToPng = (svgElement: SVGSVGElement, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
            clonedSvg.setAttribute('width', width.toString());
            clonedSvg.setAttribute('height', height.toString());
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);
            const svg64 = btoa(unescape(encodeURIComponent(svgString)));
            const image64 = 'data:image/svg+xml;base64,' + svg64;
            const img = new Image();
            img.src = image64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject('No canvas context'); return; }
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = (e) => { console.error("SVG Load Error", e); reject(e); };
        } catch (e) { reject(e); }
    });
};

const digitUppercase = (n: number): string => {
    const fraction = ['角', '分'];
    const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
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

const mapToChinese = (key: string, type: string): string => {
    const map: Record<string, string> = {
        'dark_grey': '深空灰', 'white': '珍珠白', 'champagne': '香槟金', 'black': '哑光黑', 'wood': '柚木纹',
        'single': '5mm 钢化', 'double': '5+12A+5 双玻', 'triple': '三玻两腔', 'laminated': '夹胶',
        'aluminum': '普铝', 'broken_bridge': '断桥铝', 'upvc': '塑钢', 'wood_clad': '铝包木',
        'casement': '平开', 'sliding': '推拉', 'fixed': '固定', 'folding': '折叠', 'awning': '上悬'
    };
    return map[key] || key;
};

// 严谨、中式商务风格的打印样式
const PRINT_STYLES = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { font-family: "SimSun", "Songti SC", "Microsoft YaHei", serif; font-size: 10pt; color: #000; line-height: 1.3; background: #fff; margin: 0; padding: 0; }
    
    .container { width: 100%; padding: 15mm; background: #fff; box-sizing: border-box; }
    
    /* 头部排版 - 移除原来的大标题样式 */
    .header-info { margin-top: 10px; margin-bottom: 20px; }

    /* 表单行样式 - 使用 Flexbox 确保下划线对齐 */
    .form-row { 
        display: flex; 
        align-items: flex-end; /* 关键：底部对齐 */
        margin-bottom: 8px;
        font-size: 10.5pt;
    }
    
    .form-label { 
        font-weight: bold; 
        white-space: nowrap; 
        margin-right: 5px; 
        padding-bottom: 2px; /* 微调基线 */
    }
    
    .form-value { 
        flex: 1; 
        border-bottom: 1px solid #000; 
        text-align: center; 
        font-family: "SimHei", sans-serif; /* 内容用黑体，更清晰 */
        padding-bottom: 3px; /* 保证文字在横线略上方 */
        min-height: 18px;
    }

    .form-col-2 {
        display: flex;
        justify-content: space-between;
        gap: 30px;
    }
    
    .form-col-item {
        flex: 1;
    }

    /* 主数据表格 */
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #000; margin-top: 10px; }
    .data-table th, .data-table td { border: 1px solid #000; padding: 6px 4px; vertical-align: middle; }
    .data-table th { background-color: #f0f0f0; color: #000; font-weight: bold; text-align: center; height: 36px; font-size: 10pt; font-family: "SimHei", sans-serif; }
    .data-table td { font-size: 9.5pt; }
    
    /* 专栏对齐 */
    .col-seq { text-align: center; }
    .col-name { text-align: left; }
    .col-spec { text-align: center; font-family: "Arial", sans-serif; }
    .col-config { text-align: center; }
    .col-num { text-align: right; font-family: "Arial", sans-serif; padding-right: 5px; }
    .col-money { text-align: right; font-family: "Arial", sans-serif; padding-right: 5px; font-weight: bold; }
    
    /* 财务合计栏 */
    .total-row td { border-top: 2px solid #000; background-color: #f9f9f9; font-weight: bold; }

    /* 备注与条款 */
    .section-box { border: 1px solid #000; padding: 10px; margin-bottom: 20px; font-size: 9pt; }
    .section-title { font-weight: bold; margin-bottom: 5px; font-family: "SimHei", sans-serif; border-bottom: 1px solid #ccc; padding-bottom: 3px; display: inline-block; }
    .terms-list { margin: 0; padding-left: 20px; line-height: 1.5; }

    /* 签字栏 */
    .sign-area { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 10px; }
    .sign-block { width: 45%; }
    .sign-line { border-bottom: 1px solid #000; margin-top: 40px; }
    
    /* 图纸特定 */
    .drawing-page { page-break-before: always; }
    .drawing-item { border: 1px solid #000; margin-bottom: 20px; page-break-inside: avoid; background: #fff; }
    .drawing-header { background: #eee; border-bottom: 1px solid #000; padding: 5px 10px; font-weight: bold; display: flex; justify-content: space-between; font-size: 10pt; }
    .drawing-content { padding: 10px; display: flex; justify-content: center; height: 300px; background: #fff; }
    .drawing-content img { max-height: 100%; max-width: 100%; object-fit: contain; }
    .drawing-footer { border-top: 1px solid #000; padding: 5px 10px; font-size: 9pt; background: #f9f9f9; }
`;

const getContractHtml = (order: Order, user: UserProfile): string => {
    const today = new Date().toISOString().slice(0, 10);
    const orderDate = order.date || today;
    const chineseTotal = digitUppercase(order.totalAmount);
    const paid = order.paidAmount || 0;
    const remaining = order.totalAmount - paid;
    const totalArea = order.items.reduce((acc, item) => acc + item.area * item.quantity, 0).toFixed(2);
    const totalQty = order.items.reduce((acc, item) => acc + item.quantity, 0);

    const itemsHtml = order.items.map((item, index) => `
        <tr>
            <td class="col-seq">${index + 1}</td>
            <td class="col-name">${item.templateName}</td>
            <td class="col-spec">${item.model.width} × ${item.model.height}</td>
            <td class="col-config">${mapToChinese(item.model.profileColor, 'color')}</td>
            <td class="col-config">${mapToChinese(item.model.glassType, 'glass')}</td>
            <td style="text-align: left; color: #333;">${item.remark || ''}</td>
            <td class="col-num">${item.area.toFixed(2)}</td>
            <td class="col-num">${item.quantity}</td>
            <td class="col-money">${item.unitPrice.toLocaleString('zh-CN')}</td>
            <td class="col-money">${item.totalPrice.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
        </tr>
    `).join('');

    // Ensure table has minimum height
    const minRows = 5;
    let emptyRowsHtml = '';
    if (order.items.length < minRows) {
        for (let i = 0; i < (minRows - order.items.length); i++) {
            emptyRowsHtml += `<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
        }
    }

    return `
        <div class="container">
            <!-- 头部信息：使用 Flexbox 布局确保对齐 -->
            <div class="header-info">
                <div class="form-col-2">
                    <div class="form-col-item">
                        <div class="form-row">
                            <span class="form-label">甲方(客户):</span>
                            <span class="form-value">${order.customerName}</span>
                        </div>
                        <div class="form-row">
                            <span class="form-label">联系电话:</span>
                            <span class="form-value">${order.customerPhone || ''}</span>
                        </div>
                    </div>
                    <div class="form-col-item">
                        <div class="form-row">
                            <span class="form-label">报价单编号:</span>
                            <span class="form-value">${order.id}</span>
                        </div>
                        <div class="form-row">
                            <span class="form-label">签订日期:</span>
                            <span class="form-value">${orderDate}</span>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <span class="form-label">工程地址:</span>
                    <span class="form-value" style="text-align: left; padding-left: 10px;">${order.address || ''}</span>
                </div>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th width="5%">序号</th>
                        <th width="20%">产品名称</th>
                        <th width="12%">规格(mm)</th>
                        <th width="8%">颜色</th>
                        <th width="12%">玻璃配置</th>
                        <th width="12%">特殊备注</th>
                        <th width="8%">面积(m²)</th>
                        <th width="5%">数量</th>
                        <th width="8%">单价</th>
                        <th width="10%">金额</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    ${emptyRowsHtml}
                    <tr class="total-row">
                        <td colspan="6" style="text-align: center;">合 计</td>
                        <td class="col-num">${totalArea}</td>
                        <td class="col-num">${totalQty}</td>
                        <td></td>
                        <td class="col-money">¥${order.totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td colspan="10" style="padding: 8px;">
                            <strong>金额大写：</strong>${chineseTotal} 
                            <span style="float: right;">
                                已收定金：¥${paid} &nbsp;&nbsp;|&nbsp;&nbsp; 
                                <span style="color: ${remaining > 0 ? '#000' : '#000'}">应付尾款：¥${remaining.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="section-box">
                <div class="section-title">约定条款</div>
                <ol class="terms-list">
                    <li>本合同一式两份，甲乙双方各执一份，经双方签字盖章后生效。</li>
                    <li>客户请仔细核对产品型号、规格、颜色、开启方向及玻璃配置，确认无误后签字。签字确认后即进入生产流程，不得随意更改；如需更改，所产生的一切费用由甲方承担。</li>
                    <li>定制产品非质量问题概不退换。生产周期约为 20-30 个工作日，遇不可抗力因素顺延。</li>
                    <li>付款方式：合同签订即付定金，安装前/提货前付清尾款。</li>
                    <li>产品保修：五金配件保修两年，型材表面处理保修五年，玻璃自爆不在保修范围内。</li>
                </ol>
            </div>

            <div class="sign-area">
                <div class="sign-block">
                    <div><strong>甲方 (需方)：</strong>${order.customerName}</div>
                    <div style="margin-top: 10px;">代表签字：</div>
                    <div class="sign-line"></div>
                    <div style="margin-top: 10px;">日期：</div>
                </div>
                <div class="sign-block">
                    <div><strong>乙方 (供方)：</strong>Future Windows Ltd.</div>
                    <div style="margin-top: 10px;">代表签字 (盖章)：</div>
                    <div class="sign-line"></div>
                    <div style="margin-top: 10px;">日期：</div>
                </div>
            </div>
        </div>
    `;
};

const getDrawingsHtml = (order: Order, user: UserProfile): string => {
    const appendixHtml = order.items.map((item, index) => `
        <div class="drawing-item">
            <div class="drawing-header">
                <span>图号：${index + 1} &nbsp;&nbsp; ${item.templateName}</span>
                <span>${item.model.width} × ${item.model.height} mm</span>
            </div>
            <div class="drawing-content">
                ${item.wireframeDataUrl
            ? `<img src="${item.wireframeDataUrl}" alt="CAD Drawing" crossorigin="anonymous" />`
            : '<span style="margin:auto; color:#ccc">暂无图纸数据</span>'
        }
            </div>
            <div class="drawing-footer">
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                    <div><strong>颜色：</strong>${mapToChinese(item.model.profileColor, 'color')}</div>
                    <div><strong>玻璃：</strong>${mapToChinese(item.model.glassType, 'glass')}</div>
                    <div><strong>数量：</strong>${item.quantity} 樘</div>
                    <div><strong>位置：</strong>${item.remark || '-'}</div>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <div class="container">
            <div class="header-info" style="border-bottom: 2px solid #000; padding-bottom: 10px;">
                <div style="font-size: 16pt; font-weight: bold;">生产制作单</div>
                <div style="font-size: 12pt; margin-top:5px; display: flex; justify-content: space-between;">
                    <span>报价单编号：${order.id}</span>
                    <span>客户：${order.customerName}</span>
                </div>
                <div style="font-size: 10pt; margin-top:4px;">日期：${order.date || ''}</div>
            </div>
            ${appendixHtml}
        </div>
    `;
};

// Helper: Open a blob in a new window cleanly
const openBlobPdf = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    // Open a new tab immediately to bypass popup blockers
    const win = window.open('', '_blank');
    if (win) {
        if (win.document) {
            win.document.write('<html><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#525659;"><div style="color:white;font-family:sans-serif;">Loading PDF...</div></body></html>');
        }
        // Redirect to blob
        win.location.href = url;
    } else {
        // Fallback: download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    // Clean up URL after delay
    setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// Generates a PDF Blob from HTML string using html2canvas (Slicing technique for long content)
const generatePdfFromHtml = async (html: string): Promise<Blob> => {
    // Create a hidden container
    const container = document.createElement('div');
    container.id = 'pdf-gen-container';
    container.innerHTML = html;

    // Apply styles strictly
    const style = document.createElement('style');
    style.innerHTML = PRINT_STYLES;
    container.appendChild(style);

    // Position fixed and invisible to user, but visible to renderer
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 width at 96dpi (210mm)
    container.style.zIndex = '-1000';
    container.style.backgroundColor = '#ffffff';

    document.body.appendChild(container);

    try {
        // Wait for images
        const images = container.getElementsByTagName('img');
        if (images.length > 0) {
            await Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        // Use standard canvas capture
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 794
        });

        const contentWidth = canvas.width;
        const contentHeight = canvas.height;

        // A4 dimension in PDF points (approx)
        const pdfWidth = 595.28;
        const pdfHeight = 841.89;

        // Calculate the height of the image on the PDF page
        const pageHeightInImg = contentWidth / pdfWidth * pdfHeight;

        let leftHeight = contentHeight;
        let position = 0;

        const imgWidth = pdfWidth;
        const imgHeight = (pdfWidth / contentWidth) * contentHeight;

        const pdf = new jsPDF('p', 'pt', 'a4');

        if (leftHeight < pageHeightInImg) {
            // Single Page
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
            // Multi Page (Slice)
            while (leftHeight > 0) {
                pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, position, imgWidth, imgHeight);
                leftHeight -= pageHeightInImg;
                position -= pdfHeight;
                if (leftHeight > 0) {
                    pdf.addPage();
                }
            }
        }

        return pdf.output('blob');
    } catch (e) {
        console.error("PDF Generation Error", e);
        throw e;
    } finally {
        document.body.removeChild(container);
    }
};

export const generateBatchExportZip = async (orders: Order[], user: UserProfile, onProgress: (msg: string) => void): Promise<Blob> => {
    const zip = new JSZip();
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        onProgress(`正在处理订单 ${i + 1}/${orders.length}: ${order.id}...`);
        const orderFolder = zip.folder(`${order.customerName}_${order.id}`);
        if (orderFolder) {
            try {
                const contractHtml = getContractHtml(order, user);
                const contractBlob = await generatePdfFromHtml(contractHtml);
                orderFolder.file(`销售合同_${order.id}.pdf`, contractBlob);

                const drawingsHtml = getDrawingsHtml(order, user);
                const drawingsBlob = await generatePdfFromHtml(drawingsHtml);
                orderFolder.file(`生产图纸_${order.id}.pdf`, drawingsBlob);
            } catch (e) { console.error(`Failed to export order ${order.id}`, e); }
        }
    }
    onProgress("正在打包压缩文件...");
    return await zip.generateAsync({ type: "blob" });
};

// New Async Print functions that reuse the PDF generation logic (Solving the cut-off issue)
export const printOrderContract = async (order: Order, user: UserProfile): Promise<void> => {
    try {
        const html = getContractHtml(order, user);
        const blob = await generatePdfFromHtml(html);
        openBlobPdf(blob, `销售合同_${order.id}.pdf`);
    } catch (e) {
        console.error("Print Error", e);
        alert("生成 PDF 失败，请重试");
    }
};

export const printOrderDrawings = async (order: Order, user: UserProfile): Promise<void> => {
    try {
        const html = getDrawingsHtml(order, user);
        const blob = await generatePdfFromHtml(html);
        openBlobPdf(blob, `生产图纸_${order.id}.pdf`);
    } catch (e) {
        console.error("Print Error", e);
        alert("生成 PDF 失败，请重试");
    }
};

// ==========================================
// 3. Avatar Helper Functions
// ==========================================
export const getAvatarInitial = (name: string): string => {
    return name ? name.charAt(0).toUpperCase() : '?';
};

export const getAvatarStyle = (): string => {
    return 'bg-gradient-to-br from-slate-600 via-slate-800 to-slate-900 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800';
};