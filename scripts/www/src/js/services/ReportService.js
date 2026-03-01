/**
 * Report Service - Export functionality
 * Fixes: Async handling, error handling
 */

class ReportService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.companyInfo = {
            name: '新能源二手车检测中心',
            address: '北京市朝阳区xxx路xxx号',
            phone: '400-xxx-xxxx',
            email: 'service@example.com'
        };
    }

    // Ensure libraries are loaded
    async ensureLibs() {
        const libs = [];
        
        if (!window.html2canvas) {
            libs.push(this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'));
        }
        if (!window.jspdf) {
            libs.push(this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
        }
        
        if (libs.length > 0) {
            await Promise.all(libs);
        }
    }

    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Export Word report (HTML)
    exportWord(data) {
        try {
            const html = this.generateWordHTML(data);
            const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
            this.downloadBlob(blob, `检测报告_${data.vehicleInfo?.vin || 'unknown'}.doc`);
            this.eventBus.emit(Events.EXPORT_COMPLETE, 'word');
            return true;
        } catch (error) {
            console.error('Word export failed:', error);
            return false;
        }
    }

    // Export PDF report
    async exportPDF(data) {
        try {
            await this.ensureLibs();
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            this.generatePDFContent(doc, data);
            
            doc.save(`检测报告_${data.vehicleInfo?.vin || 'unknown'}.pdf`);
            this.eventBus.emit(Events.EXPORT_COMPLETE, 'pdf');
            return true;
        } catch (error) {
            console.error('PDF export failed:', error);
            return false;
        }
    }

    // Export JSON data
    exportJSON(data) {
        try {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
            this.downloadBlob(blob, `检测数据_${data.vehicleInfo?.vin || 'unknown'}.json`);
            return true;
        } catch (error) {
            console.error('JSON export failed:', error);
            return false;
        }
    }

    generateWordHTML(data) {
        const summary = data.summary;
        const vehicle = data.vehicleInfo;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>检测报告</title>
    <style>
        body { font-family: 'SimSun', serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 24px; margin-bottom: 10px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 16px; border-bottom: 1px solid #333; padding-bottom: 5px; }
        .info-row { display: flex; margin: 8px 0; }
        .info-label { width: 120px; font-weight: bold; }
        .score { font-size: 36px; font-weight: bold; color: #2ecc71; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>新能源二手车检测报告</h1>
        <p>检测日期：${vehicle?.inspectionDate || '-'}</p>
    </div>
    
    <div class="section">
        <h2>车辆信息</h2>
        <div class="info-row">
            <span class="info-label">车型：</span>
            <span>${vehicle?.model || '-'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">VIN：</span>
            <span>${vehicle?.vin || '-'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">里程：</span>
            <span>${vehicle?.mileage || 0} km</span>
        </div>
    </div>
    
    <div class="section">
        <h2>检测结果</h2>
        <div class="info-row">
            <span class="info-label">综合评分：</span>
            <span class="score">${summary?.score || 0}分</span>
        </div>
        <div class="info-row">
            <span class="info-label">车况等级：</span>
            <span>${summary?.grade?.grade || '-'} (${summary?.grade?.level || '-'}级)</span>
        </div>
        <div class="info-row">
            <span class="info-label">发现问题：</span>
            <span>${summary?.totalIssues || 0}处</span>
        </div>
        <div class="info-row">
            <span class="info-label">修复预估：</span>
            <span>¥${(summary?.totalCost || 0).toLocaleString()}</span>
        </div>
    </div>
    
    <div class="section">
        <h2>问题详情</h2>
        <table>
            <tr>
                <th>检测部位</th>
                <th>问题类型</th>
                <th>严重程度</th>
                <th>修复费用</th>
            </tr>
            ${this.generateIssuesRows(data.issues)}
        </table>
    </div>
</body>
</html>`;
    }

    generateIssuesRows(issues) {
        if (!issues || issues.length === 0) {
            return '<tr><td colspan="4" style="text-align:center">无问题记录</td></tr>';
        }
        
        return issues.map(issue => `
            <tr>
                <td>${issue.pointName || '-'}</td>
                <td>${DataService.getIssueTypeLabel(issue.type)}</td>
                <td>${DataService.getSeverityLabel(issue.severity)}</td>
                <td>¥${(issue.cost || 0).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    generatePDFContent(doc, data) {
        const summary = data.summary;
        const vehicle = data.vehicleInfo;
        
        // Header
        doc.setFontSize(20);
        doc.text('新能源二手车检测报告', 105, 20, { align: 'center' });
        
        // Vehicle Info
        doc.setFontSize(14);
        doc.text('车辆信息', 20, 40);
        doc.setFontSize(10);
        doc.text(`车型：${vehicle?.model || '-'}`, 20, 50);
        doc.text(`VIN：${vehicle?.vin || '-'}`, 20, 58);
        doc.text(`里程：${vehicle?.mileage || 0} km`, 20, 66);
        doc.text(`检测日期：${vehicle?.inspectionDate || '-'}`, 20, 74);
        
        // Results
        doc.setFontSize(14);
        doc.text('检测结果', 20, 90);
        doc.setFontSize(10);
        doc.text(`综合评分：${summary?.score || 0}分`, 20, 100);
        doc.text(`车况等级：${summary?.grade?.grade || '-'} (${summary?.grade?.level || '-'}级)`, 20, 108);
        doc.text(`发现问题：${summary?.totalIssues || 0}处`, 20, 116);
        doc.text(`修复预估：¥${(summary?.totalCost || 0).toLocaleString()}`, 20, 124);
        
        // Issues table
        if (data.issues && data.issues.length > 0) {
            doc.setFontSize(14);
            doc.text('问题详情', 20, 140);
            
            const headers = ['检测部位', '问题类型', '严重程度', '费用'];
            const rows = data.issues.map(i => [
                i.pointName || '-',
                DataService.getIssueTypeLabel(i.type),
                DataService.getSeverityLabel(i.severity),
                `¥${(i.cost || 0).toLocaleString()}`
            ]);
            
            doc.autoTable({
                head: [headers],
                body: rows,
                startY: 145,
                theme: 'grid',
                styles: { fontSize: 9 },
                headStyles: { fillColor: [52, 152, 219] }
            });
        }
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ReportService };
} else {
    window.ReportService = ReportService;
}
