/**
 * Report Export Module
 * Handles Word and PDF report generation
 */

class ReportExporter {
    constructor() {
        this.companyInfo = {
            name: '新能源二手车检测中心',
            address: '北京市朝阳区xx路xx号',
            phone: '400-xxx-xxxx',
            email: 'service@example.com'
        };
    }
    
    // Generate Word report as HTML that can be saved as .doc
    generateWordReport(data) {
        const { vehicleInfo, pointsData, summary } = data;
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>新能源二手车检测报告</title>
    <style>
        body {
            font-family: "Microsoft YaHei", SimSun, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 24pt;
            color: #0066cc;
            margin-bottom: 10px;
        }
        .company-info {
            font-size: 10pt;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #0066cc;
            border-left: 4px solid #0066cc;
            padding-left: 10px;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .info-table td:first-child {
            width: 25%;
            background-color: #f9f9f9;
            font-weight: bold;
        }
        .score-box {
            text-align: center;
            padding: 20px;
            background-color: #f0f8ff;
            border: 2px solid #0066cc;
            border-radius: 8px;
            margin: 20px 0;
        }
        .score-value {
            font-size: 36pt;
            font-weight: bold;
            color: #0066cc;
        }
        .grade-value {
            font-size: 18pt;
            color: #ff6600;
            margin-left: 15px;
        }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-danger { color: #dc3545; }
        .issue-item {
            margin-bottom: 10px;
            padding: 10px;
            background-color: #fff8f0;
            border-left: 3px solid #ff6600;
        }
        .issue-title {
            font-weight: bold;
            color: #333;
        }
        .issue-desc {
            color: #666;
            margin-top: 5px;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 10pt;
            color: #999;
        }
        .signature-area {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
        }
        .signature-line {
            border-bottom: 1px solid #333;
            height: 40px;
            margin-bottom: 5px;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>新能源二手车检测报告</h1>
        <div class="company-info">
            ${this.companyInfo.name} | 电话: ${this.companyInfo.phone} | 地址: ${this.companyInfo.address}
        </div>
    </div>

    <div class="section">
        <div class="section-title">一、检测基本信息</div>
        <table class="info-table">
            <tr>
                <td>报告编号</td>
                <td>EV${Date.now().toString().slice(-10)}</td>
                <td>检测日期</td>
                <td>${vehicleInfo.inspectionDate}</td>
            </tr>
            <tr>
                <td>车辆型号</td>
                <td>${vehicleInfo.model}</td>
                <td>VIN码</td>
                <td>${vehicleInfo.vin}</td>
            </tr>
            <tr>
                <td>车牌号码</td>
                <td>${vehicleInfo.plate || '未上牌'}</td>
                <td>行驶里程</td>
                <td>${vehicleInfo.mileage.toLocaleString()} km</td>
            </tr>
            <tr>
                <td>注册日期</td>
                <td>${vehicleInfo.regDate || '-'}</td>
                <td>检测师</td>
                <td>${vehicleInfo.inspector || '-'}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">二、综合评估</div>
        <div class="score-box">
            <span class="score-value">${summary.score}分</span>
            <span class="grade-value">${summary.grade.grade} (${summary.grade.level}级)</span>
            <div style="margin-top: 15px;">
                发现问题: ${summary.totalIssues}处 | 
                修复预估: ¥${summary.totalCost.toLocaleString()}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">三、漆面检测结果</div>
        <table>
            <thead>
                <tr>
                    <th>检测部位</th>
                    <th>状态</th>
                    <th>问题数量</th>
                    <th>备注</th>
                </tr>
            </thead>
            <tbody>
                ${this.generatePointsTableRows(pointsData)}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">四、问题详情</div>
        ${this.generateIssuesList(pointsData)}
    </div>

    <div class="section">
        <div class="section-title">五、检测结论</div>
        <p>经检测，该车辆${this.generateConclusion(summary)}</p>
        ${vehicleInfo.notes ? `<p style="margin-top: 15px;"><strong>备注:</strong> ${vehicleInfo.notes}</p>` : ''}
    </div>

    <div class="signature-area">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div>检测师签字</div>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div>审核签字</div>
        </div>
    </div>

    <div class="footer">
        <p>本检测报告仅供参考，实际车况以现场查验为准</p>
        <p>${this.companyInfo.name} © ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;
        
        return html;
    }
    
    generatePointsTableRows(pointsData) {
        return Object.values(pointsData).map(point => {
            const statusClass = point.status === 'good' ? 'status-good' : 
                               point.status === 'warning' ? 'status-warning' : 'status-danger';
            const statusText = point.status === 'good' ? '正常' : 
                              point.status === 'warning' ? '需注意' : '异常';
            
            return `
                <tr>
                    <td>${point.name}</td>
                    <td class="${statusClass}">${statusText}</td>
                    <td>${point.issues.length}处</td>
                    <td>${point.issues.length > 0 ? point.issues.map(i => InspectionDataManager.getIssueTypeLabel(i.type)).join(', ') : '-'}</td>
                </tr>
            `;
        }).join('');
    }
    
    generateIssuesList(pointsData) {
        const allIssues = [];
        Object.values(pointsData).forEach(point => {
            point.issues.forEach(issue => {
                allIssues.push({
                    ...issue,
                    pointName: point.name
                });
            });
        });
        
        if (allIssues.length === 0) {
            return '<p>未发现问题</p>';
        }
        
        return allIssues.map((issue, index) => {
            const severityText = InspectionDataManager.getSeverityLabel(issue.severity);
            const typeText = InspectionDataManager.getIssueTypeLabel(issue.type);
            
            return `
                <div class="issue-item">
                    <div class="issue-title">${index + 1}. ${issue.pointName} - ${typeText} (${severityText})</div>
                    <div class="issue-desc">
                        ${issue.description}<br>
                        ${issue.suggestion ? `<strong>建议:</strong> ${issue.suggestion}<br>` : ''}
                        ${issue.cost ? `<strong>预估费用:</strong> ¥${issue.cost}` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    generateConclusion(summary) {
        if (summary.score >= 90) {
            return '整体车况优秀，漆面保养良好，仅有轻微使用痕迹，建议购买。';
        } else if (summary.score >= 80) {
            return '整体车况良好，漆面有轻微瑕疵，经修复后可恢复良好状态。';
        } else if (summary.score >= 70) {
            return '整体车况一般，漆面存在若干问题，建议酌情考虑并预留修复费用。';
        } else {
            return '车况较差，漆面问题较多，建议谨慎购买或大幅议价。';
        }
    }
    
    // Download Word report
    downloadWordReport(data, filename = null) {
        const html = this.generateWordReport(data);
        const blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `检测报告_${data.vehicleInfo.model}_${Date.now()}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    // Generate PDF report using jsPDF
    async generatePDFReport(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        const { vehicleInfo, summary } = data;
        
        // Set font
        doc.setFont('helvetica');
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 102, 204);
        doc.text('新能源二手车检测报告', 105, 20, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`${this.companyInfo.name} | 电话: ${this.companyInfo.phone}`, 105, 28, { align: 'center' });
        
        // Line under header
        doc.setDrawColor(0, 102, 204);
        doc.setLineWidth(0.5);
        doc.line(20, 32, 190, 32);
        
        // Section 1: Basic Info
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.text('一、检测基本信息', 20, 42);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        const infoData = [
            ['报告编号', `EV${Date.now().toString().slice(-10)}`, '检测日期', vehicleInfo.inspectionDate],
            ['车辆型号', vehicleInfo.model, 'VIN码', vehicleInfo.vin],
            ['车牌号码', vehicleInfo.plate || '未上牌', '行驶里程', `${vehicleInfo.mileage.toLocaleString()} km`],
            ['注册日期', vehicleInfo.regDate || '-', '检测师', vehicleInfo.inspector || '-']
        ];
        
        let y = 50;
        infoData.forEach(row => {
            doc.setFillColor(240, 240, 240);
            doc.rect(20, y - 4, 170, 8, 'F');
            doc.setFont('helvetica', 'bold');
            doc.text(row[0], 22, y);
            doc.setFont('helvetica', 'normal');
            doc.text(row[1], 55, y);
            doc.setFont('helvetica', 'bold');
            doc.text(row[2], 100, y);
            doc.setFont('helvetica', 'normal');
            doc.text(row[3], 135, y);
            y += 10;
        });
        
        // Section 2: Score
        y += 5;
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.text('二、综合评估', 20, y);
        
        y += 10;
        // Score box
        doc.setDrawColor(0, 102, 204);
        doc.setLineWidth(0.3);
        doc.roundedRect(40, y - 8, 130, 30, 3, 3, 'S');
        doc.setFillColor(240, 248, 255);
        doc.roundedRect(40, y - 8, 130, 30, 3, 3, 'F');
        
        doc.setFontSize(24);
        doc.setTextColor(0, 102, 204);
        doc.text(`${summary.score}分`, 75, y + 10, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(255, 102, 0);
        doc.text(`${summary.grade.grade} (${summary.grade.level}级)`, 125, y + 10);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`发现问题: ${summary.totalIssues}处    修复预估: ¥${summary.totalCost.toLocaleString()}`, 105, y + 22, { align: 'center' });
        
        // Section 3: Paint Inspection
        y += 40;
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.text('三、漆面检测结果摘要', 20, y);
        
        y += 10;
        doc.setFontSize(9);
        
        const pointsSummary = this.getPointsSummary(data.pointsData);
        doc.text(`正常: ${pointsSummary.good}处  |  需注意: ${pointsSummary.warning}处  |  异常: ${pointsSummary.danger}处`, 20, y);
        
        // Section 4: Issues
        y += 15;
        if (y > 220) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.text('四、问题详情', 20, y);
        
        y += 10;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        const allIssues = this.getAllIssuesList(data.pointsData);
        
        if (allIssues.length === 0) {
            doc.text('未发现问题', 20, y);
        } else {
            allIssues.slice(0, 10).forEach((issue, index) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                
                const typeText = InspectionDataManager.getIssueTypeLabel(issue.type);
                const severityText = InspectionDataManager.getSeverityLabel(issue.severity);
                
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${issue.pointName} - ${typeText} (${severityText})`, 20, y);
                y += 6;
                
                doc.setFont('helvetica', 'normal');
                const descLines = doc.splitTextToSize(issue.description, 170);
                doc.text(descLines, 25, y);
                y += descLines.length * 4 + 2;
                
                if (issue.suggestion) {
                    doc.text(`建议: ${issue.suggestion}`, 25, y);
                    y += 5;
                }
                
                y += 3;
            });
        }
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`第 ${i} 页 / 共 ${pageCount} 页`, 105, 287, { align: 'center' });
            doc.text('本检测报告仅供参考，实际车况以现场查验为准', 105, 292, { align: 'center' });
        }
        
        return doc;
    }
    
    getPointsSummary(pointsData) {
        const summary = { good: 0, warning: 0, danger: 0 };
        Object.values(pointsData).forEach(point => {
            summary[point.status] = (summary[point.status] || 0) + 1;
        });
        return summary;
    }
    
    getAllIssuesList(pointsData) {
        const issues = [];
        Object.values(pointsData).forEach(point => {
            point.issues.forEach(issue => {
                issues.push({ ...issue, pointName: point.name });
            });
        });
        return issues;
    }
    
    // Download PDF report
    async downloadPDFReport(data, filename = null) {
        const doc = await this.generatePDFReport(data);
        doc.save(filename || `检测报告_${data.vehicleInfo.model}_${Date.now()}.pdf`);
    }
    
    // Export JSON data
    downloadJSON(data, filename = null) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `检测数据_${data.vehicleInfo.model}_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    // Load JSON data
    loadJSONFile(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                callback(null, data);
            } catch (err) {
                callback(err, null);
            }
        };
        reader.onerror = (err) => callback(err, null);
        reader.readAsText(file);
    }
}

// Make available globally
window.ReportExporter = ReportExporter;
